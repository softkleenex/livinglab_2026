from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, Store, Region
from app.core.engine import engine
from app.core.websocket import manager
from app.services.gemini_ai import model
from app.services.google_drive import get_drive_service, get_or_create_drive_folder
from googleapiclient.http import MediaIoBaseUpload
import io
import datetime
import os
import traceback
import json
import hashlib
import asyncio
import google.generativeai as genai
import typing_extensions as typing

router = APIRouter()

FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID")

class ChatPayload(BaseModel):
    path: str
    industry: str
    message: str
    selected_hashes: list[str] = []

class ChatActionResponse(typing.TypedDict):
    action_type: str
    target_hash: str
    new_text: str

@router.post("")
async def chat_with_copilot(payload: ChatPayload, db: Session = Depends(get_db)):
    path_list = [p for p in payload.path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found")
    
    parent_obj = engine.get_object(db, path_list[:-1]) if len(path_list) > 1 else engine.get_object(db, ["전체 (Root)"])
    parent_avg = parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1))
    
    entries = obj.get("data_entries", [])
    
    selected_entries = [e for e in entries if e.get("hash") in payload.selected_hashes]
    history_text = ""
    for e in selected_entries:
        history_text += f"- [해시: {e['hash'][:8]}] {e['timestamp']}: {e['raw_text']}\n"
    
    current_value = obj["metadata"].get("total_value", 0)
    current_pulse = obj["metadata"].get("pulse_rate", 0)
    
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
    chat_model = genai.GenerativeModel(model_name)

    # --- Step 1: Intent Parsing (No Persona) ---
    intent_prompt = f"""
    당신은 텍스트 파서입니다.
    사용자의 질문: "{payload.message}"
    선택된 해시 목록: {[e['hash'][:8] for e in selected_entries]}
    
    지시사항:
    - 삭제 요구 시 action_type="DELETE", target_hash 기입
    - 생성 요구 시 action_type="CREATE", new_text 기입
    - 수정 요구 시 action_type="MODIFY", target_hash 및 new_text 기입
    - 질문이나 일반 대화 시 action_type="NONE"
    """

    try:
        res = chat_model.generate_content(
            intent_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=ChatActionResponse
            )
        )
        
        reply_data = json.loads(res.text)
        action_type = reply_data.get("action_type", "NONE")
        
        reply = ""
        
        if action_type == "NONE":
            # Normal conversational reply
            chat_prompt = f"""
            당신은 '{obj['name']}' ({payload.industry})의 전담 AI 비서(MDGA Copilot) 입니다.
            - 누적 매출/생산 가치: {current_value}원 (상권 평균: {parent_avg}원)
            - 사업장 활성도: {current_pulse} BPM
            
            [선택된 데이터 파일 목록]
            {history_text if history_text else "선택된 데이터가 없습니다."}
            
            사용자의 질문: "{payload.message}"
            위 데이터를 바탕으로 전문적으로 2~3문장으로 조언해주세요.
            """
            reply = chat_model.generate_content(chat_prompt).text
            
        elif action_type == "DELETE":
            target_hash = reply_data.get("target_hash", "")
            entry_to_del = db.query(DataEntry).filter(DataEntry.hash_val.startswith(target_hash), DataEntry.location_path.like(f"{payload.path}%")).first()
            if entry_to_del:
                penalty = -entry_to_del.effective_value
                del_path_list = [p for p in entry_to_del.location_path.split("/") if p]
                db.delete(entry_to_del)
                db.commit()
                engine.add_value_bottom_up(db, del_path_list, penalty)
                asyncio.create_task(manager.broadcast({"type": "update", "path": del_path_list, "value_added": penalty, "pulse_rate": current_pulse}))
                reply = f"✨ [시스템] 선택하신 데이터(해시: {target_hash[:8]})가 성공적으로 삭제 및 롤백되었습니다."
            else:
                reply = f"⚠️ [시스템] 삭제할 데이터(해시: {target_hash[:8]})를 찾을 수 없습니다."

        elif action_type == "MODIFY":
            target_hash = reply_data.get("target_hash", "")
            new_text = reply_data.get("new_text", "")
            entry_to_mod = db.query(DataEntry).filter(DataEntry.hash_val.startswith(target_hash), DataEntry.location_path.like(f"{payload.path}%")).first()
            if entry_to_mod:
                entry_to_mod.raw_text = new_text
                db.commit()
                reply = f"✨ [시스템] 데이터가 성공적으로 수정되었습니다."
            else:
                reply = f"⚠️ [시스템] 수정할 데이터를 찾을 수 없습니다."
                
        elif action_type == "CREATE":
            new_text = reply_data.get("new_text", "")
            new_hash = hashlib.sha256(new_text.encode()).hexdigest()
            
            parent_id = None
            for i, p in enumerate(path_list[:-1]):
                r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
                if r: parent_id = r.id
                else: break
            store = db.query(Store).filter(Store.name == path_list[-1], Store.region_id == parent_id).first()

            val_added = 100000
            new_entry = DataEntry(
                location_path=payload.path,
                store_id=store.id if store else None,
                industry=payload.industry,
                is_guest=0,
                raw_text=new_text,
                insights="AI 챗봇을 통해 시스템에서 자동 생성된 데이터입니다.",
                trust_index=95.0,
                effective_value=val_added,
                hash_val=new_hash
            )
            db.add(new_entry)
            db.commit()
            engine.add_value_bottom_up(db, path_list, val_added)
            asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": val_added, "pulse_rate": current_pulse}))
            reply = f"✨ [시스템] 새로운 데이터가 성공적으로 추가 및 자산화되었습니다."
            
        # Save consultation log to Data Lake (Google Drive -> generated folder)
        try:
            drive_service = get_drive_service()
            if drive_service:
                current_folder_id = FOLDER_ID
                for p in path_list:
                    current_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, p)

                generated_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "generated")
                now_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                
                log_content = f"--- MDGA AI COPILOT LOG ---\nTime: {now_str}\nTarget: {'/'.join(path_list)}\n\n[Query]\n{payload.message}\n\n[Response]\n{reply}\n"
                
                txt_metadata = {'name': f"Copilot_Log_{now_str}.txt", 'parents': [generated_folder_id]}
                txt_media = MediaIoBaseUpload(io.BytesIO(log_content.encode('utf-8')), mimetype='text/plain', resumable=True)
                drive_service.files().create(body=txt_metadata, media_body=txt_media, fields='id', supportsAllDrives=True).execute()
        except Exception as drive_err:
            print("Failed to save Copilot log to Drive:", drive_err)
            
    except Exception:
        traceback.print_exc()
        reply = "죄송합니다. 현재 네트워크 문제로 답변을 드릴 수 없습니다."
        
    return {"status": "success", "reply": reply}