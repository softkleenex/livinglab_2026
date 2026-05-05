from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, Store, Region
from app.core.engine import engine
from app.core.websocket import manager
from app.services.gemini_ai import model
from app.api.deps import verify_token
import traceback
import json
import random
import hashlib
import asyncio

router = APIRouter()
@router.delete("/clear_db")
def clear_db(db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    db.query(DataEntry).delete()
    db.query(Store).delete()
    db.query(Region).delete()
    db.commit()
    return {"status": "success", "message": "DB Cleared"}

@router.post("/reset_schema")
def reset_schema(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    from app.core.database import Base, engine as db_engine
    from app.services.google_drive import FOLDER_CACHE
    Base.metadata.drop_all(bind=db_engine)
    Base.metadata.create_all(bind=db_engine)
    FOLDER_CACHE.cache.clear()
    return {"status": "success", "message": "Schema reset completely."}

@router.post("/demo/inject")
async def demo_inject(path: str, db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    try:
        path_list = [p for p in path.split("/") if p]
        types = ["Gu", "Dong", "Street", "Store"]
        target_obj = engine.create_or_get_path(db, path_list, types)
        
        mock_insights = [
            {"date": "2026-04-05", "text": "합성 데이터 예측: 다음 주 강수량 부족으로 인해 토양 수분 지수가 경고 수준에 도달할 예정입니다. 스프링클러 가동 시간을 20% 늘리는 것을 권장합니다.", "trust": 88.5},
            {"date": "2026-04-07", "text": "합성 데이터 분석: 폭염 대비 관수 시스템 용량이 부족할 것으로 예상됩니다. 내일까지 예비 용수 확보가 필요하므로 주변 농가와 자원 공유 일정을 협의하세요.", "trust": 92.0},
            {"date": "2026-04-08", "text": "AI 멀티모달 분석 (비전): 업로드하신 작물 이미지를 스캔했습니다. 잎사귀의 갈변 현상이 관찰되며, 질소 비료 결핍 또는 초기 병충해일 가능성이 있습니다. 추가 토양 검사를 권장합니다.", "trust": 95.5, "link": "https://drive.google.com/file/d/1Xdvq-HOVBOdaS0oalgrVXrXSvi0AYonQ/view?usp=drivesdk"}
        ]
        
        total_effective_value = 0
        
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r:
                parent_id = r.id
            else:
                break
                
        store = db.query(Store).filter(Store.name == path_list[-1], Store.region_id == parent_id).first()
        
        for i, m in enumerate(mock_insights):
            trust_index = m["trust"]
            base_value = random.randint(50000, 200000)
            effective_value = int(base_value * (trust_index / 100.0))
            total_effective_value += effective_value
            
            entry_hash = hashlib.sha256((m["text"] + str(random.random())).encode()).hexdigest()
            
            # Save to DB
            new_entry = DataEntry(
                location_path=path,
                store_id=store.id if store else None,
                industry="테스트",
                is_guest=0,
                raw_text=f"[{m['date']}] 사용자가 직접 입력한 모의 테스트 데이터입니다.",
                drive_link=m.get("link"),
                insights=m["text"],
                trust_index=trust_index,
                effective_value=effective_value,
                hash_val=entry_hash
            )
            db.add(new_entry)
            
        engine.add_value_bottom_up(db, path_list, total_effective_value)
        db.commit()
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": total_effective_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate/governance")
async def simulate_governance(budget: int = Form(...), region: str = Form(...)):
    try:
        prompt = f"""
    우리는 현재 '{region}' 구역(마을/재배지)의 농업 생태계 활성화를 위해 '{budget:,} 원'의 인프라 및 기술 예산을 투입하는 B2B 거버넌스 정책 시뮬레이션을 수행하고 있습니다.
    
    당신은 최고 수준의 스마트시티 정책 분석가이자 데이터 사이언티스트입니다.
    다음의 키를 가진 유효한 JSON 포맷으로 예측 결과를 렌더링하세요. 다른 포맷팅 텍스트나 마크다운(```)은 모두 제외하세요.
    
    {{
        "roi_multiplier": "예: '3.5x', '4.2x' (투자 대비 예상 가치 창출 배수)",
        "job_creation": "예: '+450 Jobs', '+1,200 Jobs' (예상 고용/기회 창출 수)",
        "ai_recommendation": "해당 지역({region})과 예산 규모({budget:,}원)에 맞는 고도화된 정책 제안 및 인프라 설계 전략 (3~4문장, 전문가 톤, 이모지 사용)",
        "sector_boost": "예: 'IT/스마트물류', '고부가가치 식음료' (수혜가 예상되는 구체적인 핵심 산업)",
        "vulnerability_warning": "이 정책 시뮬레이션에서 예상되는 맹점, 리스크 또는 데이터 모니터링 취약점 (2문장 내외)"
    }}
    """
        try:
            res = model.generate_content(prompt)
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            sim_data = json.loads(raw_eval)
        except Exception:
            sim_data = {
                "roi_multiplier": "3.1x",
                "job_creation": f"+{random.randint(100, 500)} Jobs",
                "ai_recommendation": f"[{region}] 이 대규모 자본({budget}원) 은 지역 첨단 융합 산업 벨트 구축에 크게 기여할 것입니다. 수집된 소상공인 데이터를 기반으로 가장 맥박(Pulse)이 떨어지는 구간에 긴급 수혈을 권장합니다.",
                "sector_boost": "서비스 및 IT 산업",
                "vulnerability_warning": "초기 인프라 매몰 비용 리스크"
            }
        
        return {"status": "success", "simulation": sim_data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
