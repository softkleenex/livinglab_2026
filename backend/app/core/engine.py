import datetime
import random
import urllib.request
import json

class HierarchyEngine:
    def __init__(self):
        self.db = {
            "name": "대구광역시", "type": "City",
            "metadata": {"trust_index": 99.0, "pulse_rate": 80, "total_value": 0, "nodes": 0, "history": []},
            "children": {},
            "data_entries": []
        }

    def get_object(self, path_list):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        for p in path_list:
            if p not in curr["children"]: return None
            curr = curr["children"][p]
        return curr

    def create_or_get_path(self, path_list, types_list):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        # Update root metadata dynamically
        curr["metadata"]["nodes"] += 1
        for i, p in enumerate(path_list):
            if p not in curr["children"]:
                lat = 35.8714 + random.uniform(-0.05, 0.05)
                lng = 128.6014 + random.uniform(-0.05, 0.05)
                curr["children"][p] = {
                    "name": p, "type": types_list[i] if i < len(types_list) else "Node",
                    "metadata": {
                        "created_at": str(datetime.date.today()), 
                        "nodes": 1, 
                        "pulse_rate": random.randint(65, 90), 
                        "total_value": 0,
                        "history": [random.randint(60, 80) for _ in range(5)],
                        "location": [lat, lng]
                    },
                    "children": {}, "data_entries": []
                }
            else:
                curr["children"][p]["metadata"]["nodes"] += 1
            curr = curr["children"][p]
        return curr
        
    def add_value_bottom_up(self, path_list, value_added):
        curr = self.db
        if path_list and path_list[0] == self.db["name"]:
            path_list = path_list[1:]
        curr["metadata"]["total_value"] += value_added
        curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 1)
        # Update history
        curr["metadata"]["history"].append(curr["metadata"]["pulse_rate"])
        if len(curr["metadata"]["history"]) > 10: curr["metadata"]["history"].pop(0)

        for p in path_list:
            if p in curr["children"]:
                curr = curr["children"][p]
                curr["metadata"]["total_value"] += value_added
                curr["metadata"]["pulse_rate"] = min(100, curr["metadata"].get("pulse_rate", 70) + 2)
                curr["metadata"]["history"].append(curr["metadata"]["pulse_rate"])
                if len(curr["metadata"]["history"]) > 10: curr["metadata"]["history"].pop(0)

engine = HierarchyEngine()

def seed_initial_data(eng):
    types = ["Gu", "Dong", "Street", "Store"]
    
    # 1. Fetch from Public/Mock API for dynamic seeding
    try:
        # Using a public placeholder API to simulate fetching public commercial data
        req = urllib.request.Request('https://jsonplaceholder.typicode.com/users', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
            # Map mock users to store names in different regions
            regions = [
                ["중구", "삼덕동", "동성로"],
                ["수성구", "두산동", "수성못"],
                ["달서구", "범어동", "범어네거리"]
            ]
            
            for i, user in enumerate(data[:9]): # Get 9 mock stores
                region = regions[i % len(regions)]
                store_name = f"{user['company']['name']} (공공데이터)"
                value = random.randint(100000, 2000000)
                
                path = region + [store_name]
                eng.create_or_get_path(path, types)
                eng.add_value_bottom_up(path, value)
                
        print("✅ 공공 API 연동 초기 데이터 시딩 완료!")
    except Exception as e:
        print(f"⚠️ 공공 API 연동 실패 (Fallback 데이터 사용): {e}")
        # Fallback
        eng.create_or_get_path(["대구광역시", "중구", "삼덕동", "동성로", "스타벅스 동성로점"], types)
        eng.add_value_bottom_up(["대구광역시", "중구", "삼덕동", "동성로", "스타벅스 동성로점"], 950000)

seed_initial_data(engine)
