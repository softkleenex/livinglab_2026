import requests

BASE_URL = "https://mdga-api.onrender.com"
# BASE_URL = "http://localhost:8000"

def test_hierarchy_explore():
    print(f"Testing GET {BASE_URL}/api/v1/hierarchy/explore...")
    response = requests.get(f"{BASE_URL}/api/v1/hierarchy/explore")
    if response.status_code == 200:
        print("✅ /explore endpoint is responsive.")
        data = response.json()
        print(f"   Returned {len(data)} root regions (if any).")
    else:
        print(f"❌ /explore returned status {response.status_code}: {response.text}")

def test_user_context():
    print(f"Testing POST {BASE_URL}/api/v1/hierarchy/user/context...")
    payload = {
        "role": "farm",
        "industry": "농업",
        "location": ["서울특별시", "강남구", "역삼동", "테스트농장"]
    }
    response = requests.post(f"{BASE_URL}/api/v1/hierarchy/user/context", json=payload)
    if response.status_code == 200:
        print("✅ /user/context endpoint is responsive.")
        print("   Response:", response.json())
    else:
        print(f"❌ /user/context returned status {response.status_code}: {response.text}")

if __name__ == "__main__":
    print("Running Live E2E Tests against Production...")
    test_hierarchy_explore()
    test_user_context()
    print("Done.")
