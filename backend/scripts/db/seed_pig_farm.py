import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.core.database import SessionLocal, Farm, DataEntry, Region, User

def seed_pig_farm():
    db = SessionLocal()
    try:
        # Create or find admin user
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            admin_user = User(email="admin_pig@mdga.com", username="Admin_Pig", role="admin")
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        # Create or find region
        region = db.query(Region).filter(Region.name == "대구광역시").first()
        if not region:
            region = Region(name="대구광역시", lat=35.8714, lng=128.6014)
            db.add(region)
            db.commit()
            db.refresh(region)

        # Create Pig Farm
        farm_name = "MDGA 시범 양돈장"
        farm = db.query(Farm).filter(Farm.name == farm_name).first()
        if not farm:
            farm = Farm(
                name=farm_name, 
                region_id=region.id, 
                owner_id=admin_user.id,
                industry="축산/양돈"
            )
            db.add(farm)
            db.commit()
            db.refresh(farm)

        # Add some initial dummy data for twin map & dashboard
        entry = db.query(DataEntry).filter(DataEntry.farm_id == farm.id).first()
        if not entry:
            dummy_insight = {
                "livestock_type": "pig",
                "status": "warning",
                "recent_mortality": 2,
                "ventilation_index": "poor",
                "asf_risk_radius_km": 15
            }
            new_entry = DataEntry(
                farm_id=farm.id,
                industry="축산/양돈",
                location_path="대한민국/대구광역시",
                raw_text="최근 환기 불량으로 기침하는 돼지 발생.",
                insights=json.dumps(dummy_insight, ensure_ascii=False),
                trust_index=85.5,
                effective_value=12000,
                hash_val="dummy_pig_hash_001"
            )
            db.add(new_entry)
            db.commit()

        print("Successfully seeded a Pig Farm (양돈 농가) for Scenario 1 testing!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding pig farm: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_pig_farm()
