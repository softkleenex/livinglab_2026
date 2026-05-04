import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.main import app

client = TestClient(app)

def test_gov_explorer_hierarchy():
    # 1. Inject some mock data to populate the hierarchy
    path_str = "대구광역시/북구/산격동/지니스팜"
    client.post(f"/api/v1/demo/inject?path={path_str}")

    path_str2 = "대구광역시/중구/동성로/카페A"
    client.post(f"/api/v1/demo/inject?path={path_str2}")

    # 2. As a Gov/Leader, fetch the explorer root data
    res = client.get("/api/hierarchy/explore?path=대구광역시")
    
    assert res.status_code == 200
    data = res.json()
    
    # Verify the structure has children representing Gu (e.g., 북구, 중구)
    assert "children" in data
    assert len(data["children"]) >= 2
    
    names = [child["name"] for child in data["children"]]
    assert "북구" in names
    assert "중구" in names
    
    print("\n[Gov Digital Twin Map Data Test Passed]")
    print(f"Total Aggregated Value: {data.get('total_value')}")
