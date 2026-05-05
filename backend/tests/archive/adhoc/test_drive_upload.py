import requests

API_URL = "https://mdga-api.onrender.com"
HEADERS = {"Authorization": "Bearer mock-jwt-token"}
path_str = "대구광역시/북구/산격동/테스트상점"

res = requests.post(f"{API_URL}/api/v1/ingest", data={
    "raw_text": "Cache test",
    "location": path_str,
    "industry": "IT",
    "is_guest": "false"
}, headers=HEADERS)
print(res.text)
