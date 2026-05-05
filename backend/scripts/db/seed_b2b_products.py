import os
import sys

# Add the project root to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.core.database import SessionLocal, Product

def seed_b2b_products():
    db = SessionLocal()
    try:
        # Check if products already exist
        if db.query(Product).count() > 0:
            print("Products already seeded.")
            return

        products = [
            Product(
                seller_id=1, 
                region_id=1,
                category="synthetic_data",
                title="대구 사과 기후변화 대응 합성 데이터셋 (10만 건)",
                description="기상청 기후 시나리오와 생육 데이터를 결합한 고품질 데이터셋입니다.",
                price=1500000,
                stock=50,
                status="available",
                image_url='https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop',
                ai_grade="A",
                ai_recommendation="아열대화 기후 예측 모델 학습용"
            ),
            Product(
                seller_id=1, 
                region_id=1,
                category="synthetic_data",
                title="스마트팜 환경-생육 상관관계 결합 데이터 (API)",
                description="수분, 온도 센서 로그와 엽채류 생육 지표의 시계열 데이터",
                price=500000,
                stock=100,
                status="available",
                image_url='https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
                ai_grade="A",
                ai_recommendation="농업용 AI 에이전트 RAG 파이프라인 최적화"
            ),
            Product(
                seller_id=1, 
                region_id=1,
                category="raw_data",
                title="자율주행 트랙터 일일 가동 및 토양 압축 센서 로그",
                description="경북 안동 일대 자율주행 트랙터의 주행 경로 및 토양 압축력 데이터.",
                price=300000,
                stock=5,
                status="available",
                image_url='https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop',
                ai_grade="B",
                ai_recommendation="농기계 농기계사 R&D 부서 모델 개선용"
            )
        ]
        
        db.add_all(products)
        db.commit()
        print("Successfully seeded B2B products!")
        
    except Exception as e:
        print(f"Error seeding products: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_b2b_products()