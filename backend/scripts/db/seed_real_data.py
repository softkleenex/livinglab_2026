import sys
import os
import json
import random
import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.core.database import SessionLocal, Farm, DataEntry, Region, User

def fetch_and_seed_real_dataset():
    db = SessionLocal()
    try:
        from datasets import load_dataset
        print("Fetching real agricultural dataset from Hugging Face...")
        # Use the dataset we already identified
        dataset = load_dataset("jason1966/aksahaha_crop-recommendation", split="train")
        
        # Get or create admin user for the seeding
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            admin_user = User(email="admin_real@mdga.com", username="Admin_Real", role="admin")
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        region = db.query(Region).filter(Region.name == "전라남도").first()
        if not region:
            region = Region(name="전라남도", lat=34.8161, lng=126.4629)
            db.add(region)
            db.commit()
            db.refresh(region)

        farm_name = "Real Dataset Farm (Kaggle/HF)"
        farm = db.query(Farm).filter(Farm.name == farm_name).first()
        if not farm:
            farm = Farm(name=farm_name, region_id=region.id, owner_id=admin_user.id)
            db.add(farm)
            db.commit()
            db.refresh(farm)

        print(f"Loaded {len(dataset)} rows. Seeding 50 representative samples...")
        
        # Seed 50 samples to avoid overwhelming the DB
        import hashlib
        
        # Crop mapping for Korean translation
        crop_map = {
            "rice": "벼", "maize": "옥수수", "chickpea": "병아리콩", "kidneybeans": "강낭콩",
            "pigeonpeas": "비둘기콩", "mothbeans": "나방콩", "mungbean": "녹두", "blackgram": "검은콩",
            "lentil": "렌틸콩", "pomegranate": "석류", "banana": "바나나", "mango": "바나나",
            "grapes": "포도", "watermelon": "수박", "muskmelon": "참외", "apple": "사과",
            "orange": "오렌지", "papaya": "파파야", "coconut": "코코넛", "cotton": "목화",
            "jute": "황마", "coffee": "커피"
        }

        entries = []
        for i in range(50):
            row = dataset[i * 20] # spread out the samples
            crop_kr = crop_map.get(row['label'], row['label'])
            
            raw_text = f"작물: {crop_kr}, 질소(N): {row['Nitrogen']}, 인(P): {row['phosphorus']}, 칼륨(K): {row['potassium']}, 온도: {round(row['temperature'], 1)}°C, 습도: {round(row['humidity'], 1)}%, pH: {round(row['ph'], 1)}, 강우량: {round(row['rainfall'], 1)}mm"
            
            insights_data = {
                "crop_type": crop_kr,
                "temperature": round(row['temperature'], 1),
                "growth_stage": "알수없음",
                "pest_disease_detected": False,
                "real_dataset_source": "HuggingFace: jason1966/aksahaha_crop-recommendation"
            }
            
            insights_str = f"Real Dataset Source: Hugging Face\n\n```json\n{json.dumps(insights_data, ensure_ascii=False, indent=2)}\n```"
            
            trust_hash = hashlib.sha256(raw_text.encode()).hexdigest()
            
            entry = DataEntry(
                location_path=f"대한민국/전라남도/{farm_name}",
                farm_id=farm.id,
                industry="스마트팜/노지",
                is_guest=0,
                raw_text=raw_text,
                insights=insights_str,
                trust_index=95.0, # High trust for real data
                effective_value=random.randint(80000, 150000),
                hash_val=trust_hash,
                created_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 30))
            )
            entries.append(entry)

        db.add_all(entries)
        db.commit()
        print("Successfully seeded real datasets into DB!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding real datasets: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fetch_and_seed_real_dataset()
