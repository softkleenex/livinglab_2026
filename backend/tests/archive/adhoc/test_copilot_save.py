import urllib.request
import urllib.parse
import json
import ssl
import time
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('backend/.env')

context = ssl._create_unverified_context()

print("==================================================")
print("🤖 TESTING COPILOT AI CHAT & DATA LAKE SAVING 🤖")
print("==================================================")

# Drive setup
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
service_account_info = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
cleaned_info = service_account_info.strip()
if cleaned_info.startswith("'") and cleaned_info.endswith("'"):
    cleaned_info = cleaned_info[1:-1]
creds = service_account.Credentials.from_service_account_info(json.loads(cleaned_info))
drive_service = build('drive', 'v3', credentials=creds)

path = '대구광역시/달성군/유가읍/테크노폴리스 외곽/달성 딸기 스마트팜'
industry = '스마트팜'

print(f"Target Farm: {path}")

# 1. Copilot Query
print('\n[1] Sending Query to AI Copilot...')
query = '이번 달 딸기 수확량이 20% 늘었는데, 이 데이터를 바탕으로 향후 3개월간 물류/유통 전략을 어떻게 수정해야 할까?'
chat_payload = json.dumps({
    'message': query,
    'path': path,
    'industry': industry
}).encode('utf-8')

req_chat = urllib.request.Request('https://mdga-api.onrender.com/api/chat', data=chat_payload, headers={'Content-Type': 'application/json'})
res_chat = urllib.request.urlopen(req_chat, context=context)
chat_data = json.loads(res_chat.read().decode('utf-8'))
print('\n[Copilot Reply]:')
print(chat_data['reply'])

print("\nWaiting 10 seconds for Drive Sync...")
time.sleep(10)

# 2. Check Drive for Copilot_Log
print('\n[2] Checking Google Drive (Data Lake) for generated AI log...')
search_query = "name contains 'Copilot_Log' and trashed=false"
results = drive_service.files().list(q=search_query, fields='files(id, name, parents)').execute()
files = results.get('files', [])

if len(files) > 0:
    print(f"✅ SUCCESS: Found {len(files)} Copilot log(s) in Drive!")
    for f in files:
        print(f"  - {f['name']} (ID: {f['id']})")
        
        # Try to download and print the first 200 chars
        request = drive_service.files().get_media(fileId=f['id'])
        content = request.execute()
        print("\n  [File Content Preview]:")
        print(content.decode('utf-8')[:300] + '...\n')
else:
    print("❌ FAILURE: No Copilot log found in Drive.")
