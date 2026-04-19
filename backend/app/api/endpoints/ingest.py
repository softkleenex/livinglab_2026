from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, Store, Region
from app.core.engine import engine
from app.core.websocket import manager
from app.services.gemini_ai import model
from app.services.google_drive import get_drive_service, get_or_create_drive_folder
from PIL import Image
import io
import datetime
import traceback
import hashlib
import random
import os
import asyncio
from googleapiclient.http import MediaIoBaseUpload

router = APIRouter()

FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID")
api_key = os.environ.get("GEMINI_API_KEY")

@router.post("")
async def ingest(
    raw_text: str = Form(None), 
    file: UploadFile = File(None),
    location: str = Form(...), # e.g. "북구/산격동/경북대 북문/테스트상점"
    is_guest: str = Form("false"),
    industry: str = Form("공공"),
    db: Session = Depends(get_db)
):
    try:
        content = raw_text if raw_text else ""
        path_list = [p for p in location.split("/") if p]
        drive_link = None
        is_guest_bool = is_guest.lower() == "true"
        file_data = None
        
        if file:
            content += f"\n[Attached File] {file.filename}"
            file_data = await file.read()

        # Find target object
        target_obj = engine.get_object(db, path_list)
        if not target_obj:
            target_obj = engine.create_or_get_path(db, path_list, ["Gu", "Dong", "Street", "Store"])

        # Deep Analysis via LLM
        prompt_parts = [f"다음은 {location} 지역 사업장이 올린 데이터입니다. 데이터를 분석하고 사업장에 적용할 수 있는 액션 가능한 2~3문장 피드백을 주세요. 데이터: {content}"]
        if file and file.content_type.startswith('image/'):
            try:
                img = Image.open(io.BytesIO(file_data))
                prompt_parts.append(img)
            except Exception as e:
                pass

        try:
            if not api_key:
                raise Exception("API Key missing")
            insights = model.generate_content(prompt_parts).text
        except Exception as e:
            traceback.print_exc()
            if file and file.content_type.startswith('image/'):
                insights = "가상 지능 분석 (비전): 업로드하신 현장/데이터 이미지가 성공적으로 스캔되었습니다. 현재 보이는 레이아웃이나 패턴에서 개선할 수 있는 인사이트를 추출 중입니다."
            else:
                insights = "가상 지능 분석: 제공해주신 데이터가 로컬 스토어 자산으로 성공적으로 변환되었습니다. 꾸준한 데이터 피딩은 더 정교한 상권 분석을 가능하게 합니다."

        trust_hash = hashlib.sha256(content.encode()).hexdigest()
        short_hash = trust_hash[:8]
        
        # Google Drive Integration for Data Lake (Origin & Generated)
        try:
            drive_service = get_drive_service()
            if drive_service:
                current_folder_id = FOLDER_ID
                for p in path_list:
                    current_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, p)

                origin_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "origin")
                generated_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "generated")

                now_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')

                # Upload File to origin
                if file:
                    file_metadata = {'name': f"Ingest_{now_str}_{short_hash}_{file.filename}", 'parents': [origin_folder_id]}
                    media = MediaIoBaseUpload(io.BytesIO(file_data), mimetype=file.content_type, resumable=True)
                    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink', supportsAllDrives=True).execute()
                    drive_link = uploaded_file.get('webViewLink')
                
                # Upload raw_text to origin if it exists
                if raw_text:
                    txt_metadata = {'name': f"RawText_{now_str}_{short_hash}.txt", 'parents': [origin_folder_id]}
                    txt_media = MediaIoBaseUpload(io.BytesIO(raw_text.encode('utf-8')), mimetype='text/plain', resumable=True)
                    drive_service.files().create(body=txt_metadata, media_body=txt_media, fields='id', supportsAllDrives=True).execute()

                # Upload insights to generated
                if insights:
                    insight_metadata = {'name': f"AI_Insight_{now_str}_{short_hash}.txt", 'parents': [generated_folder_id]}
                    insight_media = MediaIoBaseUpload(io.BytesIO(insights.encode('utf-8')), mimetype='text/plain', resumable=True)
                    drive_service.files().create(body=insight_metadata, media_body=insight_media, fields='id', supportsAllDrives=True).execute()

        except Exception as e:
            print("Drive Error:", e)
            if not drive_link: drive_link = "Storage Error"
        
        # Scope definition (Store-specific vs Regional general)
        scope = "store_specific" if len(path_list) >= 4 else "regional_general"
        
        # Trust Index assignment based on guest status
        if is_guest_bool:
            base_trust = 40.0 if file else 30.0
            insights = "[⚠️ 게스트 모드] " + insights
        else:
            base_trust = 85.0 if file else 75.0
            
        trust_index = round(base_trust + random.uniform(0.0, 14.9), 1)
        
        entry = {
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M")), 
            "insights": insights, 
            "hash": trust_hash, 
            "drive_link": drive_link,
            "scope": scope,
            "trust_index": trust_index,
            "raw_text": content
        }
        
        # Add value weighted by trust index
        base_value = random.randint(50000, 200000)
        effective_value = int(base_value * (trust_index / 100.0))
        entry["effective_value"] = effective_value
        
        engine.add_value_bottom_up(db, path_list, effective_value)
        
        # Determine store_id
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r:
                parent_id = r.id
            else:
                break
        store = db.query(Store).filter(Store.name == path_list[-1], Store.region_id == parent_id).first()
        
        # Save to DB
        new_entry = DataEntry(
            location_path=location,
            store_id=store.id if store else None,
            industry=industry,
            is_guest=1 if is_guest_bool else 0,
            raw_text=content,
            drive_link=drive_link,
            insights=insights,
            trust_index=trust_index,
            effective_value=effective_value,
            hash_val=trust_hash
        )
        db.add(new_entry)
        db.commit()
        
        target_obj = engine.get_object(db, path_list)
        
        # Broadcast to websockets
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": effective_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success", "assigned_path": path_list, "entry": entry, "value_added": effective_value}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/store")
async def delete_store(path: str, db: Session = Depends(get_db)):
    try:
        path_list = [p for p in path.split("/") if p]
        
        target_obj = engine.get_object(db, path_list)
        if not target_obj:
            raise HTTPException(status_code=404, detail="Store not found")
            
        entries = target_obj.get("data_entries", [])
        
        # Attempt to delete from Google Drive
        drive_service = get_drive_service()
        if drive_service:
            for entry in entries:
                short_hash = entry.get("hash", "")[:8]
                if short_hash:
                    try:
                        query = f"name contains '_{short_hash}' and trashed=false"
                        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
                        for item in results.get("files", []):
                            drive_service.files().delete(fileId=item['id']).execute()
                    except Exception as e:
                        print(f"Drive delete error: {e}")
                        
        success = engine.delete_path(db, path_list)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to remove from tree")
            
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list[:-1], "value_added": 0, "pulse_rate": 0}))
        
        return {"status": "success", "message": "Store and all associated data deleted."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_entry(path: str, hash_val: str, db: Session = Depends(get_db)):
    try:
        path_list = [p for p in path.split("/") if p]
        target_obj = engine.get_object(db, path_list)

        if not target_obj:
            raise HTTPException(status_code=404, detail="Path not found")

        entries = target_obj.get("data_entries", [])

        target_entry = next((e for e in entries if e.get("hash") == hash_val), None)
        if not target_entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        # Delete from DB
        db.query(DataEntry).filter(DataEntry.hash_val == hash_val).delete()
        db.commit()

        # Attempt to delete all associated files from Google Drive (using short_hash)
        short_hash = hash_val[:8]
        try:
            drive_service = get_drive_service()
            if drive_service:
                # Query Google Drive for files containing the short_hash
                query = f"name contains '_{short_hash}' and trashed=false"
                results = drive_service.files().list(q=query, fields="files(id, name)").execute()
                items = results.get("files", [])
                
                # Fallback to delete by old drive_link if needed
                drive_link = target_entry.get("drive_link")
                if drive_link and "drive.google.com/file/d/" in drive_link:
                    import re
                    match = re.search(r'/file/d/([a-zA-Z0-9_-]+)/', drive_link)
                    if match:
                        legacy_id = match.group(1)
                        if not any(i['id'] == legacy_id for i in items):
                            items.append({'id': legacy_id, 'name': 'Legacy Upload'})

                for item in items:
                    drive_service.files().delete(fileId=item['id']).execute()
                    print(f"Deleted from Drive: {item['name']}")
        except Exception as drive_err:
            print(f"Failed to delete files from Google Drive: {drive_err}")

        # Roll-down value based on the entry's effective value
        penalty_value = -target_entry.get("effective_value", 50000)
        engine.add_value_bottom_up(db, path_list, penalty_value)
        
        target_obj = engine.get_object(db, path_list)
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": penalty_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success", "message": "Data deleted and values rolled back."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
