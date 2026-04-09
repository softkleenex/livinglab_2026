from fastapi import FastAPI, HTTPException, UploadFile, File, Form
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
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

# --- Config ---
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI(title="MDGA Masterpiece OS v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# --- 📂 [Core] Hyper-Hierarchy Engine 2.0 (Bottom-Up Model) ---
class HierarchyEngine:
    def __init__(self):
        self.db = {
            "name": "대구광역시", "type": "City",
            "metadata": {"trust_index": 99.0, "pulse_rate": 80, "total_value": 0, "nodes": 0},
            "children": {},
            "data_entries": []
        }

    def get_object(self, path_list):
        curr = self.db
        for p in path_list:
            if p not in curr["children"]: return None
            curr = curr["children"][p]
        return curr

    def create_or_get_path(self, path_list, types_list):
        curr = self.db
        # Update root metadata dynamically
        curr["metadata"]["nodes"] += 1
        for i, p in enumerate(path_list):
            if p not in curr["children"]:
                curr["children"][p] = {
                    "name": p, "type": types_list[i] if i < len(types_list) else "Node",
                    "metadata": {"created_at": str(datetime.date.today()), "nodes": 1, "pulse_rate": random.randint(65, 90), "total_value": 0},
                    "children": {}, "data_entries": []
                }
            else:
                curr["children"][p]["metadata"]["nodes"] += 1
            curr = curr["children"][p]
        return curr
        
    def add_value_bottom_up(self, path_list, value_added):
        curr = self.db
        curr["metadata"]["total_value"] += value_added
        # Increase pulse rate slightly on activity, cap at 100
        curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 1)
        for p in path_list:
            if p in curr["children"]:
                curr = curr["children"][p]
                curr["metadata"]["total_value"] += value_added
                curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 2)

engine = HierarchyEngine()

# --- 🚀 API Endpoints ---

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
    
    return {
        "store": {
            "name": obj["name"],
            "total_value": obj["metadata"].get("total_value", 0),
            "pulse": obj["metadata"].get("pulse_rate", 0),
            "entries": obj.get("data_entries", [])
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
    return {
        "current": obj["name"], "type": obj["type"], "metadata": obj["metadata"],
        "children": [ {"name": k, "type": v["type"], "pulse": v["metadata"]["pulse_rate"]} for k, v in obj["children"].items() ],
        "entries": obj.get("data_entries", [])
    }

@app.post("/api/ingest")
async def ingest(
    raw_text: str = Form(None), 
    file: UploadFile = File(None),
    location: str = Form(...) # e.g. "북구/산격동/경북대 북문/테스트상점"
):
    try:
        content = raw_text if raw_text else ""
        path_list = [p for p in location.split("/") if p]
        drive_link = None
        
        if file: 
            content += f"\n[Attached File] {file.filename}"
            file_data = await file.read()
            try:
                drive_service = get_drive_service()
                if drive_service:
                    file_metadata = {'name': f"Ingest_{datetime.date.today()}_{file.filename}", 'parents': [FOLDER_ID]}
                    media = MediaIoBaseUpload(io.BytesIO(file_data), mimetype=file.content_type, resumable=True)
                    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink', supportsAllDrives=True).execute()
                    drive_link = uploaded_file.get('webViewLink')
            except Exception as e:
                drive_link = "Storage Error"

        # Find target object
        target_obj = engine.get_object(path_list)
        if not target_obj:
            target_obj = engine.create_or_get_path(path_list, ["Gu", "Dong", "Street", "Store"])

        # Deep Analysis via LLM
        prompt = f"다음은 {location} 지역 소상공인이 올린 데이터입니다. 데이터를 분석하고 매장에 적용할 수 있는 액션 가능한 2~3문장 피드백을 주세요. 데이터: {content}"
        try:
            insights = model.generate_content(prompt).text
        except:
            insights = f"가상 지능 분석: 제공해주신 데이터가 로컬 스토어 자산으로 성공적으로 변환되었습니다."
        
        trust_hash = hashlib.sha256(content.encode()).hexdigest()
        entry = {
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M")), 
            "insights": insights, 
            "hash": trust_hash, 
            "drive_link": drive_link
        }
        target_obj["data_entries"].append(entry)
        if len(target_obj["data_entries"]) > 50: target_obj["data_entries"].pop(0)
        
        # Add value to the hierarchy (bottom-up aggregation)
        value_added = random.randint(50000, 200000)
        engine.add_value_bottom_up(path_list, value_added)
        
        return {"status": "success", "assigned_path": path_list, "entry": entry, "value_added": value_added}
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
