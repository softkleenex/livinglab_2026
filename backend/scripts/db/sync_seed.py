import io
import sys
import os
import datetime
from googleapiclient.http import MediaIoBaseUpload
from app.services.google_drive import get_drive_service, get_or_create_drive_folder
from app.core.config import settings

# Add current dir to path to import seed_data properly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seed_data import get_massive_data


def main():
    drive_service = get_drive_service()
    if not drive_service:
        print("Missing OAuth credentials or failed to initialize service.")
        exit(1)

    FOLDER_ID = settings.GOOGLE_DRIVE_FOLDER_ID

    massive_data = get_massive_data()

    print(f"Syncing {len(massive_data)} Seed Data to Google Drive (Healthy Folders)...")

    success_count = 0
    for item in massive_data:
        state = item.get("state", "대구광역시")
        path_list = [state] + item["region"] + [item["name"]]

        current_folder_id = FOLDER_ID
        for p in path_list:
            current_folder_id = get_or_create_drive_folder(
                drive_service, current_folder_id, p
            )

        origin_folder_id = get_or_create_drive_folder(
            drive_service, current_folder_id, "origin"
        )
        generated_folder_id = get_or_create_drive_folder(
            drive_service, current_folder_id, "generated"
        )

        now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        raw_text = f"B2B/공공 API 연동망을 통해 수집된 '{item['name']}'의 실시간 고용 및 경영 스냅샷 데이터입니다."
        insights = f"[초기 B2B 공공/기업 연동 데이터] {item['insight']}"

        try:
            # 1. Upload raw_text
            txt_metadata = {
                "name": f"RawText_{now_str}.txt",
                "parents": [origin_folder_id],
            }
            txt_media = MediaIoBaseUpload(
                io.BytesIO(raw_text.encode("utf-8")),
                mimetype="text/plain",
                resumable=True,
            )
            drive_service.files().create(
                body=txt_metadata,
                media_body=txt_media,
                fields="id",
                supportsAllDrives=True,
            ).execute()

            # 2. Upload insights
            insight_metadata = {
                "name": f"AI_Insight_{now_str}.txt",
                "parents": [generated_folder_id],
            }
            insight_media = MediaIoBaseUpload(
                io.BytesIO(insights.encode("utf-8")),
                mimetype="text/plain",
                resumable=True,
            )
            drive_service.files().create(
                body=insight_metadata,
                media_body=insight_media,
                fields="id",
                supportsAllDrives=True,
            ).execute()

            print(f"✅ Uploaded & Linked: {'/'.join(path_list)}")
            success_count += 1
        except Exception as e:
            print(f"❌ Failed Upload: {'/'.join(path_list)} - {e}")

    print(
        f"\n🎉 Healthy Folder Structure creation completed! ({success_count}/{len(massive_data)})"
    )


if __name__ == "__main__":
    main()
