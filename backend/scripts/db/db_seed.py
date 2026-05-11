import hashlib
import datetime
import random
import sys
import os
from sqlalchemy.orm import Session

# Add current dir to path to import seed_data properly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# Add project root to path to import app properly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from seed_data import get_massive_data, generate_sensor_json

from app.core.database import SessionLocal, DataEntry, Farm, Region
from app.core.engine import engine

db: Session = SessionLocal()

print(
    "Seeding Initial Data (Including Public Data Overlays) into PostgreSQL Database..."
)

try:
    # Clear existing data to prevent accumulation during repeated seeding
    db.query(DataEntry).delete()
    db.commit()

    massive_data = get_massive_data()

    for item in massive_data:
        state = item.get("state", "대구광역시")
        path_list = [state] + item["region"] + [item["name"]]
        location_path = "/".join(path_list)

        # Ensure hierarchy exists
        target_obj = engine.get_object(db, path_list)
        if not target_obj:
            # Region levels: State, City/District, Village, etc., up to len-1. Last is Farm.
            # E.g., ['대구광역시', '북구', '산격동', '연암로 스마트팜 밸리', '지니스팜 제1농장'] -> len 5
            level_names = ["State", "City", "District", "Village", "SubVillage", "Farm"]
            hierarchy_types = level_names[: len(path_list)]
            target_obj = engine.create_or_get_path(db, path_list, hierarchy_types)

        parent_id = None
        for p in path_list[:-1]:
            r = (
                db.query(Region)
                .filter(Region.name == p, Region.parent_id == parent_id)
                .first()
            )
            if r:
                parent_id = r.id

        farm = (
            db.query(Farm)
            .filter(Farm.name == path_list[-1], Farm.region_id == parent_id)
            .first()
        )
        if farm and not farm.industry:
            farm.industry = item["industry"]
            db.add(farm)

        sensor_data = generate_sensor_json(item.get("type", "smartfarm"))
        raw_text = f"[{item['industry']}] B2B/공공 API 연동망을 통해 수집된 '{item['name']}'의 실시간 환경 및 경영 스냅샷 데이터입니다.\n센서/공공데이터: {sensor_data}"
        insights = f"[B2B 공공/기업 연동 데이터] {item['insight']}"
        trust_hash = hashlib.sha256(raw_text.encode()).hexdigest()

        # Check if entry already exists to avoid duplicates
        existing = db.query(DataEntry).filter(DataEntry.hash_val == trust_hash).first()
        if not existing:
            effective_value = random.randint(120000, 250000)

            new_entry = DataEntry(
                location_path=location_path,
                farm_id=farm.id if farm else None,
                industry=item["industry"],
                is_guest=0,
                raw_text=raw_text,
                drive_link=None,  # In a real sync, this would fetch from Drive API
                insights=insights,
                trust_index=round(random.uniform(85.0, 99.0), 1),
                effective_value=effective_value,
                hash_val=trust_hash,
                created_at=datetime.datetime.now(datetime.timezone.utc)
                - datetime.timedelta(hours=random.randint(1, 48)),
            )
            db.add(new_entry)

            # Roll up values to Regions/Farm
            engine.add_value_bottom_up(db, path_list, effective_value)

    db.commit()
    print("Database seeding completed successfully!")
except Exception as e:
    db.rollback()
    print(f"Error during seeding: {e}")
finally:
    db.close()
