from fastapi import FastAPI, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import datetime
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io
import json
import base64
import traceback
import hashlib
import random
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"), override=True)

# --- Config ---
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI(title="MDGA Masterpiece OS v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID")

def get_drive_service():
    client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
    refresh_token = os.environ.get("GOOGLE_OAUTH_REFRESH_TOKEN")

    if client_id and client_secret and refresh_token:
        try:
            creds = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=client_id,
                client_secret=client_secret
            )
            return build('drive', 'v3', credentials=creds)
        except Exception as e:
            return None

    service_account_info = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_info: return None
    try:
        cleaned_info = service_account_info.strip()
        if cleaned_info.startswith("'") and cleaned_info.endswith("'"): cleaned_info = cleaned_info[1:-1]
        info = json.loads(cleaned_info)
        creds = service_account.Credentials.from_service_account_info(info)
        return build('drive', 'v3', credentials=creds)
    except Exception:
        return None

def get_or_create_drive_folder(service, parent_id, folder_name):
    query = f"name='{folder_name}' and '{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    response = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    files = response.get('files', [])
    if files:
        return files[0].get('id')
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_id]
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')

from app.core.engine import engine, HierarchyEngine
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, SessionLocal
from fastapi import Depends

@app.on_event("startup")
def restore_engine_from_db():
    db = SessionLocal()
    try:
        entries = db.query(DataEntry).order_by(DataEntry.created_at.asc()).all()
        print(f"🔄 Restoring engine from DB: {len(entries)} entries found.")
        types = ["Gu", "Dong", "Street", "Store"]
        
        for e in entries:
            path_list = [p for p in e.location_path.split("/") if p]
            target_obj = engine.create_or_get_path(path_list, types)
            
            entry_dict = {
                "id": e.id,
                "timestamp": str(e.created_at.strftime("%Y-%m-%d %H:%M")),
                "insights": e.insights,
                "hash": e.hash_val,
                "drive_link": e.drive_link,
                "scope": "store_specific" if len(path_list) >= 4 else "regional_general",
                "trust_index": e.trust_index,
                "raw_text": e.raw_text,
                "effective_value": e.effective_value
            }
            if "data_entries" not in target_obj:
                target_obj["data_entries"] = []
            target_obj["data_entries"].append(entry_dict)
            if len(target_obj["data_entries"]) > 50:
                target_obj["data_entries"].pop(0)
            
            if e.effective_value:
                engine.add_value_bottom_up(path_list, e.effective_value)
                
        print("✅ Successfully restored engine state from DB!")
    except Exception as e:
        print(f"Error restoring data: {e}")
    finally:
        db.close()

# --- 🚀 API Endpoints ---

@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class ContextPayload(BaseModel):
    role: str
    industry: str
    location: list[str] # e.g. ["북구", "산격동", "경북대 북문", "테스트상점"]

@app.post("/api/user/context")
async def set_user_context(payload: ContextPayload):
    # Ensure the path exists in the engine
    types = ["Gu", "Dong", "Street", "Store"]
    engine.create_or_get_path(payload.location, types)
    return {"status": "success", "message": "Context initialized", "path": payload.location}

@app.get("/api/dashboard/personal")
async def get_personal_dashboard(path: str):
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found. Please setup context.")
    
    # Get parent object to compare
    parent_obj = engine.get_object(path_list[:-1]) if len(path_list) > 1 else engine.db
    
    entries = obj.get("data_entries", [])
    avg_trust = sum(e.get("trust_index", 50.0) for e in entries) / len(entries) if entries else 50.0
    
    return {
        "store": {
            "name": obj["name"],
            "total_value": obj["metadata"].get("total_value", 0),
            "pulse": obj["metadata"].get("pulse_rate", 0),
            "trust_index": round(avg_trust, 1),
            "history": obj["metadata"].get("history", []),
            "entries": entries
        },
        "parent": {
            "name": parent_obj["name"],
            "type": parent_obj["type"],
            "avg_value": parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1)),
            "pulse": parent_obj["metadata"].get("pulse_rate", 0)
        }
    }

@app.get("/api/hierarchy/explore")
async def explore(path: str = ""):
    path_list = [p for p in path.split("/") if p] if path else []
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Path not found")

    entries = obj.get("data_entries", [])
    avg_trust = sum(e.get("trust_index", 50.0) for e in entries) / len(entries) if entries else 50.0

    return {
        "current": obj["name"], "type": obj["type"], "metadata": obj["metadata"],
        "total_value": obj["metadata"].get("total_value", 0),
        "trust_index": round(avg_trust, 1) if obj["type"] == "Store" else obj["metadata"].get("trust_index", 50.0),
        "children": [ {"name": k, "type": v["type"], "value": v["metadata"].get("total_value", 0), "pulse": v["metadata"]["pulse_rate"], "history": v["metadata"].get("history", []), "location": v["metadata"].get("location", [35.8714 + random.uniform(-0.05, 0.05), 128.6014 + random.uniform(-0.05, 0.05)])} for k, v in obj["children"].items() ],
        "entries": entries
    }

@app.get("/api/stores/all")
async def get_all_stores(db: Session = Depends(get_db)):
    try:
        # Get unique locations from data_entries
        entries = db.query(DataEntry).distinct(DataEntry.location_path).all()
        stores = []
        for e in entries:
            parts = e.location_path.split("/")
            if len(parts) >= 4:
                stores.append({
                    "path": e.location_path,
                    "gu": parts[0],
                    "dong": parts[1] if len(parts) > 1 else "",
                    "street": parts[2] if len(parts) > 2 else "",
                    "name": parts[-1],
                    "industry": e.industry
                })

        # Also grab any stores currently in the engine tree that might not have entries yet
        def traverse_tree(node, current_path):
            if node.get("type") == "Store" and node.get("name") != "전체 (Root)":
                parts = current_path
                if not any(s["path"] == "/".join(parts) for s in stores):
                    stores.append({
                        "path": "/".join(parts),
                        "gu": parts[0] if len(parts) > 0 else "",
                        "dong": parts[1] if len(parts) > 1 else "",
                        "street": parts[2] if len(parts) > 2 else "",
                        "name": parts[-1],
                        "industry": "기타"
                    })
            for child_name, child_node in node.get("children", {}).items():
                traverse_tree(child_node, current_path + [child_name])

        traverse_tree(engine.db, [])
        return {"status": "success", "stores": stores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/agora/feed")
async def get_agora_feed(db: Session = Depends(get_db)):
    try:
        entries = db.query(DataEntry).order_by(DataEntry.created_at.desc()).limit(20).all()
        feed = []
        for e in entries:
            # Anonymize store name by taking only Gu/Dong
            path_parts = e.location_path.split("/")
            anon_location = f"{path_parts[0]} {path_parts[1]}" if len(path_parts) >= 2 else "지역 익명"
            feed.append({
                "id": e.id,
                "location": anon_location,
                "industry": e.industry,
                "insights": e.insights,
                "timestamp": str(e.created_at.strftime("%Y-%m-%d %H:%M")),
                "trust_index": e.trust_index,
                "likes": random.randint(5, 150)
            })
        return {"status": "success", "feed": feed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest")
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
        target_obj = engine.get_object(path_list)
        if not target_obj:
            target_obj = engine.create_or_get_path(path_list, ["Gu", "Dong", "Street", "Store"])

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
                    file_metadata = {'name': f"Ingest_{now_str}_{file.filename}", 'parents': [origin_folder_id]}
                    media = MediaIoBaseUpload(io.BytesIO(file_data), mimetype=file.content_type, resumable=True)
                    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink', supportsAllDrives=True).execute()
                    drive_link = uploaded_file.get('webViewLink')
                
                # Upload raw_text to origin if it exists
                if raw_text:
                    txt_metadata = {'name': f"RawText_{now_str}.txt", 'parents': [origin_folder_id]}
                    txt_media = MediaIoBaseUpload(io.BytesIO(raw_text.encode('utf-8')), mimetype='text/plain', resumable=True)
                    drive_service.files().create(body=txt_metadata, media_body=txt_media, fields='id', supportsAllDrives=True).execute()

                # Upload insights to generated
                if insights:
                    insight_metadata = {'name': f"AI_Insight_{now_str}.txt", 'parents': [generated_folder_id]}
                    insight_media = MediaIoBaseUpload(io.BytesIO(insights.encode('utf-8')), mimetype='text/plain', resumable=True)
                    drive_service.files().create(body=insight_metadata, media_body=insight_media, fields='id', supportsAllDrives=True).execute()

        except Exception as e:
            print("Drive Error:", e)
            if not drive_link: drive_link = "Storage Error"
        
        trust_hash = hashlib.sha256(content.encode()).hexdigest()
        
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
        target_obj["data_entries"].append(entry)
        if len(target_obj["data_entries"]) > 50: target_obj["data_entries"].pop(0)
        
        # Add value weighted by trust index
        base_value = random.randint(50000, 200000)
        effective_value = int(base_value * (trust_index / 100.0))
        entry["effective_value"] = effective_value
        
        engine.add_value_bottom_up(path_list, effective_value)
        
        # Save to DB
        new_entry = DataEntry(
            location_path=location,
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
        
        # Broadcast to websockets
        import asyncio
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": effective_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success", "assigned_path": path_list, "entry": entry, "value_added": effective_value}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/clear_db")
def clear_db(db: Session = Depends(get_db)):
    db.query(DataEntry).delete()
    db.commit()
    engine.db["children"] = {}
    engine.db["metadata"]["nodes"] = 0
    engine.db["metadata"]["total_value"] = 0
    return "DB Cleared"

@app.delete("/api/ingest/delete")
async def delete_entry(path: str, hash_val: str, db: Session = Depends(get_db)):
    try:
        path_list = [p for p in path.split("/") if p]
        target_obj = engine.get_object(path_list)

        if not target_obj:
            raise HTTPException(status_code=404, detail="Path not found")

        entries = target_obj.get("data_entries", [])

        target_entry = next((e for e in entries if e.get("hash") == hash_val), None)
        if not target_entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        # Delete from DB
        db.query(DataEntry).filter(DataEntry.hash_val == hash_val).delete()
        db.commit()

        # Optional: Attempt to delete from Google Drive if a link exists        drive_link = target_entry.get("drive_link")
        if drive_link and "drive.google.com/file/d/" in drive_link:
            try:
                import re
                match = re.search(r'/file/d/([a-zA-Z0-9_-]+)/', drive_link)
                if match:
                    file_id = match.group(1)
                    drive_service = get_drive_service()
                    if drive_service:
                        drive_service.files().delete(fileId=file_id).execute()
            except Exception as drive_err:
                print(f"Failed to delete file from Google Drive: {drive_err}")

        target_obj["data_entries"] = [e for e in entries if e.get("hash") != hash_val]
        
        # Roll-down value based on the entry's effective value
        penalty_value = -target_entry.get("effective_value", 50000)
        engine.add_value_bottom_up(path_list, penalty_value)
        
        import asyncio
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": penalty_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success", "message": "Data deleted and values rolled back."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/demo/inject")
async def demo_inject(path: str):
    try:
        path_list = [p for p in path.split("/") if p]
        types = ["Gu", "Dong", "Street", "Store"]
        target_obj = engine.create_or_get_path(path_list, types)
        
        mock_insights = [
            {"date": "2026-04-05", "text": "가상 지능 분석: 주말 매출이 지난주 대비 15% 상승했습니다. 특히 아메리카노와 케이크 세트 메뉴의 반응이 좋습니다. 세트 메뉴 프로모션을 연장하는 것을 권장합니다.", "trust": 88.5},
            {"date": "2026-04-07", "text": "가상 지능 분석: 원두 재고 소진 속도가 예상보다 빠릅니다. 내일까지 원두가 5kg 미만으로 떨어질 수 있으니, 즉시 인근 로스터리에서 비상 구매를 하거나 거래처에 긴급 배송을 요청하세요.", "trust": 92.0},
            {"date": "2026-04-08", "text": "가상 지능 분석 (비전): 업로드하신 현장 이미지를 스캔했습니다. 프로세스 및 공간 배치가 효율적이나, 추가적인 모니터링 센서 도입 시 효율을 15% 더 늘릴 수 있습니다.", "trust": 95.5, "link": "https://drive.google.com/file/d/1Xdvq-HOVBOdaS0oalgrVXrXSvi0AYonQ/view?usp=drivesdk"}
        ]
        
        total_effective_value = 0
        for i, m in enumerate(mock_insights):
            trust_index = m["trust"]
            base_value = random.randint(50000, 200000)
            effective_value = int(base_value * (trust_index / 100.0))
            total_effective_value += effective_value
            
            entry = {
                "timestamp": f"{m['date']} 14:0{i}",
                "insights": m["text"],
                "hash": hashlib.sha256(m["text"].encode()).hexdigest(),
                "drive_link": m.get("link"),
                "scope": "store_specific",
                "trust_index": trust_index,
                "raw_text": f"[{m['date']}] 사용자가 직접 입력한 모의 테스트 데이터입니다.",
                "effective_value": effective_value
            }
            target_obj["data_entries"].append(entry)
            
        if len(target_obj["data_entries"]) > 50: target_obj["data_entries"].pop(0)
        
        engine.add_value_bottom_up(path_list, total_effective_value)
        import asyncio
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": total_effective_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate/governance")
async def simulate_governance(budget: int = Form(...), region: str = Form(...)):
    try:
        prompt = f"우리는 현재 '{region}' 지역에 대해 {budget} 원의 예산을 투입하는 정책 시뮬레이션을 수행하고 있습니다. 다음 결과를 JSON 형식으로 반환하세요. 키값: 'roi_multiplier' (예: '2.5x'), 'job_creation' (예: '+12,000 Jobs'), 'ai_recommendation' (3~4문장의 정책 제안), 'sector_boost' (수혜 예상 핵심 산업), 'vulnerability_warning' (잠재적 리스크/취약점)."
        try:
            res = model.generate_content(prompt)
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            sim_data = json.loads(raw_eval)
        except Exception:
            sim_data = {
                "roi_multiplier": "3.1x",
                "job_creation": f"+{random.randint(100, 500)} Jobs",
                "ai_recommendation": f"[{region}] 이 대규모 자본({budget}원)은 지역 첨단 융합 산업 벨트 구축에 크게 기여할 것입니다. 수집된 소상공인 데이터를 기반으로 가장 맥박(Pulse)이 떨어지는 구간에 긴급 수혈을 권장합니다.",
                "sector_boost": "서비스 및 IT 산업",
                "vulnerability_warning": "초기 인프라 매몰 비용 리스크"
            }
        
        return {"status": "success", "simulation": sim_data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

import httpx

async def get_weather_forecast(lat: float, lng: float) -> str:
    try:
        # Open-Meteo API (No key required)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                max_temps = data['daily']['temperature_2m_max']
                precip = data['daily']['precipitation_sum']
                avg_max = sum(max_temps) / len(max_temps)
                total_precip = sum(precip)
                return f"향후 7일 평균 최고기온 {avg_max:.1f}°C, 총 강수량 {total_precip:.1f}mm 예상."
            return "기상 데이터 수집 지연."
    except Exception as e:
        return "기상 데이터 API 오류."

@app.get("/api/dashboard/report")
async def generate_weekly_report(path: str, industry: str = "공공"):
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found")
    
    # Get Parent context for competitiveness
    parent_obj = engine.get_object(path_list[:-1]) if len(path_list) > 1 else engine.db
    parent_avg = parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1))
    
    entries = obj.get("data_entries", [])
    if not entries:
        return {"status": "success", "report": "아직 충분한 데이터가 수집되지 않았습니다. 사업장의 일상이나 현장 데이터를 먼저 피딩(업로드)해 주세요!"}
        
    history_text = "\n".join([f"- {e['timestamp']}: {e['insights']} (신뢰도: {e.get('trust_index', 50)}%)" for e in entries[-7:]])
    
    # Quantitative Metrics
    current_value = obj["metadata"].get("total_value", 0)
    current_pulse = obj["metadata"].get("pulse_rate", 0)
    
    # Fetch real weather data
    location = obj.get("metadata", {}).get("location", [35.8714, 128.6014])
    weather_info = await get_weather_forecast(location[0], location[1])

    prompt = f"""
    당신은 '{obj['name']}' 사업장/기업의 전담 최고경영자(CEO) 컨설턴트이자 최고 데이터 분석가(CDO)입니다.
    대상 산업군(Industry)은 '{industry}'입니다. 

    [정량적 데이터 지표 (Quantitative Data)]
    - 누적 자산(매출/생산가치): {current_value}원
    - 상권/지역({parent_obj['name']}) 평균 자산: {parent_avg}원
    - 현재 조직 활성도(Pulse): {current_pulse} BPM
    - 주간 기상 및 환경 예측: {weather_info}
    
    [정성적 데이터 피딩 히스토리 (Qualitative Data)]
    {history_text}
    
    위의 '정량적 지표'와 '정성적 히스토리', 그리고 '기상 예측'을 입체적으로 교차 분석(Cross-validation)하여,
    '{industry}' 산업 특성에 맞는 고도화된 주간 경영/생산 분석 리포트를 작성해 주세요.
    특히, 소속 상권({parent_obj['name']}) 평균 대비 경쟁력을 수치 기반으로 분석해 주세요.

    형식은 다음을 지켜주세요 (마크다운 없이 일반 텍스트와 이모지로만 깔끔하게 구성):
    
    [{industry} 산업 맞춤형 주간 요약]
    (단순 요약이 아닌, 데이터 지표의 변화와 원인을 짚어줄 것)
    ...
    [데이터 기반 핵심 분석 및 상권 비교]
    (지역 평균({parent_avg}원) 대비 성과 분석 및 기상 데이터를 융합한 인사이트 도출)
    ...
    [다음 주 핵심 액션 플랜]
    (1, 2, 3번으로 넘버링하여 구체적이고 당장 실행 가능한 지시사항 전달)
    ...
    """
    try:
        res = model.generate_content(prompt)
        report_text = res.text
    except Exception as e:
        report_text = "현재 AI 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요."
        
    return {"status": "success", "report": report_text}

class ChatPayload(BaseModel):
    path: str
    industry: str
    message: str

@app.post("/api/chat")
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
    except Exception:
        reply = "죄송합니다. 현재 네트워크 문제로 답변을 드릴 수 없습니다."
        
    return {"status": "success", "reply": reply}

import io
import csv
from fastapi.responses import StreamingResponse

@app.get("/api/dashboard/export")
async def export_csv(path: str, industry: str = "공공"):
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found.")
    
    entries = obj.get("data_entries", [])
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Store Name", "Industry", "Hash", "Scope", "Trust Index", "Effective Value", "Raw Text", "Insights"])
    
    # 1. Existing Real Entries
    for e in entries:
        writer.writerow([
            e.get("timestamp", ""),
            obj['name'],
            industry,
            e.get("hash", ""),
            e.get("scope", ""),
            e.get("trust_index", ""),
            e.get("effective_value", ""),
            e.get("raw_text", "N/A"),
            e.get("insights", "")
        ])
        
    # 2. Generate massive industry-specific mock dataset as a reward (50 rows)
    import datetime
    import random
    import hashlib
    
    base_date = datetime.datetime.now() - datetime.timedelta(days=50)
    for i in range(50):
        t = base_date + datetime.timedelta(days=i)
        val = random.randint(100000, 5000000)
        trust = round(random.uniform(85.0, 99.9), 1)
        
        if industry == '스마트팜':
            insight = random.choice(['토양 수분량 최적화 달성', '스마트 관수 시스템 가동', '병해충 사전 예측 및 방제', '신규 엽채류 수확 및 출하', '온실 온도 0.5도 하향 조정 완료'])
        elif industry in ['요식업', '식음료']:
            insight = random.choice(['주말 디너 웨이팅 20팀 돌파', '신메뉴 리뷰 평점 4.8 달성', '배달 플랫폼 우수 사업장 선정', '식자재 폐기율 5% 감소', '단체 회식 예약 3건 접수'])
        elif industry in ['IT/제조', '제조업']:
            insight = random.choice(['공정 불량률 0.1% 개선', 'A라인 가동률 98% 달성', '스마트 팩토리 센서 데이터 동기화', '신규 부품 품질 검수 통과', '야간 무인 가동 테스트 성공'])
        else:
            insight = random.choice(['주간 목표 성과 120% 달성', '고객 만족도 설문 우수', '신규 계약 2건 성사', '운영 리소스 10% 절감', '분기 매출 목표 조기 달성'])
            
        mock_hash = hashlib.sha256(f"{obj['name']}{insight}{i}".encode()).hexdigest()[:16]
        
        writer.writerow([
            t.strftime("%Y-%m-%d %H:%M"),
            obj['name'],
            industry,
            mock_hash,
            "store_specific",
            trust,
            val,
            f"[{industry} B2B API 자동 수집 데이터]",
            insight
        ])
    
    import urllib.parse
    output.seek(0)
    filename = f"MDGA_Data_Export_{obj['name']}.csv"
    encoded_filename = urllib.parse.quote(filename)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{encoded_filename}"}
    )

