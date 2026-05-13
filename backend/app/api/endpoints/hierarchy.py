from fastapi import APIRouter, HTTPException, Depends
from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, Farm, Region, DataEntry
import random
import hashlib
import json
from pydantic import BaseModel
from app.services.public_data_service import public_data_service
from app.api.deps import verify_token

router = APIRouter()


class ContextPayload(BaseModel):
    role: str
    industry: str
    location: list[str]


@router.post("/user/context")
async def set_user_context(payload: ContextPayload, db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    types = ["City", "District", "Village", "Farm"]
    engine.create_or_get_path(db, payload.location, types)
    db.commit()

    # --- Public Data Seeding ---
    try:
        path_str = "/".join(payload.location)
        region_name = payload.location[0] if len(payload.location) > 0 else "전국"
        crop = payload.industry.split(" ")[0] if payload.industry else "기본작물"

        farm = db.query(Farm).filter(Farm.name == payload.location[-1]).first()
        is_farm = bool(
            farm and len(payload.location) >= 4 and farm.name == payload.location[-1]
        )

        if is_farm:
            existing_entries = (
                db.query(DataEntry).filter(DataEntry.farm_id == farm.id).count()
            )
        else:
            existing_entries = (
                db.query(DataEntry).filter(DataEntry.location_path == path_str).count()
            )

        if existing_entries == 0:
            if "축산" in payload.industry:
                data1 = await public_data_service.generate_livestock_alert(
                    region_name, crop
                )
                insight1 = data1.get("actionable_insight", "질병 특이사항 없음")
            elif "유통" in payload.industry or "물류" in payload.industry:
                data1 = await public_data_service.generate_oversupply_risk(crop)
                insight1 = data1.get("actionable_insight", "수급 특이사항 없음")
            else:
                data1 = await public_data_service.generate_synthetic_yield_prediction(
                    region_name, crop
                )
                insight1 = data1.get("actionable_insight", "기상 특이사항 없음")

            sim_data = await public_data_service.generate_crop_simulator(
                region_name, crop
            )
            insight2 = sim_data.get("actionable_insight", "생산성 지수 양호")

            raw_text = "🌍 [초기 공용 데이터 연동 완료]\n\n"
            raw_text += f"단위: {payload.location[-1]} | 분야: {payload.industry}\n"
            raw_text += f"✓ 단기 예측 및 조치: {insight1}\n"
            raw_text += f"✓ 중장기 기후 적응: {insight2}\n"

            entry_hash = hashlib.sha256(
                (raw_text + str(random.random())).encode()
            ).hexdigest()

            new_entry = DataEntry(
                location_path=path_str,
                farm_id=farm.id if is_farm else None,
                industry=payload.industry,
                is_guest=1,
                raw_text=raw_text,
                insights=json.dumps(
                    {
                        "info": "Public Data Automatically Seeded",
                        "data1": data1,
                        "sim_data": sim_data,
                    },
                    ensure_ascii=False,
                ),
                hash_val=entry_hash,
                trust_index=75.0,
                effective_value=50000,
            )
            db.add(new_entry)
            db.commit()

            if is_farm:
                engine.add_value_bottom_up(db, payload.location, 50000)
    except Exception:
        import traceback

        traceback.print_exc()

    return {
        "status": "success",
        "message": "Context initialized",
        "path": payload.location,
    }


@router.get("/explore")
async def explore(path: str = "", db: Session = Depends(get_db)):
    path_list = [p for p in path.split("/") if p] if path else []
    obj = engine.get_object(db, path_list)
    if not obj:
        raise HTTPException(status_code=404, detail="Path not found")

    entries = obj.get("data_entries", [])
    avg_trust = (
        sum(e.get("trust_index", 50.0) for e in entries) / len(entries)
        if entries
        else 50.0
    )

    return {
        "current": obj["name"],
        "type": obj["type"],
        "metadata": obj["metadata"],
        "total_value": obj["metadata"].get("total_value", 0),
        "trust_index": round(avg_trust, 1)
        if obj["type"] == "Farm"
        else obj["metadata"].get("trust_index", 50.0),
        "children": [
            {
                "name": k,
                "type": v["type"],
                "value": v["metadata"].get("total_value", 0),
                "pulse": v["metadata"]["pulse_rate"],
                "history": v["metadata"].get("history", []),
                "location": v["metadata"].get(
                    "location",
                    [
                        35.8714 + random.uniform(-0.05, 0.05),
                        128.6014 + random.uniform(-0.05, 0.05),
                    ],
                ),
            }
            for k, v in obj["children"].items()
        ],
        "entries": entries,
    }


@router.get("/farms/all")
def get_all_farms(db: Session = Depends(get_db)):
    try:
        farms = []
        all_farms = db.query(Farm).all()
        all_regions = {r.id: r for r in db.query(Region).all()}

        for s in all_farms:
            path_parts = []
            curr_r_id = s.region_id
            while curr_r_id:
                curr_r = all_regions.get(curr_r_id)
                if not curr_r:
                    break
                path_parts.insert(0, curr_r.name)
                curr_r_id = curr_r.parent_id

            path = "/".join(path_parts + [s.name])

            gu = path_parts[0] if len(path_parts) > 0 else ""
            dong = path_parts[1] if len(path_parts) > 1 else ""
            street = "/".join(path_parts[2:]) if len(path_parts) > 2 else ""

            farms.append(
                {
                    "path": path,
                    "gu": gu,
                    "dong": dong,
                    "street": street,
                    "name": s.name,
                    "industry": s.industry,
                }
            )

        return {"status": "success", "farms": farms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
