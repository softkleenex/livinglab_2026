import json
import random
from datetime import datetime, timedelta


def generate_sensor_json(sensor_type):
    now = datetime.now()
    if sensor_type == "smartfarm":
        return json.dumps(
            {
                "timestamp": (
                    now - timedelta(minutes=random.randint(10, 1000))
                ).strftime("%Y-%m-%d %H:%M:%S"),
                "sensors": {
                    "temperature_c": round(random.uniform(15.0, 30.5), 1),
                    "humidity_percent": round(random.uniform(40.0, 85.0), 1),
                    "co2_ppm": random.randint(400, 1200),
                    "ph_level": round(random.uniform(5.0, 7.5), 2),
                    "ec_level": round(random.uniform(1.0, 3.0), 2),
                    "light_lux": random.randint(5000, 50000),
                },
                "public_data_overlay": {
                    "KMA_weather": {
                        "regional_avg_temp": round(random.uniform(14.0, 29.0), 1),
                        "precipitation_prob": random.randint(0, 60),
                        "weather_warning": random.choice(
                            [
                                "None",
                                "Heavy Rain Advisory",
                                "Heatwave Watch",
                                "Dry Warning",
                            ]
                        ),
                    },
                    "RDA_soil": {
                        "soil_type": random.choice(
                            ["Sandy Loam", "Clay Loam", "Silt Loam"]
                        ),
                        "avg_moisture": round(random.uniform(20.0, 45.0), 1),
                    },
                    "KAMIS_market": {
                        "crop_price_krw_per_kg": random.randint(2500, 15000),
                        "price_trend": random.choice(["Rising", "Stable", "Falling"]),
                    },
                },
                "status": random.choice(
                    ["OPTIMAL", "WARNING", "OPTIMAL", "OPTIMAL", "CRITICAL"]
                ),
                "yield_forecast": f"{random.choice(['+', '-'])}{random.randint(2, 20)}%",
            },
            indent=2,
            ensure_ascii=False,
        )
    elif sensor_type == "weather_station":
        return json.dumps(
            {
                "timestamp": (now - timedelta(minutes=random.randint(1, 60))).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "KMA_data": {
                    "wind_speed_ms": round(random.uniform(0.5, 8.5), 1),
                    "wind_direction": random.choice(
                        ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
                    ),
                    "solar_radiation_wm2": random.randint(100, 900),
                    "precipitation_mm": round(random.uniform(0, 25.0), 1),
                    "uv_index": random.randint(1, 11),
                    "extreme_weather_alert": random.choice([False, False, True, False]),
                },
                "public_api_source": "기상청 (KMA) 공공데이터포털 연동",
            },
            indent=2,
            ensure_ascii=False,
        )
    elif sensor_type == "soil_sensor":
        return json.dumps(
            {
                "report_date": now.strftime("%Y-%m-%d %H:%M"),
                "RDA_data": {
                    "soil_moisture_percent": random.randint(15, 65),
                    "soil_temperature_c": round(random.uniform(10.0, 25.0), 1),
                    "nitrogen_mg_kg": random.randint(10, 80),
                    "phosphorus_mg_kg": random.randint(5, 50),
                    "potassium_mg_kg": random.randint(50, 150),
                    "soil_health_index": round(random.uniform(50.0, 98.0), 1),
                },
                "public_api_source": "농촌진흥청 토양환경정보시스템 (흙토람) 연동",
            },
            indent=2,
            ensure_ascii=False,
        )
    elif sensor_type == "public_dashboard":
        return json.dumps(
            {
                "report_date": now.strftime("%Y-%m-%d"),
                "KOSIS_statistics": {
                    "total_active_farms": random.randint(100, 1000),
                    "avg_smartfarm_adoption_rate": f"{round(random.uniform(30.0, 90.0), 1)}%",
                    "monthly_carbon_reduction_tons": random.randint(50, 800),
                    "agricultural_gdp_growth": f"+{round(random.uniform(0.5, 4.5), 1)}%",
                },
                "KAMIS_market_trends": {
                    "top_selling_crop": random.choice(
                        [
                            "딸기",
                            "토마토",
                            "파프리카",
                            "상추",
                            "사과",
                            "샤인머스켓",
                            "참외",
                            "마늘",
                        ]
                    ),
                    "price_index": f"{random.choice(['+', '-'])}{round(random.uniform(1.0, 10.0), 1)}% vs last month",
                    "export_volume_tons": random.randint(10, 500),
                },
                "public_api_source": "통계청(KOSIS) 및 aT 농산물유통정보(KAMIS) 연동",
            },
            indent=2,
            ensure_ascii=False,
        )
    return "{}"


def get_massive_data():
    massive_data = []

    # --- 1. MACRO: CITY & GU LEVEL (Public Dashboards) ---
    macro_nodes = [
        {
            "state": "대구광역시",
            "region": [],
            "name": "대구광역시청 데이터허브",
            "industry": "공공/지자체",
            "type": "public_dashboard",
            "insight": "[KOSIS/KMA 연동] 2026 대구 스마트시티 및 농업 전환 요약. 스마트팜 보급률 지속 상승 중. 탄소중립 실천 인증 농가 확대. 폭염 대비 KMA 경보 시스템 실시간 가동 중.",
        },
        {
            "state": "대구광역시",
            "region": ["북구"],
            "name": "북구청 산업지원과",
            "industry": "공공/지자체",
            "type": "public_dashboard",
            "insight": "[KOSIS 연동] 북구 연암로 스마트팜 밸리 인프라 확충. 한국전력공사 전력데이터 개방포털 실시간 연동. 전력 피크 시간대 사용량 15% 감축.",
        },
        {
            "state": "대구광역시",
            "region": ["군위군"],
            "name": "군위군 농업정책과",
            "industry": "공공/지자체",
            "type": "public_dashboard",
            "insight": "[KAMIS 연동] 군위 사과 및 특용작물 스마트 농업 1단계 완료. 도입 농가 생산성 15% 증가, 매출 30% 증대. aT 유통정보 기준 출하 최적기 알림 서비스 개시.",
        },
        {
            "state": "대구광역시",
            "region": ["달성군"],
            "name": "달성군 농업기술센터",
            "industry": "연구기관",
            "type": "public_dashboard",
            "insight": "[RDA 연동] 달성군 토양 성분 분석 보고서 발간. 흙토람 API 연동을 통한 맞춤형 비료 처방 시스템 가동률 80% 달성.",
        },
        {
            "state": "경상북도",
            "region": ["상주시"],
            "name": "상주 스마트팜 혁신밸리 관제센터",
            "industry": "공공/지자체",
            "type": "public_dashboard",
            "insight": "[KOSIS/KAMIS 연동] 청년 창업농 육성 및 원예단지 데이터 통합 관제. 도내 농산물 출하량 1위 유지. 스마트팜 빅데이터 센터 실시간 데이터 연동 중.",
        },
        {
            "state": "경상북도",
            "region": ["안동시"],
            "name": "안동 농업 빅데이터 센터",
            "industry": "공공/지자체",
            "type": "public_dashboard",
            "insight": "[KMA 연동] 경북 북부권 기상 이변 대응 센터. 사과/마 계절별 수확량 예측 알고리즘 정밀도 92% 달성.",
        },
        {
            "state": "경상북도",
            "region": ["포항시"],
            "name": "포항 기후변화 농업연구소",
            "industry": "연구기관",
            "type": "public_dashboard",
            "insight": "[KMA/RDA 연동] 해안가 기후 특화 아열대 작물(바나나, 한라봉) 재배 솔루션 보급 확대. 풍해 예방 지침 실시간 배포 중.",
        },
    ]
    massive_data.extend(macro_nodes)

    # --- 2. MICRO: SMART FARMS (Producers) ---
    farm_locations = [
        ("대구광역시", "북구", "산격동", "연암로 스마트팜 밸리"),
        ("대구광역시", "달성군", "유가읍", "테크노폴리스 외곽"),
        ("대구광역시", "군위군", "효령면", "사과 재배단지"),
        ("대구광역시", "달서구", "성서동", "도시형 식물공장"),
        ("경상북도", "상주시", "사벌국면", "스마트팜 혁신밸리"),
        ("경상북도", "의성군", "다인면", "마늘 스마트팜 단지"),
        ("경상북도", "포항시", "흥해읍", "첨단 시설원예단지"),
        ("경상북도", "성주군", "선남면", "참외 하우스단지"),
        ("경상북도", "영천시", "금호읍", "포도 재배단지"),
        ("경상북도", "경주시", "강동면", "토마토 수경재배단지"),
    ]

    farm_names_pool = [
        "지니스팜",
        "에그리테크",
        "초록잎",
        "수성수산",
        "달성농산",
        "금호강 팜스",
        "팔공산 스마트팜",
        "연암 원예",
        "청년농부 연합",
        "미래농장",
        "에코 스마트",
        "하이테크 팜",
        "다인 마늘팜",
        "풍산 사과농장",
        "흥해 온실",
        "선남 참외농장",
        "신라 스마트팜",
        "별빛 포도농원",
        "푸른들 딸기농장",
        "싱싱 토마토팜",
        "황금사과원",
        "태양의 참외농원",
        "우리밀콩농장",
        "새벽이슬 버섯농장",
        "백두산 약초원",
        "영일만 스마트수산",
        "동해안 전복양식장",
        "청정 한우농장",
        "바른 양돈장",
        "무지개 양계장",
    ]

    # deterministic random for consistency across scripts
    rng = random.Random(42)

    for i in range(50):
        loc = rng.choice(farm_locations)
        name = f"{rng.choice(farm_names_pool)} 제{rng.randint(1, 10)}농장"
        massive_data.append(
            {
                "state": loc[0],
                "region": list(loc[1:]),
                "name": name,
                "industry": "농업/스마트팜",
                "type": "smartfarm",
                "insight": f"[스마트팜 현장] {loc[-1]} 내 위치. 자동 관수/공조 시스템 가동 중. 최근 KMA 기상 데이터 연동으로 병해충 발생 확률 사전 예측하여 대응 완료.",
            }
        )

    # --- 3. MICRO: RESEARCH & DATA HUBS ---
    research_locations = [
        ("대구광역시", "중구", "삼덕동", "동성로"),
        ("대구광역시", "수성구", "대흥동", "수성알파시티"),
        ("경상북도", "구미시", "선산읍", "구미 농업연구소"),
        ("경상북도", "경산시", "하양읍", "산학협력단지"),
        ("경상북도", "김천시", "어모면", "농산물검역본부"),
    ]

    research_names = [
        "MDGA 데이터허브",
        "AI 농업연구소",
        "기후변화 대응센터",
        "농업 빅데이터 센터",
        "농산물 품질관리소",
        "농업기술실용화재단",
        "스마트 토양 분석 랩",
        "지역 농업 R&D 센터",
        "친환경 비료 랩",
        "스마트 종자 개량소",
    ]

    for i in range(20):
        loc = rng.choice(research_locations)
        name = f"{rng.choice(research_names)} {rng.choice(['본원', '분원', '연구소', '데이터센터', '테스트베드'])}"
        massive_data.append(
            {
                "state": loc[0],
                "region": list(loc[1:]),
                "name": name,
                "industry": "연구기관",
                "type": "soil_sensor",
                "insight": f"[연구 분석] {loc[-1]}에서 공공 RDA 토양 데이터와 자체 센서 데이터를 결합한 융복합 연구 진행. 비료 사용량 20% 최적화 모델 개발 및 실증 테스트 중.",
            }
        )

    # --- 4. MICRO: MANUFACTURING, LOGISTICS, IT ---
    ind_locations = [
        ("대구광역시", "달서구", "성서동", "성서산업단지"),
        ("대구광역시", "달성군", "현풍읍", "테크노폴리스"),
        ("경상북도", "구미시", "공단동", "구미국가산업단지"),
        ("경상북도", "경산시", "진량읍", "경산일반산업단지"),
        ("경상북도", "칠곡군", "왜관읍", "왜관산업단지"),
        ("대구광역시", "달서구", "대천동", "성서첨단산업단지"),
    ]

    ind_names = [
        "AI 비전로보틱스",
        "스마트농기계 배터리",
        "미래 농업드론",
        "정밀기계 스마트팜(주)",
        "자율주행 트랙터(주)",
        "에코 비료패키징",
        "농산물 로지스틱스",
        "스마트온실(주)",
        "콜드체인 솔루션(주)",
        "애그테크 네트웍스",
        "탄소저감 에너지(주)",
        "농업용 센서 IoT(주)",
        "스마트 밸브 제어기기",
        "빅데이터 물류(주)",
    ]

    for i in range(20):
        loc = rng.choice(ind_locations)
        name = (
            rng.choice(ind_names)
            + f" {rng.choice(['대구센터', '경북센터', '연구소', '제조공장', '물류허브'])}"
        )
        massive_data.append(
            {
                "state": loc[0],
                "region": list(loc[1:]),
                "name": name,
                "industry": rng.choice(["IT/로보틱스", "첨단물류", "농기계/배터리"]),
                "type": "weather_station",
                "insight": f"[애그테크 산업] {loc[-1]} 거점 기업. 생산라인 풀가동. 공공 데이터(KAMIS) 물동량 예측을 통한 스마트 물류/콜드체인망 배차 최적화 달성.",
            }
        )

    return massive_data
