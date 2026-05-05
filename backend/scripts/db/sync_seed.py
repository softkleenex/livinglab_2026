import io
import datetime
from googleapiclient.http import MediaIoBaseUpload
from app.services.google_drive import get_drive_service, get_or_create_drive_folder
from app.core.config import settings

def main():
    drive_service = get_drive_service()
    if not drive_service:
        print('Missing OAuth credentials or failed to initialize service.')
        exit(1)

    FOLDER_ID = settings.GOOGLE_DRIVE_FOLDER_ID

    realistic_data = [
        # --- 스마트팜 & 농업 부문 ---
        {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "insight": "청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성."},
        {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "insight": "신규 스마트팜 제어 솔루션 도입으로 전월 대비 인건비 15% 절감 및 수확량 20% 증대."},
        {"region": ["달성군", "유가읍", "테크노폴리스 외곽"], "name": "달성 딸기 스마트팜", "insight": "딸기 당도 측정을 위한 비전 AI 센서 시범 도입. 수확 효율 12% 향상."},
        
        # --- 첨단 스마트팜 및 물류, IT ---
        {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "insight": "중소벤처기업부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출."},
        {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트물류(주) 대구센터", "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환."},
        {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "스마트 농기계 배터리(주)", "insight": "해외 수출 물량 200% 증가. 생산직 50명 대규모 공채 및 스마트팜 2동 증축 착공."}
    ]

    print("Syncing Seed Data to Google Drive (Healthy Folders)...")

    for item in realistic_data:
        path_list = ["대구광역시"] + item["region"] + [item["name"]]
        
        current_folder_id = FOLDER_ID
        for p in path_list:
            current_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, p)

        origin_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "origin")
        generated_folder_id = get_or_create_drive_folder(drive_service, current_folder_id, "generated")

        now_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        
        raw_text = f"B2B/공공 API 연동망을 통해 수집된 '{item['name']}'의 실시간 고용 및 경영 스냅샷 데이터입니다."
        insights = f"[초기 B2B 공공/기업 연동 데이터] {item['insight']}"
        
        # 1. Upload raw_text
        txt_metadata = {'name': f"RawText_{now_str}.txt", 'parents': [origin_folder_id]}
        txt_media = MediaIoBaseUpload(io.BytesIO(raw_text.encode('utf-8')), mimetype='text/plain', resumable=True)
        drive_service.files().create(body=txt_metadata, media_body=txt_media, fields='id', supportsAllDrives=True).execute()

        # 2. Upload insights
        insight_metadata = {'name': f"AI_Insight_{now_str}.txt", 'parents': [generated_folder_id]}
        insight_media = MediaIoBaseUpload(io.BytesIO(insights.encode('utf-8')), mimetype='text/plain', resumable=True)
        drive_service.files().create(body=insight_metadata, media_body=insight_media, fields='id', supportsAllDrives=True).execute()

        print(f"✅ Uploaded & Linked: {'/'.join(path_list)}")

    print("\n🎉 Healthy Folder Structure creation completed!")

if __name__ == "__main__":
    main()
