import os
import sys

# Add the project root to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.core.database import SessionLocal, Product


def seed_b2b_products():
    db = SessionLocal()
    try:
        # Clear existing products to allow re-seeding
        db.query(Product).delete()
        db.commit()

        products = [
            Product(
                seller_id=1,
                region_id=1,
                category="synthetic_data",
                title="[aT/KMA 연동] 2026 대구 사과 기후변화 대응 합성 데이터셋 (10만 건)",
                description="기상청(KMA) 기후 시나리오(RCP 8.5)와 농수산식품유통공사(aT) 생육 데이터를 결합한 고품질 데이터셋입니다. 병해충 발생 예측 모델 학습에 최적화되어 있습니다.",
                price=1500000,
                stock=50,
                status="available",
                image_url="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=600&auto=format&fit=crop",
                ai_grade="A+",
                ai_recommendation="아열대화 기후 예측 모델 및 엽채류 가격 예측 AI 파이프라인 학습용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="synthetic_data",
                title="[RDA 연동] 스마트팜 환경-생육 상관관계 결합 데이터 (API)",
                description="농촌진흥청(RDA) 흙토람 API 기준 토양 수분/온도 데이터와 경북 지역 50개 스마트팜 온실 센서 로그(수분, 온도, CO2)의 시계열 매핑 데이터.",
                price=500000,
                stock=100,
                status="available",
                image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
                ai_grade="S",
                ai_recommendation="농업용 AI 에이전트 RAG 파이프라인 최적화 및 생육 정밀 제어",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="raw_data",
                title="자율주행 트랙터 일일 가동 및 토양 압축 센서 로그",
                description="경북 안동 일대 자율주행 트랙터 20대의 주행 경로 및 토양 압축력 데이터. KMA 강수량 데이터와 교차 검증된 노지 환경 정보 포함.",
                price=300000,
                stock=5,
                status="available",
                image_url="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop",
                ai_grade="B+",
                ai_recommendation="농기계 제조사 R&D 부서 자율주행 알고리즘 개선용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="raw_data",
                title="[지자체/KOSIS] 경북 지역 5년치 폭염 및 가뭄 재해 농가 피해 데이터",
                description="통계청(KOSIS) 지자체 공공 데이터와 연동된 농가 피해 실태 및 보상 이력 데이터셋. 지역별 기상 특보 발령 시점과의 타임라인 포함.",
                price=800000,
                stock=10,
                status="available",
                image_url="https://images.unsplash.com/photo-1584727638096-042c45049ebe?q=80&w=600&auto=format&fit=crop",
                ai_grade="S",
                ai_recommendation="지자체 재해 예방 모델 구축 및 농작물 재해보험사 리스크 분석용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="machinery",
                title="탄소 저감형 수직농장 LED 및 관수 시스템 (중고)",
                description="에그리테크 산격센터에서 1년 사용한 A급 스마트팜 설비. 한전 전력데이터 개방포털 연동 탄소 저감 인증 완료 모델.",
                price=12000000,
                stock=2,
                status="available",
                image_url="https://images.unsplash.com/photo-1530836369250-ef71a35921bf?q=80&w=600&auto=format&fit=crop",
                ai_grade="A",
                ai_recommendation="신규 스마트팜 창업자 초기 비용 절감 및 친환경 보조금 신청용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="co-purchase",
                title="[공공 API 팩] 스마트팜 통합 관제 AI 소프트웨어 연간 라이선스",
                description="기상청, 농진청, KOSIS 공공 API 무제한 연동 및 자체 이상 징후 알림 기능 포함. 10개 농가 이상 공동구매 시 40% 할인 적용.",
                price=2000000,
                stock=100,
                status="available",
                image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
                ai_grade="A+",
                ai_recommendation="중소규모 농가 데이터 통합 관제 지능화 시스템 도입용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="synthetic_data",
                title="[KAMIS/KOSIS] 2026 전국 마늘/양파 과잉생산 위험도 시뮬레이션 지표",
                description="KAMIS 일일 도매가 데이터와 통계청 재배면적 데이터를 AI로 분석하여 도출한 3개월 후 수급/가격 예측 몬테카를로 시뮬레이션 지표입니다.",
                price=900000,
                stock=20,
                status="available",
                image_url="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop",
                ai_grade="S+",
                ai_recommendation="식품 가공업체 및 대형 마트 소싱 부서의 원재료 구매 시기 최적화용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="machinery",
                title="[관수제어] KMA 강수 확률 연동형 스마트 밸브 제어기",
                description="기상청 초단기 강수 예측 API와 직접 연동되어 비가 오기 전 관수를 자동 중단하는 스마트 밸브 시스템입니다. 수자원 절약 효과 30%.",
                price=450000,
                stock=35,
                status="available",
                image_url="https://images.unsplash.com/photo-1587311925345-c4de4ba1f6db?q=80&w=600&auto=format&fit=crop",
                ai_grade="A",
                ai_recommendation="노지 스마트팜 및 대규모 원예 단지의 스마트 수자원 관리용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="raw_data",
                title="[축산] 대구/경북 양계농장 폭염기 온습도(THI) 및 폐사율 데이터",
                description="최근 3년 폭염 특보 기간 동안의 지역 양계장 내부 온습도 센서 데이터 및 실제 폐사율 교차 데이터. 지자체 방역 지원 정보 포함.",
                price=600000,
                stock=15,
                status="available",
                image_url="https://images.unsplash.com/photo-1548685913-fe6678b7790b?q=80&w=600&auto=format&fit=crop",
                ai_grade="A",
                ai_recommendation="축산 환경 제어 솔루션 업체의 폭염 스트레스 완화 알고리즘 테스트용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="co-purchase",
                title="[탄소중립] 농산물 콜드체인 운송용 스마트 배터리 팩 공동구매",
                description="운송 중 온습도 유지를 위한 고효율 리튬이온 배터리 팩. KOSIS 탄소저감 인증 물류기업 우대 모델. 5개 이상 구매 시 단가 인하.",
                price=1500000,
                stock=50,
                status="available",
                image_url="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=600&auto=format&fit=crop",
                ai_grade="B+",
                ai_recommendation="지역 농협 및 농산물 유통 법인의 친환경 콜드체인 구축용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="synthetic_data",
                title="[RDA/KMA] 제주/남해안 아열대 작물(바나나, 망고) 재배지 북상 예측 맵",
                description="기상청의 10년 단위 기후 변화 시나리오와 농진청 작물 재배 한계선 데이터를 융합한 AI 공간 예측 맵(GIS 데이터 포함).",
                price=2500000,
                stock=10,
                status="available",
                image_url="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=600&auto=format&fit=crop",
                ai_grade="S",
                ai_recommendation="지자체 농업기술센터의 미래 대체 작물 선정 및 정책 수립용",
            ),
            Product(
                seller_id=1,
                region_id=1,
                category="raw_data",
                title="전국 도매시장 과일류 주간 반입 물량 및 경락가 (3년치 raw csv)",
                description="가락시장 및 전국 주요 농산물 도매시장의 실시간 반입 물량과 경매 낙찰가 원천 데이터. KAMIS 오픈 API 스크래핑 정제본.",
                price=200000,
                stock=100,
                status="available",
                image_url="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop",
                ai_grade="B",
                ai_recommendation="개인 연구자 및 데이터 분석가의 딥러닝 기반 가격 예측 모델 토이 프로젝트용",
            ),
        ]

        db.add_all(products)
        db.commit()
        print(
            f"Successfully seeded {len(products)} B2B products enriched with Public Data contexts!"
        )

    except Exception as e:
        print(f"Error seeding products: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_b2b_products()
