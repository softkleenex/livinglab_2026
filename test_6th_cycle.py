import requests
import json
import urllib.parse

API_URL = "http://localhost:8000"
HEADERS = {"Authorization": "Bearer mock-jwt-token"}
path = "서울특별시/테스트구/테스트동/테스트로/테스트상점"

print("1. Ingesting...")
res = requests.post(f"{API_URL}/api/ingest", data={
    "raw_text": "Integer Conversion Test",
    "location": path,
    "industry": "IT",
    "is_guest": "false"
}, headers=HEADERS)
added = res.json().get("value_added")
print(f"Added value: {added} (Type: {type(added)})")

print("\n2. Checking Wallet...")
w = requests.get(f"{API_URL}/api/dashboard/wallet/transactions", headers=HEADERS).json()
print(f"Balance: {w.get('balance')} (Type: {type(w.get('balance'))})")
