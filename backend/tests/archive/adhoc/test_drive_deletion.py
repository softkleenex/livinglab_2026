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

# Drive setup
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
service_account_info = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
cleaned_info = service_account_info.strip()
if cleaned_info.startswith("'") and cleaned_info.endswith("'"):
    cleaned_info = cleaned_info[1:-1]
creds = service_account.Credentials.from_service_account_info(json.loads(cleaned_info))
drive_service = build('drive', 'v3', credentials=creds)

print('=== 1. SETUP & INGEST ===')
path = '서울특별시/강남구/테헤란로/스타트업밸리/테스트AI랩'
industry = 'IT/서비스'

# Onboard
urllib.request.urlopen(urllib.request.Request('http://localhost:8000/api/user/context', json.dumps({
    'role': 'farm', 'industry': industry, 'location': path.split('/')
}).encode('utf-8'), headers={'Content-Type': 'application/json'}), context=context)

# Ingest
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\nContent-Disposition: form-data; name="raw_text"\r\n\r\n'
    f'[테스트] 구글 드라이브 동기화 및 영구 삭제 테스트 데이터입니다.\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\n{path}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="industry"\r\n\r\n{industry}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="is_guest"\r\n\r\nfalse\r\n'
    f'--{boundary}--\r\n'
)
req = urllib.request.Request('http://localhost:8000/api/ingest', data=body.encode('utf-8'))
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
res = urllib.request.urlopen(req, context=context)
data = json.loads(res.read().decode('utf-8'))
hash_val = data['entry']['hash']
short_hash = hash_val[:8]
print(f"Ingested successfully. Hash: {hash_val}")

print("Waiting 10 seconds for Drive Sync...")
time.sleep(10) # wait for drive sync

print('\n=== 2. VERIFY GOOGLE DRIVE FILES ===')
query = f"name contains '_{short_hash}' and trashed=false"
results = drive_service.files().list(q=query, fields='files(id, name)').execute()
files_before = results.get('files', [])
print(f"Files found in Drive containing hash '{short_hash}':")
for f in files_before:
    print(f"  - {f['name']}")

print('\n=== 3. DELETE ENTRY ===')
delete_req = urllib.request.Request(f'http://localhost:8000/api/ingest/delete?path={urllib.parse.quote(path)}&hash_val={hash_val}', method='DELETE')
urllib.request.urlopen(delete_req, context=context)
print("Deleted via API.")

print("Waiting 10 seconds for Drive Deletion...")
time.sleep(10) # wait for drive deletion

print('\n=== 4. VERIFY DRIVE DELETION ===')
results_after = drive_service.files().list(q=query, fields='files(id, name)').execute()
files_after = results_after.get('files', [])
print(f"Files found in Drive after deletion: {len(files_after)}")
if len(files_after) == 0:
    print("✅ SUCCESS: All related files were permanently deleted from Google Drive!")
else:
    print("❌ FAILURE: Files still exist.")

