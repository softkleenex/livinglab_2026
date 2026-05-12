import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_sales_insight():
    response = client.get("/api/v1/dashboard/sales-insight")
    assert response.status_code == 200
    json_resp = response.json()
    assert "status" in json_resp
    assert json_resp["status"] == "success"
    assert "data" in json_resp
    assert "totalSales" in json_resp["data"]

def test_get_simulation_logs():
    response = client.get("/api/v1/ax-data/simulation-logs")
    assert response.status_code == 200
    json_resp = response.json()
    assert "status" in json_resp
    assert json_resp["status"] == "success"
    assert "logs" in json_resp
    assert isinstance(json_resp["logs"], list)