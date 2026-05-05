from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.main import app

client = TestClient(app)

def test_smartfarm_context_and_report():
    # 1. Setup context as a Smart Farm
    payload = {
        "role": "farm",
        "industry": "스마트팜",
        "location": ["대구광역시", "북구", "산격동", "지니스팜"]
    }
    response = client.post("/api/v1/user/context", json=payload)
    assert response.status_code == 200

    # 2. Inject demo data to have some history
    path_str = "대구광역시/북구/산격동/지니스팜"
    inject_res = client.post(f"/api/v1/demo/inject?path={path_str}")
    assert inject_res.status_code == 200

    # 3. Request report specifying the industry
    # We expect the AI to return a report tailored to smart farms.
    # Since it depends on external LLM, we just check if it returns 200 and has 'report'
    report_res = client.get(f"/api/v1/dashboard/report?path={path_str}&industry=스마트팜")
    assert report_res.status_code == 200
    data = report_res.json()
    assert "report" in data
    assert len(data["report"]) > 0
    # Depending on LLM response, it might have specific keywords, but checking length is safer.
    print("\n[Smart Farm Report Output Test]")
    print(data["report"])
