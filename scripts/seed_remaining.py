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
    # --- 요식업 & 서비스 상권 부문 (남은 것) ---
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
        print(f"  [{idx+9}/13] ✅ Ingested: {item['name']}")
    except Exception as e:
        print(f"  [{idx+9}/13] ❌ Failed: {item['name']} ({e})")
        
    time.sleep(1)

print("\n==================================================")
print("🎉 ALL DONE! PRODUCTION ENVIRONMENT IS READY! 🎉")
print("==================================================")
