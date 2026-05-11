import os
import sys
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.core.database import SessionLocal, SyntheticData
from app.services.public_data_service import public_data_service


async def seed_public_data():
    db = SessionLocal()
    try:
        # Clear existing synthetic data to avoid duplicates if resetting
        db.query(SyntheticData).delete()
        db.commit()

        regions = [
            "대구광역시",
            "경상북도 군위군",
            "달성군 테크노폴리스",
            "경북 안동시",
            "경북 상주시",
            "경북 포항시",
            "경북 김천시",
            "경북 구미시",
            "경북 영천시",
            "경북 경산시",
            "경북 의성군",
            "경북 청송군",
            "경북 영덕군",
            "경북 청도군",
            "경북 고령군",
            "경북 성주군",
            "경북 칠곡군",
            "경북 예천군",
            "경북 봉화군",
            "경북 울진군",
        ]
        crops = [
            "사과",
            "딸기",
            "토마토",
            "참외",
            "포도",
            "복숭아",
            "마늘",
            "양파",
            "배추",
            "무",
            "고추",
            "수박",
            "단감",
            "배",
            "매실",
            "파프리카",
            "오이",
            "가지",
            "당근",
            "콩",
        ]
        livestocks = ["한우", "양돈", "양계", "젖소", "오리", "흑염소", "양봉", "육우"]

        print("Starting Public Data (Synthetic) Seeding...")

        for i in range(len(regions)):
            region = regions[i]
            crop = crops[i % len(crops)]
            livestock = livestocks[i % len(livestocks)]

            print(f"Generating synthetic data for region: {region}, crop: {crop}...")

            # 1. Yield Prediction
            await public_data_service.generate_synthetic_yield_prediction(region, crop)

            # 2. Crop Simulator
            await public_data_service.generate_crop_simulator(region, crop)

            # 3. Oversupply Risk
            await public_data_service.generate_oversupply_risk(crop)

            # 4. Livestock Alert
            await public_data_service.generate_livestock_alert(region, livestock)

            # 5. Resource Efficiency
            await public_data_service.generate_resource_efficiency(region, crop)

            print(f"✅ Generated 5 public data metrics for {region}")

        print("🎉 Public Data (Synthetic) Seeding Complete!")

    except Exception as e:
        print(f"Error seeding public data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(seed_public_data())
