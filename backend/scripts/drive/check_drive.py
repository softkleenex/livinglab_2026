import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('backend/.env')

FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
info = json.loads(os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON').strip("'"))
creds = service_account.Credentials.from_service_account_info(info)
service = build('drive', 'v3', credentials=creds)

def list_folders(parent_id, indent=""):
    query = f"'{parent_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields='files(id, name, mimeType)').execute()
    for item in results.get('files', []):
        print(f"{indent}- {item['name']} ({item['mimeType']})")
        if item['mimeType'] == 'application/vnd.google-apps.folder':
            list_folders(item['id'], indent + "  ")

print("Drive Root:")
list_folders(FOLDER_ID)
