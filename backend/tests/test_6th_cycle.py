from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
HEADERS = {"Authorization": "Bearer mdga-admin-seed-2026"}
path = "서울특별시/테스트구/테스트동/테스트로/테스트상점"

def test_6th_cycle():
    print("1. Ingesting...")
    res = client.post("/api/v1/ingest", data={
        "raw_text": "Integer Conversion Test",
        "location": path,
        "industry": "IT",
        "is_guest": "false"
    }, headers=HEADERS)
    res.raise_for_status()
    added = res.json().get("value_added")
    print(f"Added value: {added} (Type: {type(added)})")

    print("\n2. Checking Wallet...")
    w = client.get("/api/v1/dashboard/wallet/transactions", headers=HEADERS)
    w.raise_for_status()
    w_json = w.json()
    print(f"Balance: {w_json.get('balance')} (Type: {type(w_json.get('balance'))})")
