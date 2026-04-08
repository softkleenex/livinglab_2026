import urllib.request
import urllib.parse
import json

API_URL = "https://mdga-api.onrender.com"

def test_endpoints():
    print(f"🚀 Testing Production API -> {API_URL}")
    print("=====================================")
    
    # 1. Test Explore (GET)
    print("1. Testing GET /api/hierarchy/explore (Check Engine & Ingest Data)...")
    try:
        req1 = urllib.request.Request(f"{API_URL}/api/hierarchy/explore")
        with urllib.request.urlopen(req1) as response:
            data = json.loads(response.read().decode())
            print(f"✅ Success! Data: {data.get('current', 'unknown')}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Test Governance Simulation (POST)
    print("\n2. Testing POST /api/simulate/governance (Check OOM Fix & AI Generation)...")
    try:
        data = urllib.parse.urlencode({"budget": 15000000, "region": "대구광역시 수성구 스마트밸리"}).encode('utf-8')
        req2 = urllib.request.Request(f"{API_URL}/api/simulate/governance", data=data)
        with urllib.request.urlopen(req2) as response:
            sim = json.loads(response.read().decode())
            status = sim.get('status')
            multiplier = sim.get('simulation', {}).get('roi_multiplier', '')
            print(f"✅ Success! Status: {status}, ROI: {multiplier}")
            print(f"📝 AI Recommendation: {sim.get('simulation', {}).get('ai_recommendation', '')}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_endpoints()
