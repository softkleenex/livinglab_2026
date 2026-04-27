import hashlib
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, DataEntry, Store, Region
from app.core.engine import engine

db: Session = SessionLocal()

realistic_data = [
    # --- 스마트팜 & 농업 부문 ---
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "지니스팜 제1농장", "insight": "청년 디지털 농업인 3명 신규 채용 완료. 3월 상추 생산량 1.5톤 달성.", "industry": "농업/스마트팜"},
    {"region": ["북구", "산격동", "연암로 스마트팜 밸리"], "name": "에그리테크 산격센터", "insight": "신규 스마트팜 제어 솔루션 도입으로 전월 대비 인건비 15% 절감 및 수확량 20% 증대.", "industry": "농업/스마트팜"},
    {"region": ["달성군", "유가읍", "테크노폴리스 외곽"], "name": "달성 딸기 스마트팜", "insight": "딸기 당도 측정을 위한 비전 AI 센서 시범 도입. 수확 효율 12% 향상.", "industry": "농업/스마트팜"},
    
    # --- 첨단 제조업 및 물류, IT ---
    {"region": ["북구", "침산동", "경북대 창업캠퍼스"], "name": "AI 비전로보틱스(주)", "insight": "중소벤처기업부 지원사업 선정. R&D 연구원 5명 및 데이터 라벨러 10명 대규모 고용 창출.", "industry": "IT/로보틱스"},
    {"region": ["달서구", "성서동", "성서산업단지"], "name": "스마트물류(주) 대구센터", "insight": "물류 상하차 로봇 도입으로 야간 작업 효율 상승. 주간 지게차 기사 3명 정규직 전환.", "industry": "첨단물류"},
    {"region": ["달성군", "현풍읍", "테크노폴리스"], "name": "미래차 밧데리(주)", "insight": "해외 수출 물량 200% 증가. 생산직 50명 대규모 공채 및 공장 2동 증축 착공.", "industry": "제조/배터리"}
]

print("Seeding Initial Data into PostgreSQL Database...")

try:
    for item in realistic_data:
        path_list = ["대구광역시"] + item["region"] + [item["name"]]
        location_path = "/".join(path_list)
        
        # Ensure hierarchy exists
        target_obj = engine.get_object(db, path_list)
        if not target_obj:
            target_obj = engine.create_or_get_path(db, path_list, ["Gu", "Dong", "Street", "Store"])
            
        parent_id = None
        for p in path_list[:-1]:
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r: parent_id = r.id
            
        store = db.query(Store).filter(Store.name == path_list[-1], Store.region_id == parent_id).first()
        if store and not store.industry:
            store.industry = item["industry"]
            db.add(store)
            
        raw_text = f"B2B/공공 API 연동망을 통해 수집된 '{item['name']}'의 실시간 고용 및 경영 스냅샷 데이터입니다."
        insights = f"[초기 B2B 공공/기업 연동 데이터] {item['insight']}"
        trust_hash = hashlib.sha256(raw_text.encode()).hexdigest()
        
        # Check if entry already exists to avoid duplicates
        existing = db.query(DataEntry).filter(DataEntry.hash_val == trust_hash).first()
        if not existing:
            effective_value = 150000
            
            new_entry = DataEntry(
                location_path=location_path,
                store_id=store.id if store else None,
                industry=item["industry"],
                is_guest=0,
                raw_text=raw_text,
                drive_link=None, # In a real sync, this would fetch from Drive API
                insights=insights,
                trust_index=95.0,
                effective_value=effective_value,
                hash_val=trust_hash,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1) # Seed data from yesterday
            )
            db.add(new_entry)
            
            # Roll up values to Regions/Store
            engine.add_value_bottom_up(db, path_list, effective_value)
            
    db.commit()
    print("Database seeding completed successfully!")
except Exception as e:
    db.rollback()
    print(f"Error during seeding: {e}")
finally:
    db.close()
