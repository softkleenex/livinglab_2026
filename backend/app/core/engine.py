import datetime
import random
import urllib.request
import json

class HierarchyEngine:
    def __init__(self):
        self.db = {
            "name": "대구광역시", "type": "City",
            "metadata": {"trust_index": 99.0, "pulse_rate": 80, "total_value": 0, "nodes": 0, "history": []},
            "children": {},
            "data_entries": []
        }

    def get_object(self, path_list):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        for p in path_list:
            if p not in curr["children"]: return None
            curr = curr["children"][p]
        return curr

    def create_or_get_path(self, path_list, types_list):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        # Update root metadata dynamically
        curr["metadata"]["nodes"] += 1
        for i, p in enumerate(path_list):
            if p not in curr["children"]:
                lat = 35.8714 + random.uniform(-0.05, 0.05)
                lng = 128.6014 + random.uniform(-0.05, 0.05)
                curr["children"][p] = {
                    "name": p, "type": types_list[i] if i < len(types_list) else "Node",
                    "metadata": {
                        "created_at": str(datetime.date.today()), 
                        "nodes": 1, 
                        "pulse_rate": random.randint(65, 90), 
                        "total_value": 0,
                        "history": [random.randint(60, 80) for _ in range(5)],
                        "location": [lat, lng]
                    },
                    "children": {}, "data_entries": []
                }
            else:
                curr["children"][p]["metadata"]["nodes"] += 1
            curr = curr["children"][p]
        return curr
        
    def add_value_bottom_up(self, path_list, value_added):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        curr["metadata"]["total_value"] += value_added
        curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 1)
        # Update history
        curr["metadata"]["history"].append(curr["metadata"]["pulse_rate"])
        if len(curr["metadata"]["history"]) > 10: curr["metadata"]["history"].pop(0)

        for p in path_list:
            if p in curr["children"]:
                curr = curr["children"][p]
                curr["metadata"]["total_value"] += value_added
                curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 2)
                curr["metadata"]["history"].append(curr["metadata"]["pulse_rate"])
                if len(curr["metadata"]["history"]) > 10: curr["metadata"]["history"].pop(0)

engine = HierarchyEngine()

def seed_initial_data(eng):
    types = ["Gu", "Dong", "Street", "Store"]
    
    # 1. 고품질의 B2B/스마트팜/상권 초기 모의 데이터 세팅
    print("✅ B2B 특화 고용 및 매출 초기 데이터 시딩 시작...")
    realistic_data = [
        # --- 스마트팜 & 농업 부문 ---
        {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "value": 4500000, "pulse": 85, "insight": "청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성."},
        {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "value": 12000000, "pulse": 92, "insight": "신규 스마트팜 제어 솔루션 도입으로 전월 대비 인건비 15% 절감 및 수확량 20% 증대."},
        {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "초록잎 수직농장", "value": 2800000, "pulse": 71, "insight": "IoT 자동 관수 시스템 센서 교체 완료. 파트타임 수확 인력 2명 추가 배치."},
        {"region": ["수성구", "두산동", "수성못 수변상권"], "name": "수성수산 수경재배", "value": 3200000, "pulse": 78, "insight": "파트타임 수확 관리자 5명 추가 고용. 여름철 성수기 대비 출고 라인 증설."},
        {"region": ["동구", "불로동", "금호강 생태단지"], "name": "도시농부 협동조합", "value": 8900000, "pulse": 83, "insight": "버섯 재배 모듈 10개 추가 설치. 지역 주민 대상 포장 알바 4명 고용 창출."},
        {"region": ["달성군", "유가읍", "테크노폴리스 외곽"], "name": "달성 딸기 스마트팜", "value": 15500000, "pulse": 88, "insight": "딸기 당도 측정을 위한 비전 AI 센서 시범 도입. 수확 효율 12% 향상."},
        {"region": ["군위군", "효령면", "경북대 사과연구소"], "name": "명품 사과 AI 농장", "value": 25000000, "pulse": 95, "insight": "드론 기반 방제 시스템 도입 완료. 수확기 인력 부족 문제 30% 해결 전망."},
        {"region": ["군위군", "부계면", "청년귀농특구"], "name": "청년 버섯 농원", "value": 6500000, "pulse": 80, "insight": "표고버섯 온라인 직거래 채널 오픈. 월평균 매출 40% 상승 예상."},
        {"region": ["달성군", "하빈면", "친환경 화훼단지"], "name": "하빈 꽃 화훼농장", "value": 18000000, "pulse": 89, "insight": "봄철 성수기 대비 임시직 10명 고용. 출하량 전년 동기 대비 15% 상승."},
        
        # --- 요식업 & 서비스 상권 부문 ---
        {"region": ["중구", "삼덕동", "동성로"], "name": "MDGA 로스터리 카페", "value": 8500000, "pulse": 88, "insight": "비 오는 날 배달 프로모션 대성공. 배달 라이더 연계 콜 수 150건 돌파."},
        {"region": ["중구", "삼덕동", "동성로"], "name": "동성로 한우오마카세", "value": 25000000, "pulse": 95, "insight": "홀 서빙 정규직 2명 고용 창출. 단체 예약 증가로 2분기 매출 목표 조기 달성 예상."},
        {"region": ["중구", "삼덕동", "동성로"], "name": "24시 국밥집 삼덕본점", "value": 12400000, "pulse": 82, "insight": "야간 매출 비중 40% 초과. 야간 할증 수당 적용 파트타이머 3명 충원 완."},
        {"region": ["중구", "삼덕동", "동성로"], "name": "동성로 대형 베이커리", "value": 35000000, "pulse": 93, "insight": "팝업스토어 유치 성공. 주말 방문객 수 3000명 돌파, 매출 역대 최고치 경신."},
        {"region": ["중구", "동인동", "신천역 상권"], "name": "MZ 타코야끼", "value": 3500000, "pulse": 76, "insight": "주말 웨이팅 증가로 테이블 추가 배치 및 키오스크 도입. 아르바이트 2명 채용."},
        {"region": ["중구", "대봉동", "김광석거리"], "name": "레트로 뮤직 바", "value": 5800000, "pulse": 68, "insight": "관광객 대상 SNS 이벤트로 주말 방문객 20% 증가."},
        {"region": ["중구", "대봉동", "김광석거리"], "name": "대봉동 카페 루프탑", "value": 7200000, "pulse": 75, "insight": "루프탑 테라스 리모델링 후 야간 매출 15% 상승."},
        {"region": ["수성구", "범어동", "범어네거리"], "name": "수성 파인다이닝", "value": 31000000, "pulse": 91, "insight": "주류 페어링 수요 증가로 전문 소믈리에 1명 스카웃. 테이블 단가 20% 상승."},
        {"region": ["수성구", "범어동", "범어네거리"], "name": "AI 뷰티살롱 범어점", "value": 6700000, "pulse": 72, "insight": "스마트 예약 시스템 도입 후 노쇼(No-show) 비율 8% 감소. 신규 디자이너 1명 채용."},
        {"region": ["수성구", "범어동", "범어네거리"], "name": "범어 요가 스튜디오", "value": 12000000, "pulse": 85, "insight": "프리미엄 1:1 레슨 문의 급증. 전문 강사 2명 추가 배치 완료."},
        {"region": ["수성구", "만촌동", "수성구청역 주변"], "name": "대형 베이커리 르뱅", "value": 19500000, "pulse": 85, "insight": "신메뉴 '크루키' 완판 행진. 제빵 보조 인력 2명 추가 고용."},
        {"region": ["달서구", "상인동", "상인역 번화가"], "name": "초저가 마트 상인점", "value": 42000000, "pulse": 96, "insight": "명절 대비 창고 정리 알바 단기 15명 고용. 신선식품 회전율 전년 대비 30% 증가."},
        {"region": ["달서구", "상인동", "상인역 번화가"], "name": "상인동 돈카츠 전문점", "value": 9500000, "pulse": 81, "insight": "배달의민족 맛집 랭킹 1위 달성. 주방 보조 1명 긴급 채용."},
        {"region": ["달서구", "진천동", "진천역 상권"], "name": "달서 헬스피트니스", "value": 9800000, "pulse": 84, "insight": "여름 시즌권 판매 호조. PT 트레이너 3명 계약 완료 및 필라테스 기구 추가 도입."},
        {"region": ["남구", "대명동", "안지랑 곱창골목"], "name": "원조 불막창", "value": 14000000, "pulse": 89, "insight": "외국인 관광객 증가로 영/중/일 다국어 메뉴판 도입. 주말 피크타임 매출 25% 상승."},
        {"region": ["남구", "대명동", "안지랑 곱창골목"], "name": "안지랑 청춘 곱창", "value": 11000000, "pulse": 83, "insight": "20대 대상 주류 무제한 이벤트 성황. 야간 알바 2명 증원."},
        {"region": ["북구", "칠성동", "삼성창조캠퍼스"], "name": "오가닉 샐러드바", "value": 6500000, "pulse": 77, "insight": "오피스 상권 직장인 정기 구독권 판매량 50% 급증."},
        
        # --- 첨단 제조업 및 물류, IT ---
        {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "value": 55000000, "pulse": 98, "insight": "중소벤처기업부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출."},
        {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "(주)데이터블록", "value": 18500000, "pulse": 81, "insight": "신규 빅데이터 플랫폼 출시. 백엔드 개발자 2명 신규 채용."},
        {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "클라우드 시큐어(주)", "value": 21000000, "pulse": 84, "insight": "B2B 보안 솔루션 도입 기업 100곳 돌파. 고객 지원팀 3명 추가 고용."},
        {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트물류(주) 대구센터", "value": 34000000, "pulse": 82, "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환."},
        {"region": ["달서구", "성서동", "성서산업단지"], "name": "정밀테크 부품가공", "value": 22000000, "pulse": 65, "insight": "원자재 가격 상승으로 이익률 하락 우려. 공장 교대 근무자 2명 단축 근무 실시 중."},
        {"region": ["달서구", "성서동", "성서산업단지"], "name": "성서 K-배터리 소재", "value": 89000000, "pulse": 96, "insight": "2차전지 소재 납품 계약 성사. 생산직 15명 긴급 투입."},
        {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래차 밧데리(주)", "value": 125000000, "pulse": 99, "insight": "해외 수출 물량 200% 증가. 생산직 50명 대규모 공채 및 공장 2동 증축 착공."},
        {"region": ["달성군", "다사읍", "국가산업단지"], "name": "메디컬 로봇(주)", "value": 85000000, "pulse": 94, "insight": "의료용 로봇 식약처 인증 획득. 조립 라인 작업자 12명 신규 고용."},
        {"region": ["동구", "신암동", "동대구역 복합환승"], "name": "대구 IT 인재개발원", "value": 15000000, "pulse": 76, "insight": "국비 지원 코딩 부트캠프 3기 개강. 강사 2명 및 행정 매니저 1명 고용."},
        {"region": ["동구", "신암동", "동대구역 복합환승"], "name": "글로벌 무역 브로커", "value": 45000000, "pulse": 88, "insight": "미주 수출 라인 확보 성공. 해외 영업팀 3명 경력직 채용 완료."},
        {"region": ["서구", "중리동", "서대구공단"], "name": "에코 재생에너지", "value": 48000000, "pulse": 87, "insight": "태양광 패널 생산량 40% 증가. 품질 검사 인원 8명 특별 채용."},
        {"region": ["남구", "봉덕동", "앞산 카페거리"], "name": "앞산 테크 랩", "value": 7500000, "pulse": 70, "insight": "초기 시드 투자 2억 유치 성공. 프론트엔드 개발자 1명 채용 진행 중."},
        {"region": ["북구", "검단동", "유통단지"], "name": "엑스코 종합물류", "value": 21000000, "pulse": 83, "insight": "박람회 시즌 도래로 화물 운송량 50% 급증. 배송 기사 5명 추가 투입."}
    ]
    
    for item in realistic_data:
        path = ["대구광역시"] + item["region"] + [item["name"]]
        # 1. 노드 생성
        target_obj = eng.create_or_get_path(path, types)
        # 2. 총 자산(매출/효과) 롤업
        eng.add_value_bottom_up(path, item["value"])
        # 3. 고용/매출 관련 초기 인사이트 데이터를 data_entries에 직접 주입
        import hashlib
        import datetime
        trust_index = random.uniform(85.0, 99.0)
        entry = {
            "timestamp": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M")),
            "insights": f"[초기 B2B 공공/기업 연동 데이터] {item['insight']}",
            "hash": hashlib.sha256(item['insight'].encode()).hexdigest(),
            "drive_link": None,
            "scope": "store_specific",
            "trust_index": round(trust_index, 1),
            "raw_text": f"B2B/공공 API 연동망을 통해 수집된 '{item['name']}'의 실시간 고용 및 경영 스냅샷 데이터입니다.",
            "effective_value": int(item["value"] * 0.1) # 인사이트의 가치를 자산의 10%로 책정
        }
        if "data_entries" not in target_obj:
            target_obj["data_entries"] = []
        target_obj["data_entries"].append(entry)
        
    print("✅ B2B 특화 고용 및 매출 초기 데이터 시딩 완료!")

seed_initial_data(engine)
