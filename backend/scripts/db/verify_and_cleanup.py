import os
import json
import urllib.parse
import urllib.request
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Farm, Region, DataEntry
from app.services.google_drive import get_drive_service
from app.core.config import settings

def get_full_path(db: Session, farm: Farm):
    path = [farm.name]
    curr_region = db.query(Region).filter(Region.id == farm.region_id).first()
    while curr_region:
        path.insert(0, curr_region.name)
        if curr_region.parent_id:
            curr_region = db.query(Region).filter(Region.id == curr_region.parent_id).first()
        else:
            break
    return path

def delete_region_recursive(db, region_id):
    children = db.query(Region).filter(Region.parent_id == region_id).all()
    for child in children:
        delete_region_recursive(db, child.id)
    
    farms = db.query(Farm).filter(Farm.region_id == region_id).all()
    for farm in farms:
        db.query(DataEntry).filter(DataEntry.store_id == farm.id).delete()
        db.delete(farm)
        
    db.query(Region).filter(Region.id == region_id).delete()

def main():
    db = SessionLocal()
    service = get_drive_service()
    if not service:
        print("Failed to initialize drive service")
        return
        
    print("--- 1. Removing '서귀포시' ---")
    seogwipo = db.query(Region).filter(Region.name == "서귀포시").first()
    if seogwipo:
        print("Found '서귀포시' in DB. Deleting recursively...")
        delete_region_recursive(db, seogwipo.id)
        db.commit()
        print("Successfully deleted from DB.")
    else:
        print("'서귀포시' not found in DB.")

    # Find and delete in Drive
    # Search for 서귀포시 globally
    query = "name='서귀포시' and mimeType='application/vnd.google-apps.folder'"
    try:
        res = service.files().list(q=query, spaces='drive', fields='files(id, name, trashed)', supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
        files = res.get('files', [])
        if not files:
            print("'서귀포시' not found in Drive.")
        for f in files:
            print(f"Deleting folder '{f['name']}' (ID: {f['id']}, Trashed: {f.get('trashed')}) from Drive...")
            try:
                service.files().delete(fileId=f['id']).execute()
                print("Successfully deleted from Drive.")
            except Exception as e:
                print(f"Failed to delete from Drive: {e}")
    except Exception as e:
        print(f"Drive API Error: {e}")

    print("\n--- 2. Checking all entities ---")
    farms = db.query(Farm).all()
    print(f"Found {len(farms)} farms in DB.")
    
    API_BASE = "https://mdga-api.onrender.com"
    all_healthy = True
    
    for farm in farms:
        path_list = get_full_path(db, farm)
        path_str = "/".join(path_list)
        print(f"\nChecking: {path_str}")
        
        # 1. Check Drive 'origin' folder
        query_store = f"name='{farm.name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        try:
            res_store = service.files().list(q=query_store, spaces='drive', fields='files(id, name)').execute()
            store_folders = res_store.get('files', [])
            
            if not store_folders:
                print("  ❌ Farm folder not found in Drive.")
                all_healthy = False
                continue
                
            store_id_drive = store_folders[0]['id']
            query_origin = f"name='origin' and '{store_id_drive}' in parents and trashed=false"
            res_origin = service.files().list(q=query_origin, spaces='drive', fields='files(id)').execute()
            origins = res_origin.get('files', [])
            
            if not origins:
                print("  ❌ 'origin' folder not found.")
                all_healthy = False
                continue
                
            origin_id = origins[0]['id']
            query_files = f"'{origin_id}' in parents and trashed=false"
            res_files = service.files().list(q=query_files, spaces='drive', fields='files(id, name)').execute()
            origin_files = res_files.get('files', [])
            
            if len(origin_files) == 0:
                print("  ❌ 'origin' folder is empty.")
                all_healthy = False
            else:
                print(f"  ✅ 'origin' contains {len(origin_files)} files.")
        except Exception as e:
            print(f"  ❌ Drive Verification Failed: {e}")
            all_healthy = False
            
        # 2. Check AI Report API
        industry = farm.industry or "일반 비즈니스"
        encoded_path = urllib.parse.quote(path_str)
        encoded_industry = urllib.parse.quote(industry)
        
        report_url = f"{API_BASE}/api/v1/dashboard/report?path={encoded_path}&industry={encoded_industry}"
        try:
            req = urllib.request.Request(report_url)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                if data.get('status') == 'success' and 'report' in data:
                    report_text = data['report']
                    if "아직 충분한 데이터가 수집되지 않았습니다" in report_text:
                         print("  ⚠️ AI Report: Not enough data.")
                         all_healthy = False
                    elif "AI 서버 응답이 지연되고 있습니다" in report_text:
                         print("  ❌ AI Report: AI Server Error (429/404).")
                         all_healthy = False
                    else:
                         print("  ✅ AI Report generated successfully.")
                else:
                    print(f"  ❌ API Error: {data}")
                    all_healthy = False
        except Exception as e:
            print(f"  ❌ Request Failed: {e}")
            all_healthy = False

    if all_healthy:
        print("\n🎉 ALL CHECKS PASSED: Database, Drive, and AI are fully synchronized and healthy!")
    else:
        print("\n⚠️ SOME CHECKS FAILED. Please review the logs above.")

if __name__ == '__main__':
    main()
