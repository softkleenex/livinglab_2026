import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_api_key():
    response = client.post("/api/v1/b2b-market/apikeys", headers={"Authorization": "Bearer mdga-admin-seed-2026"})
    assert response.status_code == 200
    assert "api_key" in response.json()

def test_list_products():
    response = client.get("/api/v1/b2b-market/products")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "products" in response.json()