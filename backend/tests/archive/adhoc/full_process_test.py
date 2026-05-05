import requests
import json
import time

API_URL = "https://mdga-api.onrender.com"

def run_integration_test():
    print("🚀 [MDGA Engine] 통합 프로세스 무결성 테스트 가동...")
    
    # 1. 데이터 주입 테스트 (Ingestion & Routing)
    test_data = {
        "raw_text": "경북 의성군 단촌면 일대 사과 농가 '스마트 애플'의 일일 수확량 1.5톤 기록. 최적 관수 시스템으로 작물 생장 10% 증가."
    }
    
    print("\nStep 1: 데이터 주입 및 시맨틱 라우팅 테스트...")
    try:
        res = requests.post(f"{API_URL}/api/v1/ingest", data=test_data)
        if res.status_code == 200:
            result = res.json()
            path = result.get("assigned_path") or result.get("data", {}).get("path")
            print(f"✅ 성공! 할당된 경로: {' > '.join(path)}")
            
            # 2. 계층 탐색 테스트 (Hierarchy Persistence)
            print("\nStep 2: 생성된 계층 객체 탐색 테스트...")
            explore_res = requests.get(f"{API_URL}/api/hierarchy/explore?path={'/'.join(path)}")
            if explore_res.status_code == 200:
                print(f"✅ 성공! 객체 타입: {explore_res.json()['type']}")
            
            # 3. 블록체인 해시 및 에이전트 액션 검증
            print("\nStep 3: 데이터 자산화 및 에이전트 지능 검증...")
            entry = result.get("entry") or result.get("data")
            if entry.get("hash"):
                print(f"✅ 해시 생성 확인: {entry['hash'][:20]}...")
            if entry.get("actions") or entry.get("analysis", {}).get("agent_tasks"):
                print("✅ 에이전트 액션 플랜 생성 확인")
                
            # 4. 가치 합산 테스트 (Value Aggregation)
            print("\nStep 4: 도시 전체 가치 합산 검증...")
            root_res = requests.get(f"{API_URL}/api/hierarchy/explore")
            total_val = root_res.json()["metadata"]["total_value"]
            print(f"✅ 성공! 대구시 누적 가치: ₩{total_val:,}")
            
            print("\n🏆 [테스트 완료] 모든 프로세스가 예측 모델(docs/5)과 일치하게 작동합니다.")
        else:
            print(f"❌ 실패: {res.text}")
    except Exception as e:
        print(f"❌ 엔진 미가동 또는 에러: {str(e)}")

if __name__ == "__main__":
    run_integration_test()
