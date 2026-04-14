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
        
        # Simple lookup table for major Korean provinces/cities
        GEO_LOOKUP = {
            "서울특별시": (37.5665, 126.9780),
            "부산광역시": (35.1796, 129.0756),
            "대구광역시": (35.8714, 128.6014),
            "인천광역시": (37.4563, 126.7052),
            "광주광역시": (35.1595, 126.8526),
            "대전광역시": (35.1595, 126.8526), # Note: corrected below
            "울산광역시": (35.5384, 129.3114),
            "세종특별자치시": (36.4800, 127.2890),
            "경기도": (37.2749, 127.0093),
            "강원특별자치도": (37.8854, 127.7298),
            "충청북도": (36.6356, 127.4913),
            "충청남도": (36.6588, 126.6728),
            "전북특별자치도": (35.8202, 127.1088),
            "전라남도": (36.8151, 126.8906),
            "경상북도": (36.5760, 128.5056),
            "경상남도": (35.2383, 128.6922),
            "제주특별자치도": (33.4890, 126.4983)
        }
        GEO_LOOKUP["대전광역시"] = (36.3504, 127.3845) # Correct Dajeon

        # Determine base lat/lng from the first path element if possible
        base_lat, base_lng = (37.5665, 126.9780) # Default to Seoul
        if path_list and path_list[0] in GEO_LOOKUP:
            base_lat, base_lng = GEO_LOOKUP[path_list[0]]
            
        for i, p in enumerate(path_list):
            if p not in curr["children"]:
                # Add slight random offset based on depth to spread nodes out geographically
                offset = 0.05 / (i + 1)
                lat = base_lat + random.uniform(-offset, offset)
                lng = base_lng + random.uniform(-offset, offset)
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


