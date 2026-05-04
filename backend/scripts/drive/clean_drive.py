import os, json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('backend/.env')
load_dotenv('.env', override=True)

FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
client_secret = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')
refresh_token = os.environ.get('GOOGLE_OAUTH_REFRESH_TOKEN')

creds = Credentials(
    token=None,
    refresh_token=refresh_token,
    token_uri='https://oauth2.googleapis.com/token',
    client_id=client_id,
    client_secret=client_secret
)
service = build('drive', 'v3', credentials=creds)

print('=== Wiping Drive Target Folder ===')
query = f"'{FOLDER_ID}' in parents and trashed=false"
results = service.files().list(q=query, fields='files(id, name)').execute()
for item in results.get('files', []):
    print(f"Deleting {item['name']} ({item['id']})")
    try:
        service.files().delete(fileId=item['id']).execute()
        print(" -> Success")
    except Exception as e:
        print(" -> Failed:", e)

# Clean root folder as well
print('\n=== Wiping Garbage from Root Folder ===')
query_root = f"'root' in parents and trashed=false and mimeType='application/vnd.google-apps.folder'"
results_root = service.files().list(q=query_root, fields='files(id, name)').execute()
for item in results_root.get('files', []):
    name = item['name']
    if name in ['대구광역시', '서울특별시', '경상남도', '강원특별자치도', '제주특별자치도']:
        print(f"Deleting root garbage: {name} ({item['id']})")
        try:
            service.files().delete(fileId=item['id']).execute()
            print(" -> Success")
        except Exception as e:
            print(" -> Failed:", e)

print('Drive wipe complete.')
