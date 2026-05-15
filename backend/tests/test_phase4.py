from fastapi.testclient import TestClient
from app.main import app
from app.api.endpoints.data_marketplace import verify_b2b_api_key

client = TestClient(app)

app.dependency_overrides[verify_b2b_api_key] = lambda: "dummy_key"

def test_export_synthetic_yield():
    print("Testing /export/synthetic-yield...")
    # Requires B2B API Key
    headers = {"x-api-key": "mdga-b2b-snowflake-key"}
    res = client.get("/api/v1/data-marketplace/export/synthetic-yield?limit=5", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "text/csv; charset=utf-8"
    assert "mdga_synthetic_yield_export.csv" in res.headers["content-disposition"]
    print("Success: Synthetic yield CSV exported.")

def test_export_ai_ready_vision():
    print("Testing /export/ai-ready-vision...")
    headers = {"x-api-key": "mdga-b2b-aihub-key"}
    res = client.get("/api/v1/data-marketplace/export/ai-ready-vision?limit=5", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/jsonl"
    assert "mdga_ai_ready_vision_logs.jsonl" in res.headers["content-disposition"]
    print("Success: AI-ready vision JSONL exported.")

def test_ax_data_yield_prediction():
    print("Testing /ax-data/yield-prediction...")
    res = client.get("/api/v1/ax-data/yield-prediction?region=대구광역시&crop=사과")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "predicted_yield_kg" in data["data"]
    print("Success: Yield prediction generated.")

def test_ax_data_oversupply_risk():
    print("Testing /ax-data/oversupply-risk...")
    res = client.get("/api/v1/ax-data/oversupply-risk?crop=양파")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    print("Success: Oversupply risk generated.")
