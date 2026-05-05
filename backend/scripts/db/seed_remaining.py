import os
import json
import urllib.request
import urllib.parse
import ssl
import time

context = ssl._create_unverified_context()

print("==================================================")
print("🚀 RESUMING SEEDING PROCESS 🚀")
print("==================================================")

realistic_data = [
    # --- 농업 & 스마트팜 생태계 부문 (남은 것) ---
    {"region": ["달서구", "상인동", "상인역 번화가"], "name": "농업 빅데이터 센터", "industry": "연구기관 (AI 데이터 허브)", "insight": "스마트팜 환경 데이터 정제율 전년 대비 30% 증가. 고품질 합성 데이터 10만 건 생성."},
    {"region": ["남구", "대명동", "안지랑 앞산"], "name": "사과 기후연구소", "industry": "연구기관 (AI 데이터 허브)", "insight": "해외 농업 연구원 초빙으로 글로벌 데이터 표준 교류 증진. 주말 테스트 완료."},
    
    # --- 첨단 농산업 및 스마트팜, IT ---
    {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "industry": "기업 (농기계/스마트팜)", "insight": "농식품부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출."},
    {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트농기계 대구센터", "industry": "유통업 (도매/물류)", "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환."},
    {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래 농업드론(주)", "industry": "기업 (농기계/스마트팜)", "insight": "해외 수출 물량 200% 증가. 드론 파일럿 50명 대규모 공채 및 스마트팜 2동 증축 착공."}
]

for idx, item in enumerate(realistic_data):
    path_str = "대구광역시/" + "/".join(item["region"]) + "/" + item["name"]
    industry = item["industry"]
    
    # Onboard
    data = json.dumps({'role': 'farm', 'industry': industry, 'location': path_str.split('/')}).encode('utf-8')
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
        print(f"  [{idx+9}/13] ✅ Ingested: {item['name']}")
    except Exception as e:
        print(f"  [{idx+9}/13] ❌ Failed: {item['name']} ({e})")
        
    time.sleep(1)

print("\n==================================================")
print("🎉 ALL DONE! PRODUCTION ENVIRONMENT IS READY! 🎉")
print("==================================================")