from fastapi import APIRouter, HTTPException, Depends
from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, Farm, Region
import random
from pydantic import BaseModel

router = APIRouter()

class ContextPayload(BaseModel):
    role: str
    industry: str
    location: list[str]

@router.post("/user/context")
async def set_user_context(payload: ContextPayload, db: Session = Depends(get_db)):
    types = ["City", "District", "Village", "Farm"]
    engine.create_or_get_path(db, payload.location, types)
    db.commit()
    return {"status": "success", "message": "Context initialized", "path": payload.location}

@router.get("/explore")
async def explore(path: str = "", db: Session = Depends(get_db)):
    path_list = [p for p in path.split("/") if p] if path else []
    obj = engine.get_object(db, path_list)
    if not obj: raise HTTPException(status_code=404, detail="Path not found")

    entries = obj.get("data_entries", [])
    avg_trust = sum(e.get("trust_index", 50.0) for e in entries) / len(entries) if entries else 50.0

    return {
        "current": obj["name"], "type": obj["type"], "metadata": obj["metadata"],
        "total_value": obj["metadata"].get("total_value", 0),
        "trust_index": round(avg_trust, 1) if obj["type"] == "Farm" else obj["metadata"].get("trust_index", 50.0),
        "children": [ {"name": k, "type": v["type"], "value": v["metadata"].get("total_value", 0), "pulse": v["metadata"]["pulse_rate"], "history": v["metadata"].get("history", []), "location": v["metadata"].get("location", [35.8714 + random.uniform(-0.05, 0.05), 128.6014 + random.uniform(-0.05, 0.05)])} for k, v in obj["children"].items() ],
        "entries": entries
    }

@router.get("/farms/all")
def get_all_stores(db: Session = Depends(get_db)):
    try:
        farms = []
        all_stores = db.query(Farm).all()
        all_regions = {r.id: r for r in db.query(Region).all()}
        
        for s in all_stores:
            path_parts = []
            curr_r_id = s.region_id
            while curr_r_id:
                curr_r = all_regions.get(curr_r_id)
                if not curr_r: break
                path_parts.insert(0, curr_r.name)
                curr_r_id = curr_r.parent_id
                
            path = "/".join(path_parts + [s.name])
            
            gu = path_parts[0] if len(path_parts) > 0 else ""
            dong = path_parts[1] if len(path_parts) > 1 else ""
            street = path_parts[2] if len(path_parts) > 2 else ""
            
            farms.append({
                "path": path,
                "gu": gu,
                "dong": dong,
                "street": street,
                "name": s.name,
                "industry": s.industry
            })

        return {"status": "success", "farms": farms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
