import urllib.request
import urllib.parse
import json

API_URL = "http://localhost:8001"

def test_data_flow():
    print(f"🚀 Testing Data Flow -> {API_URL}")
    print("=====================================")
    
    # 1. Test Ingest Flow
    print("\n1. Testing Ingest Flow (POST /api/ingest => GET /api/hierarchy/explore)...")
    try:
        from urllib.request import Request, urlopen
        
        boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="raw_text"\r\n\r\n'
            f"테스트 구/동/거리/가게 데이터 저장 흐름 테스트\r\n"
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="dummy_test.txt"\r\n'
            f'Content-Type: text/plain\r\n\r\n'
            f"Hello World Dummy Content for Google Drive\r\n"
            f"--{boundary}--\r\n"
        ).encode('utf-8')
        
        req = Request(f"{API_URL}/api/ingest", data=body)
        req.add_header('Content-type', f'multipart/form-data; boundary={boundary}')
        
        with urlopen(req) as response:
            res = json.loads(response.read().decode())
            print(f"  👉 Ingest Status: {res['status']}")
            path = res.get('assigned_path', [])
            print(f"  👉 Path assigned: {path}")
            if 'drive_link' in res.get('entry', {}):
                print(f"  👉 Saved to Drive: {res['entry']['drive_link']}")
            
        print(f"  🔍 Verifying via Explore... Path: {path}")
        path_query = urllib.parse.quote("/".join(path))
        req2 = Request(f"{API_URL}/api/hierarchy/explore?path={path_query}")
        with urlopen(req2) as response:
            res2 = json.loads(response.read().decode())
            entries = res2.get("entries", [])
            print(f"  ✅ Success! Found {len(entries)} entries in target path.")
            if len(entries) > 0:
                print(f"   -> Latest entry hash: {entries[-1].get('hash')[:8]}...")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"  ❌ Ingest flow error: {e}")

    # 2. Test Analyze Flow
    print("\n2. Testing Analyze Flow (POST /api/analyze => GET /api/community)...")
    try:
        boundary = 'wL36Yn8afVp8Ag7AmP8qZ0SA4n1v9T'
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="industry"\r\n\r\n'
            f"요식업\r\n"
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="district"\r\n\r\n'
            f"수성구\r\n"
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="street"\r\n\r\n'
            f"알파시티\r\n"
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="raw_data"\r\n\r\n'
            f"데이터 세이빙 텍스트 정보\r\n"
            f"--{boundary}--\r\n"
        ).encode('utf-8')
        
        req = urllib.request.Request(f"{API_URL}/api/analyze", data=body)
        req.add_header('Content-type', f'multipart/form-data; boundary={boundary}')
        
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print(f"  👉 Analyze Status: {res['status']}")
            print(f"  👉 Drive Link: {res.get('drive_link')}")
            
        print("  🔍 Verifying via Community Pool...")
        req2 = urllib.request.Request(f"{API_URL}/api/community")
        with urllib.request.urlopen(req2) as response:
            res2 = json.loads(response.read().decode())
            print(f"  ✅ Success! Community entries count: {len(res2)}")
            if len(res2) > 0:
                 print(f"   -> Latest entry district: {res2[0].get('district')} / industry: {res2[0].get('industry')}")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"  ❌ Analyze flow error: {e}")

if __name__ == '__main__':
    test_data_flow()
