from fastapi import APIRouter, HTTPException, Depends
from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry
import random
from pydantic import BaseModel

router = APIRouter()

class ContextPayload(BaseModel):
    role: str
    industry: str
    location: list[str] # e.g. ["북구", "산격동", "경북대 북문", "테스트상점"]

@router.post("/user/context")
async def set_user_context(payload: ContextPayload):
    # Ensure the path exists in the engine
    types = ["Gu", "Dong", "Street", "Store"]
    engine.create_or_get_path(payload.location, types)
    return {"status": "success", "message": "Context initialized", "path": payload.location}

@router.get("/explore")
async def explore(path: str = ""):
    path_list = [p for p in path.split("/") if p] if path else []
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Path not found")

    entries = obj.get("data_entries", [])
    avg_trust = sum(e.get("trust_index", 50.0) for e in entries) / len(entries) if entries else 50.0

    return {
        "current": obj["name"], "type": obj["type"], "metadata": obj["metadata"],
        "total_value": obj["metadata"].get("total_value", 0),
        "trust_index": round(avg_trust, 1) if obj["type"] == "Store" else obj["metadata"].get("trust_index", 50.0),
        "children": [ {"name": k, "type": v["type"], "value": v["metadata"].get("total_value", 0), "pulse": v["metadata"]["pulse_rate"], "history": v["metadata"].get("history", []), "location": v["metadata"].get("location", [35.8714 + random.uniform(-0.05, 0.05), 128.6014 + random.uniform(-0.05, 0.05)])} for k, v in obj["children"].items() ],
        "entries": entries
    }

@router.get("/stores/all")
async def get_all_stores(db: Session = Depends(get_db)):
    try:
        # Get unique locations from data_entries
        entries = db.query(DataEntry).distinct(DataEntry.location_path).all()
        stores = []
        for e in entries:
            parts = e.location_path.split("/")
            if len(parts) >= 4:
                stores.append({
                    "path": e.location_path,
                    "gu": parts[0],
                    "dong": parts[1] if len(parts) > 1 else "",
                    "street": parts[2] if len(parts) > 2 else "",
                    "name": parts[-1],
                    "industry": e.industry
                })

        # Also grab any stores currently in the engine tree that might not have entries yet
        def traverse_tree(node, current_path):
            if node.get("type") == "Store" and node.get("name") != "전체 (Root)":
                parts = current_path
                if not any(s["path"] == "/".join(parts) for s in stores):
                    stores.append({
                        "path": "/".join(parts),
                        "gu": parts[0] if len(parts) > 0 else "",
                        "dong": parts[1] if len(parts) > 1 else "",
                        "street": parts[2] if len(parts) > 2 else "",
                        "name": parts[-1],
                        "industry": "기타"
                    })
            for child_name, child_node in node.get("children", {}).items():
                traverse_tree(child_node, current_path + [child_name])

        traverse_tree(engine.db, [])
        return {"status": "success", "stores": stores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
