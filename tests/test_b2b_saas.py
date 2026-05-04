import requests
import json
import urllib.parse
import time

API_URL = "https://mdga-api.onrender.com"
HEADERS = {"Authorization": "Bearer mock-jwt-token"}

print("===========================================")
print("  MDGA B2B SAAS (AUTH & WALLET) TEST")
print("===========================================\n")

print("[1] Resetting Database Schema to include Users/Wallets...")
requests.post(f"{API_URL}/api/reset_schema", headers=HEADERS)

print("\n[2] Ingesting data as mock-jwt-token user to earn $MDGA...")
store_path = "서울특별시/테스트구/테스트동/테스트로/내상점"
res = requests.post(f"{API_URL}/api/v1/ingest", data={
    "raw_text": "매출 증가 데이터 보고",
    "location": store_path,
    "industry": "IT",
    "is_guest": "false"
}, headers=HEADERS)
added_value = res.json().get("value_added", 0)
print(f"  -> Ingested! Value Added: {added_value}")

time.sleep(1)

print("\n[3] Checking Wallet Balance & Transaction History...")
wallet_res = requests.get(f"{API_URL}/api/v1/dashboard/wallet/transactions", headers=HEADERS)
wallet_data = wallet_res.json()
print(f"  -> Current Balance: {wallet_data.get('balance')} $MDGA")
print("  -> Transactions:")
for tx in wallet_data.get("transactions", []):
    print(f"     [{tx['type']}] {tx['description']}: {tx['amount']} $MDGA")

if wallet_data.get('balance') == added_value:
    print("  ✅ Earn Tokenomics Working!")

print("\n[4] Buying Premium Data from Market (Cost: 15000)...")
buy_res = requests.post(f"{API_URL}/api/dashboard/market/buy", json={"industry": "IT", "price": 15000}, headers=HEADERS)
if buy_res.status_code == 200:
    print(f"  -> Market Purchase Success! {buy_res.json().get('message')}")
else:
    print(f"  -> Market Purchase Failed: {buy_res.text}")

print("\n[5] Checking Wallet Balance Again...")
wallet_res2 = requests.get(f"{API_URL}/api/v1/dashboard/wallet/transactions", headers=HEADERS)
wallet_data2 = wallet_res2.json()
print(f"  -> New Balance: {wallet_data2.get('balance')} $MDGA")
if wallet_data2.get('balance') == added_value - 15000:
    print("  ✅ Spend Tokenomics & Ledger Working Flawlessly!")

print("\n===========================================")
print("  B2B SAAS TEST COMPLETE")
print("===========================================")
