import os
import json
import ssl
import time
import requests
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from PIL import Image

load_dotenv('backend/.env')

context = ssl._create_unverified_context()
requests.packages.urllib3.disable_warnings()

API_URL = "https://mdga-api.onrender.com"
HEADERS = {"Authorization": "Bearer mdga-admin-seed-2026"}

print("==================================================")
print("🚀 MASSIVE B2B ENTERPRISE DATA SEEDING (50+ NODES) 🚀")
print("==================================================")

# 1. Reset Schema
print("\n[1/3] Resetting Production Database Schema...")
try:
    res = requests.post(f'{API_URL}/api/v1/reset_schema', headers=HEADERS, verify=False)
    print("  -> Schema Reset Successfully:", res.text)
except Exception as e:
    print("  -> Failed to reset schema:", e)

# 2. Dummy Image Generation
dummy_img_path = "seed_dummy.png"
img = Image.new('RGB', (200, 200), color = (45, 60, 80))
img.save(dummy_img_path)

# 3. Procedural Data Generation
print("\n[2/3] Generating Massive Realistic Datasets...")

def generate_sensor_json(sensor_type):
    if sensor_type == "smartfarm":
        return json.dumps({
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(10, 1000))).strftime("%Y-%m-%d %H:%M"),
            "sensors": {
                "temperature": round(random.uniform(22.0, 26.5), 1),
                "humidity": round(random.uniform(60.0, 75.0), 1),
                "co2_ppm": random.randint(400, 800),
                "ph_level": round(random.uniform(5.5, 6.5), 2),
                "ec_level": round(random.uniform(1.2, 2.5), 2)
            },
            "status": random.choice(["OPTIMAL", "WARNING", "OPTIMAL", "OPTIMAL"]),
            "yield_forecast": f"+{random.randint(5, 15)}%"
        }, indent=2)
    elif sensor_type == "logistics":
        return json.dumps({
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 60))).strftime("%Y-%m-%d %H:%M"),
            "fleet_status": "ACTIVE",
            "agv_battery_avg": f"{random.randint(40, 98)}%",
            "inventory_turnover": round(random.uniform(3.5, 8.2), 1),
            "throughput_daily": random.randint(15000, 30000),
            "bottleneck_detected": random.choice([False, False, True])
        }, indent=2)
    elif sensor_type == "fnb":
        return json.dumps({
            "report_date": datetime.now().strftime("%Y-%m-%d"),
            "daily_revenue": random.randint(1500000, 5000000),
            "foot_traffic": random.randint(300, 1200),
            "peak_hours": ["12:00-13:00", "18:00-20:00"],
            "delivery_app_ratio": f"{random.randint(20, 60)}%"
        }, indent=2)
    return "{}"

massive_data = [
    # --- MACRO: CITY & GU LEVEL ---
    {"region": [], "name": "대구광역시청 데이터허브", "industry": "공공", "insight": "[2026 대구 스마트시티 총괄 지표]\n- 1분기 GDP 성장률: 2.1%\n- 스마트팜 밸리 조성율: 85%\n- 성서산단 스마트팩토리 전환율: 42%\n(공공데이터포털 연동 API 요약)"},
    {"region": ["북구"], "name": "북구청 산업지원과", "industry": "공공", "insight": "북구 연암로 스마트팜 밸리 일대 전력망 확충 공사 완료. 추가 15개 농가 입주 대기 중. 지역 화폐 결제액 전월 대비 12% 상승."},
    {"region": ["중구"], "name": "중구청 상권활성화본부", "industry": "공공", "insight": "동성로 르네상스 프로젝트 1단계 완료. 유동인구 주말 평균 15만명 회복. 외국인 관광객 소비액 30% 증가."},
    {"region": ["달서구"], "name": "성서산업단지 관리공단", "industry": "공공", "insight": "성서산단 입주기업 3,000개사 전력 피크타임 모니터링 결과, 오후 2~4시 공장 가동률 92% 달성. 탄소 배출 저감 캠페인으로 월 500톤 절감."},
]

# --- MICRO: SMART FARMS (북구 & 달성군) ---
farm_names = ["지니스팜", "에그리테크", "초록잎", "수성수산", "달성 딸기", "금호강 토마토", "팔공산 메론", "연암 파프리카"]
for i, name in enumerate(farm_names):
    massive_data.append({
        "region": ["북구", "산격동", "연암로 스마트팜 밸리"] if i < 4 else ["달성군", "현풍읍", "테크노폴리스 외곽"],
        "name": f"{name} 제{random.randint(1,5)}농장",
        "industry": "스마트팜",
        "insight": generate_sensor_json("smartfarm")
    })

# --- MICRO: F&B / RETAIL (중구 동성로 & 달서구 상인동) ---
fnb_names = ["MDGA 로스터리", "동성로 한우오마카세", "24시 국밥집", "마라탕 1번지", "디저트 부띠끄", "스시야", "베이커리 카페", "수제맥주 펍"]
for i, name in enumerate(fnb_names):
    massive_data.append({
        "region": ["중구", "삼덕동", "동성로"] if i < 5 else ["달서구", "상인동", "상인역 번화가"],
        "name": f"{name} {random.choice(['본점', '동성로점', '상인점'])}",
        "industry": random.choice(["식음료", "요식업", "도소매"]),
        "insight": generate_sensor_json("fnb")
    })

# --- MICRO: MANUFACTURING & LOGISTICS (달서구 성서산단) ---
ind_names = ["AI 비전로보틱스", "스마트물류 대구센터", "미래차 밧데리", "정밀기계 금형(주)", "자율주행 부품(주)", "에코 패키징", "로지스틱스 24", "나노반도체(주)"]
for i, name in enumerate(ind_names):
    massive_data.append({
        "region": ["달서구", "성서동", "성서산업단지"],
        "name": name,
        "industry": random.choice(["IT/서비스", "물류업", "제조업"]),
        "insight": generate_sensor_json("logistics")
    })

print(f"Generated {len(massive_data)} realistic B2B/Public entries.")

print("\n[3/3] Ingesting Data into Supabase & Google Drive Data Lake...")
success_count = 0
for idx, item in enumerate(massive_data):
    if len(item["region"]) == 0:
        path_str = f"대구광역시/{item['name']}"
    else:
        path_str = "대구광역시/" + "/".join(item["region"]) + "/" + item["name"]
    
    industry = item["industry"]
    
    try:
        # Pre-create context
        requests.post(f"{API_URL}/api/v1/user/context", json={
            'role': 'store', 'industry': industry, 'location': path_str.split('/')
        }, headers=HEADERS, verify=False)
    except Exception:
        pass

    with open(dummy_img_path, 'rb') as f:
        files = {'file': (f"evidence_{idx}.png", f, 'image/png')}
        data = {
            "raw_text": item["insight"],
            "location": path_str,
            "industry": industry,
            "is_guest": "false"
        }
        try:
            res = requests.post(f"{API_URL}/api/v1/ingest", data=data, files=files, headers=HEADERS, verify=False)
            if res.status_code == 200:
                print(f"  [{idx+1}/{len(massive_data)}] ✅ {path_str}")
                success_count += 1
            else:
                print(f"  [{idx+1}/{len(massive_data)}] ❌ Failed: {item['name']} ({res.text})")
        except Exception as e:
            print(f"  [{idx+1}/{len(massive_data)}] ❌ Error: {item['name']} ({e})")
            
    time.sleep(0.5) # Slight delay to avoid massive rate limits if any

if os.path.exists(dummy_img_path):
    os.remove(dummy_img_path)

print("\n==================================================")
print(f"🎉 MASSIVE SEEDING COMPLETE! ({success_count}/{len(massive_data)} Success) 🎉")
print("==================================================")
