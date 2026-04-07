import requests
import json
import time

def test_data_evolution_flow():
    BASE_URL = "http://localhost:8000"
    print("🧪 MDGA 데이터 누적 & 발전 플로우 테스트 시작...")

    try:
        # 1. 초기 상태 체크
        res_stats_init = requests.get(f"{BASE_URL}/api/stats").json()
        init_nodes = res_stats_init["total_nodes"]
        init_trust = res_stats_init["trust_score"]
        print(f"📊 초기 상태: 노드 {init_nodes}개, 신뢰도 {init_trust}")

        # 2. 데이터 입력 (기여)
        test_data = {
            "industry": "ABB",
            "district": "북구",
            "street": "경북대 북문",
            "raw_data": "오늘 점심 손님 50명, 매출 60만원. 날씨 좋음."
        }
        print("📥 테스트 데이터 전송 중...")
        res_analyze = requests.post(f"{BASE_URL}/api/analyze", json=test_data)
        
        if res_analyze.status_code == 200:
            print("✅ 분석 및 데이터 기여 성공")
        else:
            print("❌ 분석 요청 실패")
            return

        # 3. 데이터 누적 후 상태 변화 체크
        res_stats_after = requests.get(f"{BASE_URL}/api/stats").json()
        after_nodes = res_stats_after["total_nodes"]
        after_trust = res_stats_after["trust_score"]
        print(f"📈 기여 후 상태: 노드 {after_nodes}개, 신뢰도 {after_trust}")

        # 4. 결과 검증
        if after_nodes > init_nodes:
            print("🎊 [검증 성공] 개인이 입력한 데이터가 계층형 DB에 정상적으로 합산되었습니다.")
            print(f"💡 시스템 메시지: {res_stats_after['city_status']}")
        else:
            print("⚠️ [검증 실패] 데이터 누적이 반영되지 않았습니다.")

    except Exception as e:
        print(f"🚨 테스트 중 오류 발생: {e}")
        print("💡 백엔드 서버(./dev.sh)가 켜져 있는지 확인하세요.")

if __name__ == "__main__":
    test_data_evolution_flow()
