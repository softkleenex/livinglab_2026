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
    print("\n1. Testing Ingest Flow (POST /api/ingest => GET /api/hierarchy/explore)...")
    try:
        files = {'file': ('dummy_test.txt', b'Hello World Dummy Content for Google Drive', 'text/plain')}
        data = {'raw_text': '테스트 구/동/거리/가게 데이터 저장 흐름 테스트'}
        res = requests.post(f"{API_URL}/api/ingest", data=data, files=files, verify=False, timeout=30)
        res.raise_for_status()
        body = res.json()
        print(f"  👉 Ingest Status: {body['status']}")
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
        entries = res2.json().get("entries", [])
        print(f"  ✅ Success! Found {len(entries)} entries in target path.")
        if entries:
            print(f"   -> Latest entry hash: {entries[-1].get('hash')[:8]}...")
            
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"  ❌ Ingest flow error: {e}")

    # 2. Test Analyze Flow
    print("\n2. Testing Analyze Flow (POST /api/analyze => GET /api/community)...")
    try:
        data = {'industry': '요식업', 'district': '수성구', 'street': '알파시티', 'raw_data': '데이터 세이빙 텍스트 정보'}
        res = requests.post(f"{API_URL}/api/analyze", data=data, verify=False, timeout=30)
        res.raise_for_status()
        body = res.json()
        print(f"  👉 Analyze Status: {body['status']}")
        print(f"  👉 Drive Link: {body.get('drive_link')}")
        
        print("  🔍 Verifying via Community Pool...")
        res2 = requests.get(f"{API_URL}/api/community", verify=False, timeout=15)
        pool = res2.json()
        print(f"  ✅ Success! Community entries count: {len(pool)}")
        if pool:
            print(f"   -> Latest entry district: {pool[0].get('district')} / industry: {pool[0].get('industry')}")
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"  ❌ Analyze flow error: {e}")

if __name__ == '__main__':
    test_data_flow()
