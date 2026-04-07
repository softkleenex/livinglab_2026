from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import datetime
import google.generativeai as genai
from dotenv import load_dotenv
import pandas as pd
from PIL import Image
import io
import json
import base64
import traceback
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI(title="MDGA Master Engine v7.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FOLDER_ID = os.environ.get("GOOGLE_DRIVE_FOLDER_ID")

def get_drive_service():
    service_account_info = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_info: return None
    try:
        cleaned_info = service_account_info.strip()
        if cleaned_info.startswith("'") and cleaned_info.endswith("'"): cleaned_info = cleaned_info[1:-1]
        info = json.loads(cleaned_info)
        creds = service_account.Credentials.from_service_account_info(info)
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        print(f"❌ [AUTH ERROR] {str(e)}")
        return None

shared_community_pool = []

@app.get("/api/community")
async def get_community(): return shared_community_pool[::-1]

@app.post("/api/analyze")
async def analyze(
    industry: str = Form(...), district: str = Form(...), street: str = Form(...),
    raw_data: str = Form(None), file: UploadFile = File(None)
):
    try:
        content_parts = []
        image_b64 = None
        drive_link = "Not Connected"
        if raw_data: content_parts.append(f"입력 텍스트: {raw_data}")
        if file:
            image_data = await file.read()
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            try:
                drive_service = get_drive_service()
                if drive_service:
                    file_metadata = {'name': f"{datetime.date.today()}_{district}_{industry}_{file.filename}", 'parents': [FOLDER_ID]}
                    media = MediaIoBaseUpload(io.BytesIO(image_data), mimetype=file.content_type, resumable=True)
                    uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()
                    drive_link = uploaded_file.get('webViewLink')
            except: drive_link = "Storage Error"
            img = Image.open(io.BytesIO(image_data))
            content_parts.append(img)
        
        response = model.generate_content([f"대구 {district} 상권 분석:"] + content_parts)
        analysis_text = response.text
        new_entry = {"id": len(shared_community_pool) + 1, "district": district, "industry": industry, "insights": analysis_text, "image_preview": f"data:image/jpeg;base64,{image_b64}" if image_b64 else None, "drive_link": drive_link, "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")}
        shared_community_pool.append(new_entry)
        return {"status": "success", "insights": analysis_text, "drive_link": drive_link}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
