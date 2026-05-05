import json
import urllib.parse
import requests
import warnings
warnings.filterwarnings("ignore")

API_URL = "https://mdga-api.onrender.com"

def test_data_flow():
    print(f"🚀 Testing Data Flow -> {API_URL}")
    print("=====================================")
    
    # 1. Test Ingest Flow
    print("\n1. Testing Ingest Flow (POST /api/v1/ingest => GET /api/hierarchy/explore)...")
    try:
        files = {'file': ('dummy_test.txt', b'Hello World Dummy Content for Google Drive', 'text/plain')}
        data = {
            'raw_text': '테스트 구/동/거리/가게 데이터 저장 흐름 테스트',
            'location': '북구/산격동/연암로 스마트팜 밸리/지니스팜 제1농장',
            'is_guest': 'false',
            'industry': '스마트팜'
        }
        res = requests.post(f"{API_URL}/api/v1/ingest", data=data, files=files, verify=False, timeout=30)
        res.raise_for_status()
        body = res.json()
        print(f"  👉 Ingest Status: {body.get('status', 'OK')}")
        path = body.get('assigned_path', [])
        print(f"  👉 Path assigned: {path}")
        entry = body.get('entry', {})
        if entry.get('drive_link'):
            print(f"  👉 Saved to Drive: {entry['drive_link']}")
        else:
            print(f"  ⚠️  Drive link: {entry.get('drive_link', 'None')}")
            
        print(f"  🔍 Verifying via Explore... Path: {path}")
        path_query = urllib.parse.quote("/".join(path))
        res2 = requests.get(f"{API_URL}/api/hierarchy/explore?path={path_query}", verify=False, timeout=15)
        res2.raise_for_status()
        obj_data = res2.json()
        entries = obj_data.get("data_entries", [])
        print(f"  ✅ Success! Found {len(entries)} entries in target path.")
        if entries:
            print(f"   -> Latest entry hash: {entries[-1].get('hash', '')[:8]}...")
            
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"  ❌ Ingest flow error: {e}")

    # 2. Test User Context Flow
    print("\n2. Testing User Context Flow (POST /api/v1/user/context)...")
    try:
        data = {'role': 'farm', 'industry': '스마트팜', 'location': ['대구광역시', '북구', '산격동', '연암로 스마트팜 밸리', '지니스팜 제1농장']}
        res = requests.post(f"{API_URL}/api/v1/user/context", json=data, verify=False, timeout=30)
        res.raise_for_status()
        body = res.json()
        print(f"  👉 User Context Status: {body['status']}")
        print(f"  ✅ Success! Active Role: {body.get('role')}")
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"  ❌ User Context flow error: {e}")

if __name__ == '__main__':
    test_data_flow()