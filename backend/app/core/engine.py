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


