import json
import urllib.parse
import requests
import warnings
warnings.filterwarnings("ignore")

API_URL = "https://mdga-api.onrender.com"

def test_endpoints():
    print(f"🚀 Testing Production API -> {API_URL}")
    print("=====================================")
    
    # 1. Test Explore (GET)
    print("1. Testing GET /api/hierarchy/explore (Check Engine & Ingest Data)...")
    try:
        res1 = requests.get(f"{API_URL}/api/hierarchy/explore", verify=False, timeout=15)
        res1.raise_for_status()
        data = res1.json()
        print(f"✅ Success! Data: {data.get('current', 'unknown')}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Test Governance Simulation (POST)
    print("\n2. Testing POST /api/simulate/governance (Check OOM Fix & AI Generation)...")
    try:
        data = {"budget": 15000000, "region": "대구광역시 수성구 스마트밸리"}
        res2 = requests.post(f"{API_URL}/api/simulate/governance", data=data, verify=False, timeout=30)
        res2.raise_for_status()
        sim = res2.json()
        status = sim.get('status')
        multiplier = sim.get('simulation', {}).get('roi_multiplier', '')
        print(f"✅ Success! Status: {status}, ROI: {multiplier}")
        print(f"📝 AI Recommendation: {sim.get('simulation', {}).get('ai_recommendation', '')}")
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_endpoints()