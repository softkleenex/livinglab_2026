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
                category="b_grade_crop",
                title="의성 마늘 (B급/크기 불규칙)",
                description="크기가 고르지 않으나 향과 맛은 훌륭합니다.",
                price=15000,
                stock=50,
                status="available",
                image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23facc15;stop-opacity:1" /><stop offset="100%" style="stop-color:%23a16207;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad1)" /><text x="50%" y="50%" font-family="sans-serif" font-size="24" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">마늘</text></svg>',
                ai_grade="B",
                ai_recommendation="다진마늘, 마늘빵 소스용으로 최적화"
            ),
            Product(
                seller_id=1, 
                region_id=1,
                category="b_grade_crop",
                title="안동 사과 (흠집/주스용)",
                description="태풍으로 약간의 흠집이 있으나 당도는 높습니다.",
                price=12000,
                stock=100,
                status="available",
                image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:%237f1d1d;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad2)" /><text x="50%" y="50%" font-family="sans-serif" font-size="24" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">사과</text></svg>',
                ai_grade="B",
                ai_recommendation="애플주스, 사과잼용으로 최적화"
            ),
            Product(
                seller_id=1, 
                region_id=1,
                category="co-purchase",
                title="청송 고추가루 50kg 공동구매",
                description="동네 식당 연합 공동구매 건입니다.",
                price=80000,
                stock=5,
                status="available",
                image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23dc2626;stop-opacity:1" /><stop offset="100%" style="stop-color:%23991b1b;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad3)" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">고추가루</text></svg>',
                ai_grade="A",
                ai_recommendation="대용량 고춧가루가 필요한 요식업소"
            ),
            # Phase 3: Urban Byproduct Reverse Logistics (도심 부산물 역순환)
            Product(
                seller_id=1, 
                region_id=1,
                category="urban_byproduct",
                title="수성구 대형카페 커피찌꺼기 100kg",
                description="잘 말린 커피찌꺼기입니다. 친환경 비료나 퇴비로 활용 가능합니다.",
                price=0,
                stock=1,
                status="available",
                image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2378350f;stop-opacity:1" /><stop offset="100%" style="stop-color:%23451a03;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad4)" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">커피박</text></svg>',
                ai_grade="A",
                ai_recommendation="과수원(사과, 배) 친환경 퇴비 원료"
            ),
            Product(
                seller_id=1, 
                region_id=1,
                category="urban_byproduct",
                title="식품공장 콩비지 2톤 (매주 배출)",
                description="두부 제조 공장에서 나오는 신선한 콩비지입니다.",
                price=50000,
                stock=4,
                status="available",
                image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fef3c7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23d97706;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(%23grad5)" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">콩비지</text></svg>',
                ai_grade="B",
                ai_recommendation="한우/돼지 축산 농가 특식 사료용"
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
