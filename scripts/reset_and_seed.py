import os
import json
import ssl
import time
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('backend/.env')

context = ssl._create_unverified_context()

print("==================================================")
print("🚀 INIT: FULL SYSTEM RESET & SEEDING PROCESS 🚀")
print("==================================================")

# 1. Reset Schema
print("\n[1/3] Resetting Production Database Schema...")
try:
    res = requests.post('https://mdga-api.onrender.com/api/reset_schema', headers={'Authorization': 'Bearer mdga-admin-seed-2026'})
    print("  -> Schema Reset Successfully:", res.text)
except Exception as e:
    print("  -> Failed to reset schema:", e)

# 2. Clear Google Drive
print("\n[2/3] Wiping Google Drive Data Lake...")
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')

client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
refresh_token = os.environ.get("GOOGLE_OAUTH_REFRESH_TOKEN")

from google.oauth2.credentials import Credentials
creds = Credentials(
    token=None,
    refresh_token=refresh_token,
    token_uri="https://oauth2.googleapis.com/token",
    client_id=client_id,
    client_secret=client_secret
)
service = build('drive', 'v3', credentials=creds)

def wipe_folder_recursive(folder_id, folder_name):
    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields='files(id, name, mimeType)').execute()
    for item in results.get('files', []):
        if item['mimeType'] == 'application/vnd.google-apps.folder':
            wipe_folder_recursive(item['id'], item['name'])
        else:
            try:
                service.files().delete(fileId=item['id']).execute()
            except Exception as e:
                pass
    try:
        service.files().delete(fileId=folder_id).execute()
        print(f"  -> Deleted {folder_name}")
    except Exception as e:
        print(f"     (Could not delete {folder_name}: {e})")

try:
    query = f"'{FOLDER_ID}' in parents and trashed=false"
    results = service.files().list(q=query, fields='files(id, name)').execute()
    items = results.get('files', [])
    if not items:
        print("  -> Drive is already empty.")
    for item in items:
        wipe_folder_recursive(item['id'], item['name'])
except Exception as e:
    print("  -> Drive wipe failed:", e)

# 3. Seed Data
print("\n[3/3] Seeding Initial B2B Persona Data...")

realistic_data = [
    # --- 대구광역시 전체 (City Level Policy Data) ---
    {"region": [], "name": "대구광역시청 데이터허브", "industry": "공공", "insight": "[2026 대구 스마트시티 종합계획]\n- 예산: 4,500억 원\n- 핵심 목표: 1. 스마트물류 단지 고도화, 2. 수성구 관광 데이터 마켓 활성화, 3. 청년 스마트팜 밸리 지원\n\n대구광역시 전체 산업 지표가 전 분기 대비 4.2% 상승 중입니다. 특히 물류 및 IT 서비스 부문의 성장이 두드러집니다."},

    # --- 구/동 단위 (Regional Level Data) ---
    {"region": ["북구"], "name": "북구청 산업지원과", "industry": "공공", "insight": "북구 연암로 일대 스마트팜 밸리 조성을 위한 시범 데이터 수집. 현재 3개 농가 참여 중. 하반기 10개 농가로 확대 예정."},
    {"region": ["달서구", "성서동"], "name": "성서산업단지 관리공단", "industry": "공공", "insight": "성서산업단지 내 폐배터리 및 스마트물류 입주 기업 45개사. 야간 전력 소비량 분석 결과, 자정 이후 심야 전력 사용량이 20% 증가."},

    # --- 스마트팜 & 농업 부문 (Store Level) ---
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "industry": "스마트팜", "insight": "{\n  \"timestamp\": \"2026-04-15 08:30\",\n  \"sensor\": \"DHT-22\",\n  \"temperature\": 24.5,\n  \"humidity\": 68.2,\n  \"action\": \"청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성. 습도 조절을 위한 환기 시스템 가동 중.\"\n}"},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "industry": "스마트팜", "insight": "신규 스마트팜 제어 솔루션 도입. 전월 대비 인건비 15% 절감 및 수확량 20% 증대. 비전 AI를 활용한 토마토 당도 측정 정확도 98% 기록."},
    {"region": ["수성구", "두산동", "수성못 수변상권"], "name": "수성수산 수경재배", "industry": "스마트팜", "insight": "[수경재배 수질 리포트]\n- pH: 6.2\n- EC: 1.8\n여름철 성수기 대비 출고 라인 증설. 파트타임 수확 관리자 5명 추가 고용 완료."},

    # --- 요식업 & 서비스 상권 부문 (Store Level) ---
    {"region": ["중구", "삼덕동", "동성로"], "name": "MDGA 로스터리 카페", "industry": "식음료", "insight": "비 오는 날 배달 프로모션 대성공. 배달 라이더 연계 콜 수 150건 돌파. 특히 오후 2-4시 사이 디저트 세트 주문이 폭증함."},
    {"region": ["중구", "삼덕동", "동성로"], "name": "동성로 한우오마카세", "industry": "요식업", "insight": "홀 서빙 정규직 2명 고용 창출. 외국인 관광객 전용 영어/일어 메뉴판 도입 후 주말 단체 예약 30% 증가. 2분기 매출 목표 조기 달성 예상."},
    {"region": ["달서구", "상인동", "상인역 번화가"], "name": "초저가 마트 상인점", "industry": "도소매", "insight": "{\n  \"category\": \"도소매 매출\",\n  \"top_item\": \"신선식품 (과일/야채)\",\n  \"growth_rate\": \"+30%\",\n  \"note\": \"명절 대비 창고 정리 알바 단기 15명 고용. 주변 1인 가구 증가로 소포장 상품 매출 급증.\"\n}"},

    # --- 첨단 제조업 및 물류, IT (Store Level) ---
    {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "industry": "IT/서비스", "insight": "중소벤처기업부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출. 딥러닝 서버 3대 추가 도입."},
    {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트물류(주) 대구센터", "industry": "물류업", "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환. 일일 평균 처리 물동량 25,000건 돌파."},
    {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래차 밧데리(주)", "industry": "제조업", "insight": "[Q1 수출 실적 보고서]\n- 수출 물량: 200% 증가\n- 주요 수출국: 북미, 유럽\n- 인력 충원: 생산직 50명 대규모 공채\n- 인프라: 공장 2동 증축 착공 완료 및 ESG 경영 인증 획득."}
]

from PIL import Image

API_URL = "https://mdga-api.onrender.com"
HEADERS = {"Authorization": "Bearer mdga-admin-seed-2026"}

dummy_img_path = "seed_dummy.png"
img = Image.new('RGB', (100, 100), color = (73, 109, 137))
img.save(dummy_img_path)

for idx, item in enumerate(realistic_data):
    if len(item["region"]) == 0:
        path_str = f"대구광역시/{item['name']}"
    else:
        path_str = "대구광역시/" + "/".join(item["region"]) + "/" + item["name"]
    
    industry = item["industry"]
    
    try:
        requests.post(f"{API_URL}/api/user/context", json={
            'role': 'store', 'industry': industry, 'location': path_str.split('/')
        }, headers=HEADERS)
    except Exception:
        pass

    with open(dummy_img_path, 'rb') as f:
        files = {'file': (f"proof_{idx}.png", f, 'image/png')}
        data = {
            "raw_text": f"[초기 데이터] {item['insight']}",
            "location": path_str,
            "industry": industry,
            "is_guest": "false"
        }
        try:
            res = requests.post(f"{API_URL}/api/ingest", data=data, files=files, headers=HEADERS)
            if res.status_code == 200:
                print(f"  [{idx+1}/13] ✅ Ingested: {item['name']}")
            else:
                print(f"  [{idx+1}/13] ❌ Failed API: {item['name']} ({res.text})")
        except Exception as e:
            print(f"  [{idx+1}/{len(realistic_data)}] ❌ Failed Exception: {item['name']} ({e})")
            
    time.sleep(1)

if os.path.exists(dummy_img_path):
    os.remove(dummy_img_path)

print("\n==================================================")
print("🎉 ALL DONE! PRODUCTION ENVIRONMENT IS READY! 🎉")
print("==================================================")
