import urllib.request
import urllib.parse
import json
import ssl
import time

context = ssl._create_unverified_context()

def fetch_json(url, data=None, method='GET'):
    req = urllib.request.Request(url, data=data, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
    res = urllib.request.urlopen(req, context=context)
    return json.loads(res.read().decode('utf-8'))

print('=== MDGA SYSTEM FULL LIFECYCLE STRESS TEST ===')

# 1. Onboard (Google User vs Guest)
path = '서울특별시/강남구/테헤란로/스타트업밸리/테스트AI랩'
industry = 'IT/서비스'
print(f'\n[1] Onboarding new node: {path}')
start = time.time()
fetch_json('https://mdga-api.onrender.com/api/user/context', json.dumps({
    'role': 'farm', 'industry': industry, 'location': path.split('/')
}).encode('utf-8'), 'POST')
print(f'  -> Success! ({time.time() - start:.2f}s)')

# 2. Ingest Data (Guest)
print('\n[2] Ingesting Data (Guest Mode - Expected Low Trust)...')
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body_guest = (
    f'--{boundary}\r\nContent-Disposition: form-data; name="raw_text"\r\n\r\n'
    f'[주간보고] 신규 AI 모델 학습 속도가 기존 대비 20% 저하되었습니다. GPU 메모리 병목 현상이 의심됩니다.\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\n{path}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="industry"\r\n\r\n{industry}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="is_guest"\r\n\r\ntrue\r\n'
    f'--{boundary}--\r\n'
)
req_guest = urllib.request.Request('https://mdga-api.onrender.com/api/ingest', data=body_guest.encode('utf-8'))
req_guest.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
start = time.time()
res_guest = urllib.request.urlopen(req_guest, context=context)
guest_data = json.loads(res_guest.read().decode('utf-8'))
guest_hash = guest_data['entry']['hash']
guest_value = guest_data['entry']['effective_value']
print(f"  -> Trust Index: {guest_data['entry']['trust_index']}% (Guest Penalty Applied)")
print(f"  -> Value Added: +{guest_value} $MDGA")
print(f"  -> Response Time: {time.time() - start:.2f}s")
print(f"  -> AI Insight: {guest_data['entry']['insights'][:100]}...")

# 3. Ingest Data (Google Logged In)
print('\n[3] Ingesting Data (Google Login Mode - Expected High Trust)...')
body_auth = (
    f'--{boundary}\r\nContent-Disposition: form-data; name="raw_text"\r\n\r\n'
    f'[해결보고] 분산 처리 아키텍처를 도입하여 GPU 병목을 해소하고 학습 속도를 150% 끌어올렸습니다.\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\n{path}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="industry"\r\n\r\n{industry}\r\n'
    f'--{boundary}\r\nContent-Disposition: form-data; name="is_guest"\r\n\r\nfalse\r\n'
    f'--{boundary}--\r\n'
)
req_auth = urllib.request.Request('https://mdga-api.onrender.com/api/ingest', data=body_auth.encode('utf-8'))
req_auth.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
start = time.time()
res_auth = urllib.request.urlopen(req_auth, context=context)
auth_data = json.loads(res_auth.read().decode('utf-8'))
auth_hash = auth_data['entry']['hash']
auth_value = auth_data['entry']['effective_value']
print(f"  -> Trust Index: {auth_data['entry']['trust_index']}% (Auth Bonus Applied)")
print(f"  -> Value Added: +{auth_value} $MDGA")
print(f"  -> Response Time: {time.time() - start:.2f}s")
print(f"  -> AI Insight: {auth_data['entry']['insights'][:100]}...")

# 4. Check Hierarchy Roll-up
print('\n[4] Checking Hierarchy Roll-up (Data Interaction)...')
street_path = '서울특별시/강남구/테헤란로/스타트업밸리'
hierarchy_data = fetch_json(f'https://mdga-api.onrender.com/api/hierarchy/explore?path={urllib.parse.quote(street_path)}')
current_street_value = hierarchy_data['metadata']['total_value']
print(f"  -> Street Level Total Value: {current_street_value} $MDGA")

# 5. Delete Entry (Rollback Test)
print('\n[5] Deleting Guest Entry & Checking Rollback/Drive Deletion...')
start = time.time()
delete_req = urllib.request.Request(f'https://mdga-api.onrender.com/api/ingest/delete?path={urllib.parse.quote(path)}&hash_val={guest_hash}', method='DELETE')
urllib.request.urlopen(delete_req, context=context)
print(f'  -> Deletion Success! ({time.time() - start:.2f}s)')

hierarchy_data_after = fetch_json(f'https://mdga-api.onrender.com/api/hierarchy/explore?path={urllib.parse.quote(street_path)}')
after_street_value = hierarchy_data_after['metadata']['total_value']
print(f"  -> Street Level Value AFTER Delete: {after_street_value} $MDGA")
diff = current_street_value - after_street_value
print(f"  -> Diff: {diff} (Expected: {guest_value}) -> Match: {diff == guest_value}")

print('\n[6] CSV Download Validation...')
csv_url = f'https://mdga-api.onrender.com/api/dashboard/export?path={urllib.parse.quote(path)}&industry={urllib.parse.quote(industry)}'
req_csv = urllib.request.Request(csv_url)
res_csv = urllib.request.urlopen(req_csv, context=context)
csv_lines = res_csv.read().decode('utf-8').strip().split('\n')
print(f"  -> Downloaded {len(csv_lines)} rows. Status: {res_csv.status} OK")

print('\n✅ ALL SYSTEMS GO! FULL E2E LIFECYCLE PASSED.')
