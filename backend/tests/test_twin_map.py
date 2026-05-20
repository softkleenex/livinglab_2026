from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_twin_map_risks():
    response = client.get("/api/v1/dashboard/twin-map-risks")
    assert response.status_code == 200
    json_resp = response.json()
    assert "status" in json_resp
    assert json_resp["status"] == "success"
    assert "risks" in json_resp
    assert isinstance(json_resp["risks"], list)