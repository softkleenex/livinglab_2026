import sys
import os
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.core.database import SessionLocal, Product, Region, User

def seed_b_grade_and_synthetic():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("No user found. Please run main seed first.")
            return

        region = db.query(Region).filter(Region.name == "북구").first()
        region_id = region.id if region else None

        # Add Synthetic Data Products
        synth1 = Product(
            seller_id=user.id,
            region_id=region_id,
            category="synthetic_data",
            title="대구 사과 기후변화 대응 합성 데이터셋 (10만 건)",
            description="경북대 사과 센터 연계, 아열대화 기후 예측 모델 학습용 데이터셋입니다.",
            price=1500000,
            stock=100,
            ai_grade="A",
            ai_recommendation="아열대화 기후 예측 모델 학습",
            image_url="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop"
        )
        
        synth2 = Product(
            seller_id=user.id,
            region_id=region_id,
            category="synthetic_data",
            title="스마트팜 환경-생육 상관관계 결합 데이터 (API)",
            description="MDGA Data Hub에서 제공하는 구독형 데이터입니다.",
            price=500000,
            stock=999,
            ai_grade="A",
            ai_recommendation="농업용 AI 에이전트 RAG 파이프라인",
            image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop"
        )

        # Add B-grade Produce
        bgrade1 = Product(
            seller_id=user.id,
            region_id=region_id,
            category="b_grade_produce",
            title="가공용 B급 딸기 (잼/주스용) 50kg",
            description="지니스스마트팜에서 생산된 당도 높은 잼용 딸기입니다.",
            price=150000,
            stock=5,
            ai_grade="B",
            ai_recommendation="지역 베이커리 '산격제과' 추천 매칭",
            image_url="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop"
        )

        bgrade2 = Product(
            seller_id=user.id,
            region_id=region_id,
            category="b_grade_produce",
            title="흠집 사과 (과일즙 가공용) 100kg",
            description="경북 청송 사과농장B의 흠집 사과입니다. 과일즙 가공에 적합합니다.",
            price=200000,
            stock=2,
            ai_grade="C",
            ai_recommendation="중구 '동성로 쥬스바' 추천 매칭",
            image_url="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop"
        )

        db.add_all([synth1, synth2, bgrade1, bgrade2])
        db.commit()
        print("Products seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_b_grade_and_synthetic()
