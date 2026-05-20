import sys
import os
import random
import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.core.database import SessionLocal, User, Farm, Region, Product, DataEntry, Wallet
from scripts.db.seed_data import get_massive_data

def run():
    db = SessionLocal()
    try:
        print("Seeding massive dummy users, farms, and products directly to DB...")
        massive_data = get_massive_data()
        
        # Create Dummy Users
        users = []
        for i in range(20):
            u = User(email=f"farmer_{i}@mdga.io", name=f"Farmer {i}", role="farm")
            db.add(u)
            users.append(u)
        db.commit()
        for u in users:
            db.add(Wallet(user_id=u.id, balance=random.randint(1000, 50000)))
        db.commit()

        # Create Regions and Farms
        farms_created = 0
        for item in massive_data:
            state = item.get("state", "대구광역시")
            regions = item.get("region", [])
            
            # Ensure state exists
            r_state = db.query(Region).filter(Region.name == state, Region.level_type == "City").first()
            if not r_state:
                r_state = Region(name=state, level_type="City")
                db.add(r_state)
                db.commit()
                db.refresh(r_state)
            
            parent_id = r_state.id
            path_str = state
            
            for lvl_name in regions:
                path_str += f"/{lvl_name}"
                r_child = db.query(Region).filter(Region.name == lvl_name, Region.parent_id == parent_id).first()
                if not r_child:
                    r_child = Region(name=lvl_name, parent_id=parent_id, level_type="District")
                    db.add(r_child)
                    db.commit()
                    db.refresh(r_child)
                parent_id = r_child.id
                
            # Create farm
            farm_name = item["name"]
            farm = db.query(Farm).filter(Farm.name == farm_name, Farm.region_id == parent_id).first()
            if not farm:
                owner = random.choice(users)
                farm = Farm(name=farm_name, region_id=parent_id, owner_id=owner.id, industry=item["industry"])
                db.add(farm)
                db.commit()
                db.refresh(farm)
                farms_created += 1
                
            # Add entries
            for _ in range(3):
                entry = DataEntry(
                    location_path=f"{path_str}/{farm_name}",
                    farm_id=farm.id,
                    industry=item["industry"],
                    raw_text=item["insight"],
                    insights="{\n  \"info\": \"Dummy Seeded Data\"\n}",
                    trust_index=random.uniform(50.0, 99.0),
                    effective_value=random.randint(1000, 50000),
                    hash_val=f"mock_{random.randint(100000, 99999999)}",
                    created_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 30))
                )
                db.add(entry)
        db.commit()
        print(f"Created {len(users)} users, {farms_created} farms, and populated entries.")
        
        # Create B2B Products
        products_data = [
            ("스마트팜 생육 데이터 1개월치", "synthetic_data", 500000),
            ("안동 사과 당도 예측 모델", "synthetic_data", 1200000),
            ("자율주행 트랙터 비전 데이터", "synthetic_data", 2500000),
            ("못난이 감자 (가공용) 100kg", "b_grade_produce", 80000),
            ("흠집난 양파 (식당용) 50kg", "b_grade_produce", 45000),
            ("B급 배추 (즙용) 200kg", "b_grade_produce", 150000),
        ]
        
        for p_title, p_cat, p_price in products_data:
            owner = random.choice(users)
            owner_farm = db.query(Farm).filter(Farm.owner_id == owner.id).first()
            p = Product(
                seller_id=owner.id,
                region_id=owner_farm.region_id if owner_farm else None,
                category=p_cat,
                title=p_title,
                description="Seeded product for testing ecosystem population.",
                price=p_price,
                stock=random.randint(1, 10),
                ai_grade=random.choice(["A", "B", "C"]),
                ai_recommendation="다양한 용도로 활용 가능한 좋은 데이터/상품입니다.",
                image_url="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
            )
            db.add(p)
        db.commit()
        print("Created B2B Products.")
        
    except Exception as e:
        print("Error:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
