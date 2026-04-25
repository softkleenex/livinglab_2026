import json
import threading
from collections import OrderedDict
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from app.core.config import settings

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: str):
        if key not in self.cache:
            return -1
        else:
            self.cache.move_to_end(key)
            return self.cache[key]

    def put(self, key: str, value: str):
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

FOLDER_CACHE = LRUCache(5000)
CACHE_LOCK = threading.Lock()

def get_drive_service():
    service_account_info = settings.GOOGLE_SERVICE_ACCOUNT_JSON
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

    client_id = settings.GOOGLE_OAUTH_CLIENT_ID
    client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET
    refresh_token = settings.GOOGLE_OAUTH_REFRESH_TOKEN

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

    return None

def get_or_create_drive_folder(service, parent_id, folder_name):
    cache_key = f"{parent_id}_{folder_name}"
    
    with CACHE_LOCK:
        cached_id = FOLDER_CACHE.get(cache_key)
        if cached_id != -1:
            return cached_id

    escaped_folder_name = folder_name.replace("'", "\\'")
    query = f"name='{escaped_folder_name}' and '{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    response = service.files().list(q=query, spaces='drive', fields='files(id, name)', supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
    files = response.get('files', [])
    
    with CACHE_LOCK:
        if files:
            folder_id = files[0].get('id')
            FOLDER_CACHE.put(cache_key, folder_id)
            return folder_id
            
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(body=file_metadata, fields='id', supportsAllDrives=True).execute()
        folder_id = folder.get('id')
        FOLDER_CACHE.put(cache_key, folder_id)
        
        return folder_id
