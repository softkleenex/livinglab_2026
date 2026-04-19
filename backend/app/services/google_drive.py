import os
import json
import threading
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials

FOLDER_CACHE = {}
CACHE_LOCK = threading.Lock()

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
            print("OAuth Error:", e)

    service_account_info = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if service_account_info:
        try:
            cleaned_info = service_account_info.strip()
            if cleaned_info.startswith("'") and cleaned_info.endswith("'"):
                cleaned_info = cleaned_info[1:-1]
            info = json.loads(cleaned_info)
            creds = service_account.Credentials.from_service_account_info(info)
            return build('drive', 'v3', credentials=creds)
        except Exception as e:
            print("SA Error:", e)

    return None

def get_or_create_drive_folder(service, parent_id, folder_name):
    cache_key = f"{parent_id}_{folder_name}"
    
    with CACHE_LOCK:
        if cache_key in FOLDER_CACHE:
            return FOLDER_CACHE[cache_key]

    query = f"name='{folder_name}' and '{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    response = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    files = response.get('files', [])
    
    with CACHE_LOCK:
        if files:
            folder_id = files[0].get('id')
            FOLDER_CACHE[cache_key] = folder_id
            return folder_id
            
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(body=file_metadata, fields='id').execute()
        folder_id = folder.get('id')
        FOLDER_CACHE[cache_key] = folder_id
        
        if len(FOLDER_CACHE) > 5000:
            FOLDER_CACHE.clear()
            FOLDER_CACHE[cache_key] = folder_id
            
        return folder_id
