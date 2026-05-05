import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.main import app

client = TestClient(app)

def test_chat_copilot():
    path_str = "대구광역시/북구/산격동/테스트매장"
    
    # Create context
    payload = {
        "role": "store",
        "industry": "스마트팜",
        "location": ["대구광역시", "북구", "산격동", "테스트매장"]
    }
    client.post("/api/v1/user/context", json=payload)
    
    # Inject some data
    client.post(f"/api/v1/demo/inject?path={path_str}")
    
    # Chat payload
    chat_payload = {
        "path": path_str,
        "industry": "스마트팜",
        "message": "이번 주말 수확량을 올리려면 어떻게 해야 할까?"
    }
    
    res = client.post("/api/v1/chat", json=chat_payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    print("\n[AI Copilot Reply Test]")
    print(data["reply"])
