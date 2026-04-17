from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry
import random

router = APIRouter()

@router.get("/feed")
async def get_agora_feed(db: Session = Depends(get_db)):
    try:
        entries = db.query(DataEntry).order_by(DataEntry.created_at.desc()).limit(20).all()
        feed = []
        for e in entries:
            # Anonymize store name by taking only Gu/Dong
            path_parts = e.location_path.split("/")
            anon_location = f"{path_parts[0]} {path_parts[1]}" if len(path_parts) >= 2 else "지역 익명"
            feed.append({
                "id": e.id,
                "location": anon_location,
                "industry": e.industry,
                "insights": e.insights,
                "timestamp": str(e.created_at.strftime("%Y-%m-%d %H:%M")),
                "trust_index": e.trust_index,
                "likes": random.randint(5, 150)
            })
        return {"status": "success", "feed": feed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
