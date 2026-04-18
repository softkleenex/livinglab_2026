from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.engine import engine
from app.services.gemini_ai import model
from app.services.google_drive import get_drive_service, get_or_create_drive_folder
from googleapiclient.http import MediaIoBaseUpload
import io
import datetime
import os
import traceback

router = APIRouter()

FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID")

class ChatPayload(BaseModel):
    path: str
    industry: str
    message: str

@router.post("")
async def chat_with_copilot(payload: ChatPayload):
    path_list = [p for p in payload.path.split("/") if p]
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found")
    
    parent_obj = engine.get_object(path_list[:-1]) if len(path_list) > 1 else engine.db
    parent_avg = parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1))
    
    entries = obj.get("data_entries", [])
    history_text = "\n".join([f"- {e['timestamp']}: {e['insights']}" for e in entries[-5:]]) if entries else "아직 데이터가 없습니다."
    
    current_value = obj["metadata"].get("total_value", 0)
    current_pulse = obj["metadata"].get("pulse_rate", 0)
    
    prompt = f"""
    당신은 '{obj['name']}' ({payload.industry})의 전담 AI 비서(MDGA Copilot)입니다.
    
    [실시간 사업장 현황]
    - 누적 매출/생산 가치: {current_value}원 (상권 평균: {parent_avg}원)
    - 사업장 활성도: {current_pulse} BPM
    
    [최근 데이터 피딩 기록]
    {history_text}
    
    사용자의 질문: "{payload.message}"
    
    위의 구체적인 수치 데이터와 기록을 반드시 인용하면서, 사용자에게 친절하고 전문적으로 2~3문장 내외로 답변해주세요. 
    만약 데이터와 무관한 질문이라도 산업군에 맞는 조언을 추가해주세요.
    """
    try:
        res = model.generate_content(prompt)
        reply = res.text
        
        # Save consultation log to Data Lake (Google Drive -> generated folder)
        try:
            drive_service = get_drive_service()
            if drive_service:
                current_folder_id = FOLDER_ID
                for p in path_list:
                    current_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, p)

                generated_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "generated")
                now_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                
                log_content = f"--- MDGA AI COPILOT CONSULTATION LOG ---\nTime: {now_str}\nTarget: {'/'.join(path_list)}\nIndustry: {payload.industry}\n\n[User Query]\n{payload.message}\n\n[AI Response]\n{reply}\n"
                
                txt_metadata = {'name': f"Copilot_Log_{now_str}.txt", 'parents': [generated_folder_id]}
                txt_media = MediaIoBaseUpload(io.BytesIO(log_content.encode('utf-8')), mimetype='text/plain', resumable=True)
                drive_service.files().create(body=txt_metadata, media_body=txt_media, fields='id', supportsAllDrives=True).execute()
        except Exception as drive_err:
            print("Failed to save Copilot log to Drive:", drive_err)
            
    except Exception:
        traceback.print_exc()
        reply = "죄송합니다. 현재 네트워크 문제로 답변을 드릴 수 없습니다."
        
    return {"status": "success", "reply": reply}

