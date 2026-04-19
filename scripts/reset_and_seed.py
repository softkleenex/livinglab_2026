import os
import json
import urllib.request
import urllib.parse
import ssl
import time
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
    req = urllib.request.Request('https://mdga-api.onrender.com/api/reset_schema', method='POST')
    req.add_header('Authorization', 'Bearer mock-jwt-token')
    res = urllib.request.urlopen(req, context=context)
    print("  -> Schema Reset Successfully:", res.read().decode('utf-8'))
except Exception as e:
    print("  -> Failed to reset schema:", e)

# 2. Clear Google Drive
print("\n[2/3] Wiping Google Drive Data Lake...")
FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
service_account_info = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
cleaned_info = service_account_info.strip()
if cleaned_info.startswith("'") and cleaned_info.endswith("'"):
    cleaned_info = cleaned_info[1:-1]
creds = service_account.Credentials.from_service_account_info(json.loads(cleaned_info))
service = build('drive', 'v3', credentials=creds)

try:
    query = f"'{FOLDER_ID}' in parents and trashed=false"
    results = service.files().list(q=query, fields='files(id, name)').execute()
    items = results.get('files', [])
    if not items:
        print("  -> Drive is already empty.")
    for item in items:
        print(f"  -> Deleting {item['name']}...")
        try:
            service.files().delete(fileId=item['id']).execute()
        except Exception as err:
            print(f"     (Could not delete {item['name']}, might be owned by user: {err})")
except Exception as e:
    print("  -> Drive wipe failed:", e)

# 3. Seed Data
print("\n[3/3] Seeding Initial B2B Persona Data...")

realistic_data = [
    # --- 스마트팜 & 농업 부문 ---
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "industry": "스마트팜", "insight": "청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성."},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "industry": "스마트팜", "insight": "신규 스마트팜 제어 솔루션 도입으로 전월 대비 인건비 15% 절감 및 수확량 20% 증대."},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "초록잎 수직농장", "industry": "스마트팜", "insight": "IoT 자동 관수 시스템 센서 교체 완료. 파트타임 수확 인력 2명 추가 배치."},
    {"region": ["수성구", "두산동", "수성못 수변상권"], "name": "수성수산 수경재배", "industry": "스마트팜", "insight": "파트타임 수확 관리자 5명 추가 고용. 여름철 성수기 대비 출고 라인 증설."},
    {"region": ["달성군", "유가읍", "테크노폴리스 외곽"], "name": "달성 딸기 스마트팜", "industry": "스마트팜", "insight": "딸기 당도 측정을 위한 비전 AI 센서 시범 도입. 수확 효율 12% 향상."},
    
    # --- 요식업 & 서비스 상권 부문 ---
    {"region": ["중구", "삼덕동", "동성로"], "name": "MDGA 로스터리 카페", "industry": "식음료", "insight": "비 오는 날 배달 프로모션 대성공. 배달 라이더 연계 콜 수 150건 돌파."},
    {"region": ["중구", "삼덕동", "동성로"], "name": "동성로 한우오마카세", "industry": "요식업", "insight": "홀 서빙 정규직 2명 고용 창출. 단체 예약 증가로 2분기 매출 목표 조기 달성 예상."},
    {"region": ["중구", "삼덕동", "동성로"], "name": "24시 국밥집 삼덕본점", "industry": "요식업", "insight": "야간 매출 비중 40% 초과. 야간 할증 수당 적용 파트타이머 3명 충원 완료."},
    {"region": ["달서구", "상인동", "상인역 번화가"], "name": "초저가 마트 상인점", "industry": "도소매", "insight": "명절 대비 창고 정리 알바 단기 15명 고용. 신선식품 회전율 전년 대비 30% 증가."},
    {"region": ["남구", "대명동", "안지랑 곱창골목"], "name": "원조 불막창", "industry": "요식업", "insight": "외국인 관광객 증가로 영/중/일 다국어 메뉴판 도입. 주말 피크타임 매출 25% 상승."},
    
    # --- 첨단 제조업 및 물류, IT ---
    {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "industry": "IT/서비스", "insight": "중소벤처기업부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출."},
    {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트물류(주) 대구센터", "industry": "물류업", "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환."},
    {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래차 밧데리(주)", "industry": "제조업", "insight": "해외 수출 물량 200% 증가. 생산직 50명 대규모 공채 및 공장 2동 증축 착공."}
]

for idx, item in enumerate(realistic_data):
    path_str = "대구광역시/" + "/".join(item["region"]) + "/" + item["name"]
    industry = item["industry"]
    
    # Onboard
    data = json.dumps({'role': 'store', 'industry': industry, 'location': path_str.split('/')}).encode('utf-8')
    req = urllib.request.Request('https://mdga-api.onrender.com/api/user/context', data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, context=context)
    except Exception:
        pass

    # Ingest
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name=\"raw_text\"\r\n\r\n'
        f'[초기 데이터] {item["insight"]}\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name=\"location\"\r\n\r\n'
        f'{path_str}\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name=\"industry\"\r\n\r\n'
        f'{industry}\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name=\"is_guest\"\r\n\r\n'
        f'false\r\n'
        f'--{boundary}--\r\n'
    )

    req_ingest = urllib.request.Request('https://mdga-api.onrender.com/api/ingest', data=body.encode('utf-8'))
    req_ingest.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    try:
        urllib.request.urlopen(req_ingest, context=context)
        print(f"  [{idx+1}/{len(realistic_data)}] ✅ Ingested: {item['name']}")
    except Exception as e:
        print(f"  [{idx+1}/{len(realistic_data)}] ❌ Failed: {item['name']} ({e})")
        
    time.sleep(1)

print("\n==================================================")
print("🎉 ALL DONE! PRODUCTION ENVIRONMENT IS READY! 🎉")
print("==================================================")
