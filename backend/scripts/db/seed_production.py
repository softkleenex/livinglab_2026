import os
import json
import urllib.request
import urllib.parse
import ssl
import time

context = ssl._create_unverified_context()

realistic_data = [
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "industry": "생산자 (농가/스마트팜)", "insight": "청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성."},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "industry": "기업 (농기계/스마트팜)", "insight": "신규 스마트팜 제어 솔루션 도입으로 전월 대비 인건비 15% 절감 및 수확량 20% 증대."},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "초록잎 수직농장", "industry": "생산자 (농가/스마트팜)", "insight": "IoT 자동 관수 시스템 센서 교체 완료. 파트타임 수확 인력 2명 추가 배치."},
    {"region": ["군위군", "효령면", "사과 재배단지"], "name": "수성수산 수경재배", "industry": "생산자 (농가/스마트팜)", "insight": "파트타임 수확 관리자 5명 추가 고용. 여름철 성수기 대비 출고 라인 증설."},
    {"region": ["달성군", "유가읍", "테크노폴리스 외곽"], "name": "달성 딸기 스마트팜", "industry": "생산자 (농가/스마트팜)", "insight": "딸기 당도 측정을 위한 비전 AI 센서 시범 도입. 수확 효율 12% 향상."},
    {"region": ["군위군", "소보면", "사과 융복합단지"], "name": "MDGA 데이터허브 소보분원", "industry": "연구기관 (AI 데이터 허브)", "insight": "대구 사과 기후변화 대응 AI 모델 정확도 95% 달성. 연구원 2명 추가 채용."},
    {"region": ["군위군", "소보면", "사과 융복합단지"], "name": "소보 AI연구소", "industry": "연구기관 (AI 데이터 허브)", "insight": "스마트팜 환경-생육 상관관계 RAG 파이프라인 최적화. API 응답 속도 개선."},
    {"region": ["군위군", "소보면", "사과 융복합단지"], "name": "기후변화 대응센터 본점", "industry": "지자체/관공서", "insight": "하반기 폭염 대비 농가 지원금 심사 완료. 50여 개 농가 혜택 적용."},
    {"region": ["군위군", "우보면", "청년 농업타운"], "name": "농업 빅데이터 센터 우보분원", "industry": "연구기관 (AI 데이터 허브)", "insight": "농작물 수확량 예측 알고리즘 정밀도 전년 대비 30% 증가."},
    {"region": ["달성군", "하빈면", "하늘 농장단지"], "name": "사과 연구 센터 하빈점", "industry": "연구기관 (AI 데이터 허브)", "insight": "외국인 연구원 초빙으로 글로벌 농업 데이터 표준 교류 증진. 주말 테스트 완료."},
    {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "industry": "기업 (농기계/스마트팜)", "insight": "농식품부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출."},
    {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트농기계 대구센터", "industry": "기업 (농기계/스마트팜)", "insight": "자율주행 트랙터 센서 테스트 성공. 주간 운행 기록 데이터 3테라바이트 확보."},
    {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래 농업드론(주)", "industry": "기업 (농기계/스마트팜)", "insight": "해외 수출 물량 200% 증가. 드론 파일럿 50명 대규모 공채 및 조립 온실 증축 착공."}
]

print("Starting Mass Ingestion to Live Server (DB + Drive)...")
for item in realistic_data:
    path_str = "대구광역시/" + "/".join(item["region"]) + "/" + item["name"]
    industry = item["industry"]
    
    # 1. Onboard
    data = json.dumps({'role': 'farm', 'industry': industry, 'location': path_str.split('/')}).encode('utf-8')
    req = urllib.request.Request('https://mdga-api.onrender.com/api/user/context', data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, context=context)
    except Exception as e:
        print("Onboard Error:", e)

    # 2. Ingest
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name=\"raw_text\"\r\n\r\n'
        f'[초기 시드 데이터] {item["insight"]}\r\n'
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
        print(f"✅ Successfully ingested: {path_str}")
    except Exception as e:
        print(f"❌ Failed to ingest {path_str}: {e}")
        
    time.sleep(1) # Prevent rate limiting

print("Done Seeding Production!")
g Production!")
")
!")
")
