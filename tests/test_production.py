import requests
import sys
import time

API_URL = "https://mdga-api.onrender.com"

def test_endpoints():
    print(f"🚀 Testing Production API -> {API_URL}")
    print("=====================================")
    
    # 1. Test Explore (GET)
    print("1. Testing GET /api/hierarchy/explore (Check Engine & Ingest Data)...")
    try:
        r1 = requests.get(f"{API_URL}/api/hierarchy/explore")
        if r1.status_code == 200:
            print(f"✅ Success! Data: {r1.json().get('current', 'unknown')}")
        else:
            print(f"❌ Failed: {r1.status_code} - {r1.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Test Governance Simulation (POST)
    print("\n2. Testing POST /api/simulate/governance (Check OOM Fix & AI Generation)...")
    try:
        data = {"budget": 15000000, "region": "대구광역시 수성구 스마트밸리"}
        r2 = requests.post(f"{API_URL}/api/simulate/governance", data=data)
        if r2.status_code == 200:
            sim = r2.json()
            status = sim.get('status')
            multiplier = sim.get('simulation', {}).get('roi_multiplier', '')
            print(f"✅ Success! Status: {status}, ROI: {multiplier}")
            print(f"📝 AI Recommendation: {sim.get('simulation', {}).get('ai_recommendation', '')}")
        else:
            print(f"❌ Failed: {r2.status_code} - {r2.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_endpoints()
