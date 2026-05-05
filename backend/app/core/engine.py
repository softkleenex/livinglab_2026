import datetime
import random
from sqlalchemy.orm import Session
from app.core.database import Region, Farm, DataEntry

GEO_LOOKUP = {
    "서울특별시": (37.5665, 126.9780),
    "부산광역시": (35.1796, 129.0756),
    "대구광역시": (35.8714, 128.6014),
    "인천광역시": (37.4563, 126.7052),
    "광주광역시": (35.1595, 126.8526),
    "대전광역시": (36.3504, 127.3845),
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

class HierarchyEngine:
    def get_object(self, db, path_list):
        if not path_list or path_list[0] == "전체 (Root)":
            cities = db.query(Region).filter(Region.parent_id == None).all()
            total_val = sum(c.total_value for c in cities)
            nodes = sum(c.nodes for c in cities)
            return {
                "name": "전체 (Root)", "type": "Root",
                "metadata": {"trust_index": 99.0, "pulse_rate": 80, "total_value": total_val, "nodes": nodes, "history": []},
                "children": {c.name: {"type": c.level_type, "metadata": {"total_value": c.total_value, "pulse_rate": c.pulse_rate, "history": c.history, "location": [c.lat, c.lng]}} for c in cities},
                "data_entries": []
            }
            
        parent_id = None
        curr_obj = None
        is_store = False
        
        for i, p in enumerate(path_list):
            if i == len(path_list) - 1:
                farm = db.query(Farm).filter(Farm.name == p, Farm.region_id == parent_id).first()
                if farm:
                    is_store = True
                    curr_obj = farm
                    break
            
            region = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if not region: return None
            parent_id = region.id
            curr_obj = region
            
        if not curr_obj: return None
        
        if is_store:
            from sqlalchemy.orm import joinedload
            entries = db.query(DataEntry).options(joinedload(DataEntry.farm)).filter(DataEntry.store_id == curr_obj.id).order_by(DataEntry.created_at.asc()).all()
            entry_list = [{
                "timestamp": e.created_at.strftime("%Y-%m-%d %H:%M"),
                "insights": e.insights,
                "hash": e.hash_val,
                "drive_link": e.drive_link,
                "scope": "store_specific",
                "trust_index": e.trust_index,
                "effective_value": e.effective_value,
                "raw_text": e.raw_text,
                "store_name": curr_obj.name
            } for e in entries]
            
            return {
                "name": curr_obj.name, "type": "Farm",
                "metadata": {
                    "created_at": curr_obj.created_at.strftime("%Y-%m-%d"),
                    "nodes": 1,
                    "pulse_rate": curr_obj.pulse_rate,
                    "total_value": curr_obj.total_value,
                    "history": curr_obj.history,
                    "location": [curr_obj.lat, curr_obj.lng]
                },
                "children": {},
                "data_entries": entry_list,
                "industry": curr_obj.industry
            }
        else:
            children_regions = db.query(Region).filter(Region.parent_id == curr_obj.id).all()
            children_stores = db.query(Farm).filter(Farm.region_id == curr_obj.id).all()
            
            children_dict = {}
            for c in children_regions:
                children_dict[c.name] = {
                    "type": c.level_type,
                    "metadata": {"total_value": c.total_value, "pulse_rate": c.pulse_rate, "history": c.history, "location": [c.lat, c.lng]}
                }
            for s in children_stores:
                children_dict[s.name] = {
                    "type": "Farm",
                    "metadata": {"total_value": s.total_value, "pulse_rate": s.pulse_rate, "history": s.history, "location": [s.lat, s.lng]}
                }
                
            # Roll-up entries: Fetch all entries where location_path starts with the current region path
            from sqlalchemy.orm import joinedload
            current_path_str = "/".join(path_list)
            if not current_path_str or current_path_str == "전체 (Root)":
                entries = db.query(DataEntry).options(joinedload(DataEntry.farm)).order_by(DataEntry.created_at.desc()).limit(100).all()
            else:
                entries = db.query(DataEntry).options(joinedload(DataEntry.farm)).filter(DataEntry.location_path.like(f"{current_path_str}%")).order_by(DataEntry.created_at.desc()).limit(100).all()
                
            entry_list = [{
                "timestamp": e.created_at.strftime("%Y-%m-%d %H:%M"),
                "insights": e.insights,
                "hash": e.hash_val,
                "drive_link": e.drive_link,
                "scope": "regional_general",
                "trust_index": e.trust_index,
                "effective_value": e.effective_value,
                "raw_text": e.raw_text,
                "store_name": e.farm.name if e.farm else "Public"
            } for e in entries]
            
            return {
                "name": curr_obj.name, "type": curr_obj.level_type,
                "metadata": {
                    "created_at": curr_obj.created_at.strftime("%Y-%m-%d"),
                    "nodes": curr_obj.nodes,
                    "pulse_rate": curr_obj.pulse_rate,
                    "total_value": curr_obj.total_value,
                    "history": curr_obj.history,
                    "location": [curr_obj.lat, curr_obj.lng]
                },
                "children": children_dict,
                "data_entries": entry_list
            }

    def create_or_get_path(self, db, path_list, types_list):
        if not path_list: return None
        if path_list[0] == "전체 (Root)":
            path_list = path_list[1:]
            
        parent_id = None
        base_lat, base_lng = GEO_LOOKUP.get(path_list[0], (37.5665, 126.9780))
        
        for i, p in enumerate(path_list):
            is_last = (i == len(path_list) - 1)
            offset = 0.05 / (i + 1)
            lat = base_lat + random.uniform(-offset, offset)
            lng = base_lng + random.uniform(-offset, offset)
            
            if is_last and (len(types_list) <= i or types_list[i] == "Farm"):
                farm = db.query(Farm).filter(Farm.name == p, Farm.region_id == parent_id).first()
                if not farm:
                    farm = Farm(name=p, region_id=parent_id, industry="기타", lat=lat, lng=lng, history=[random.randint(60, 80) for _ in range(5)])
                    db.add(farm)
                    db.flush()
                    self._increment_nodes(db, parent_id)
            else:
                region = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
                if not region:
                    level_type = types_list[i] if i < len(types_list) else "Node"
                    region = Region(name=p, parent_id=parent_id, level_type=level_type, lat=lat, lng=lng, history=[random.randint(60, 80) for _ in range(5)])
                    db.add(region)
                    db.flush()
                    if parent_id is not None:
                        self._increment_nodes(db, parent_id)
                parent_id = region.id
                
        return self.get_object(db, path_list)
        
    def _increment_nodes(self, db: Session, region_id: int) -> None:
        """
        Recursively increments the node count for a region and all its ancestors.
        Locks are acquired in ascending order of region ID to prevent distributed deadlocks
        during concurrent hierarchy expansion.
        
        Args:
            db (Session): The active database session.
            region_id (int): The ID of the leaf region to start incrementing from.
        """
        # Prevent deadlock: lock top-down
        # First gather all ancestors
        curr_id = region_id
        ancestors = []
        while curr_id is not None:
            r = db.query(Region).filter(Region.id == curr_id).first()
            if r:
                ancestors.append(r.id)
                curr_id = r.parent_id
            else:
                break
        
        # Sort by ID to ensure consistent lock order globally
        ancestors.sort()
        for aid in ancestors:
            r = db.query(Region).filter(Region.id == aid).with_for_update().first()
            if r:
                r.nodes = Region.nodes + 1
                db.add(r)

    def add_value_bottom_up(self, db, path_list, value_added):
        parent_id = None
        regions = []
        if path_list[0] == "전체 (Root)":
            path_list = path_list[1:]
            
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r:
                regions.append(r)
                parent_id = r.id
            else:
                break
                
        # To prevent deadlocks, gather all IDs, sort them, and lock in consistent order
        region_ids = [r.id for r in regions]
        region_ids.sort()
        
        locked_regions = []
        for rid in region_ids:
            locked_r = db.query(Region).filter(Region.id == rid).with_for_update().first()
            if locked_r:
                locked_regions.append(locked_r)
                
        farm = db.query(Farm).filter(Farm.name == path_list[-1], Farm.region_id == parent_id).with_for_update().first()
        
        if farm:
            farm.total_value = Farm.total_value + value_added
            farm.pulse_rate = min(100, farm.pulse_rate + 2)
            hist = list(farm.history)
            hist.append(farm.pulse_rate)
            if len(hist) > 10: hist.pop(0)
            farm.history = hist
            db.add(farm)
            
        for r in locked_regions:
            r.total_value = Region.total_value + value_added
            r.pulse_rate = min(100, r.pulse_rate + 1)
            hist = list(r.history)
            hist.append(r.pulse_rate)
            if len(hist) > 10: hist.pop(0)
            r.history = hist
            db.add(r)
            

    def delete_path(self, db, path_list):
        if not path_list: return False
        if path_list[0] == "전체 (Root)":
            path_list = path_list[1:]
            
        parent_id = None
        regions = []
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).with_for_update().first()
            if r:
                regions.append(r)
                parent_id = r.id
            else:
                return False
                
        farm = db.query(Farm).filter(Farm.name == path_list[-1], Farm.region_id == parent_id).with_for_update().first()
        if not farm: return False
        
        value_to_remove = farm.total_value
        
        for r in regions:
            r.total_value = Region.total_value - value_to_remove
            r.nodes = Region.nodes - 1
            db.add(r)
            
        db.delete(farm)
        return True

engine = HierarchyEngine()
