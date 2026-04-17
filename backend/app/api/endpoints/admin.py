from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry
from app.core.engine import engine
from app.core.websocket import manager
from app.services.gemini_ai import model
import traceback
import json
import random
import hashlib
import asyncio

router = APIRouter()

@router.delete("/clear_db")
def clear_db(db: Session = Depends(get_db)):
    db.query(DataEntry).delete()
    db.commit()
    engine.db["children"] = {}
    engine.db["metadata"]["nodes"] = 0
    engine.db["metadata"]["total_value"] = 0
    return "DB Cleared"

@router.post("/demo/inject")
async def demo_inject(path: str):
    try:
        path_list = [p for p in path.split("/") if p]
        types = ["Gu", "Dong", "Street", "Store"]
        target_obj = engine.create_or_get_path(path_list, types)
        
        mock_insights = [
            {"date": "2026-04-05", "text": "가상 지능 분석: 주말 매출이 지난주 대비 15% 상승했습니다. 특히 아메리카노와 케이크 세트 메뉴의 반응이 좋습니다. 세트 메뉴 프로모션을 연장하는 것을 권장합니다.", "trust": 88.5},
            {"date": "2026-04-07", "text": "가상 지능 분석: 원두 재고 소진 속도가 예상보다 빠릅니다. 내일까지 원두가 5kg 미만으로 떨어질 수 있으니, 즉시 인근 로스터리에서 비상 구매를 하거나 거래처에 긴급 배송을 요청하세요.", "trust": 92.0},
            {"date": "2026-04-08", "text": "가상 지능 분석 (비전): 업로드하신 현장 이미지를 스캔했습니다. 프로세스 및 공간 배치가 효율적이나, 추가적인 모니터링 센서 도입 시 효율을 15% 더 늘릴 수 있습니다.", "trust": 95.5, "link": "https://drive.google.com/file/d/1Xdvq-HOVBOdaS0oalgrVXrXSvi0AYonQ/view?usp=drivesdk"}
        ]
        
        total_effective_value = 0
        for i, m in enumerate(mock_insights):
            trust_index = m["trust"]
            base_value = random.randint(50000, 200000)
            effective_value = int(base_value * (trust_index / 100.0))
            total_effective_value += effective_value
            
            entry = {
                "timestamp": f"{m['date']} 14:0{i}",
                "insights": m["text"],
                "hash": hashlib.sha256(m["text"].encode()).hexdigest(),
                "drive_link": m.get("link"),
                "scope": "store_specific",
                "trust_index": trust_index,
                "raw_text": f"[{m['date']}] 사용자가 직접 입력한 모의 테스트 데이터입니다.",
                "effective_value": effective_value
            }
            target_obj["data_entries"].append(entry)
            
        if len(target_obj["data_entries"]) > 50: target_obj["data_entries"].pop(0)
        
        engine.add_value_bottom_up(path_list, total_effective_value)
        asyncio.create_task(manager.broadcast({"type": "update", "path": path_list, "value_added": total_effective_value, "pulse_rate": target_obj["metadata"]["pulse_rate"]}))
        
        return {"status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate/governance")
async def simulate_governance(budget: int = Form(...), region: str = Form(...)):
    try:
        prompt = f"우리는 현재 '{region}' 지역에 대해 {budget} 원의 예산을 투입하는 정책 시뮬레이션을 수행하고 있습니다. 다음 결과를 JSON 형식으로 반환하세요. 키값: 'roi_multiplier' (예: '2.5x'), 'job_creation' (예: '+12,000 Jobs'), 'ai_recommendation' (3~4문장의 정책 제안), 'sector_boost' (수혜 예상 핵심 산업), 'vulnerability_warning' (잠재적 리스크/취약점)."
        try:
            res = model.generate_content(prompt)
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            sim_data = json.loads(raw_eval)
        except Exception:
            sim_data = {
                "roi_multiplier": "3.1x",
                "job_creation": f"+{random.randint(100, 500)} Jobs",
                "ai_recommendation": f"[{region}] 이 대규모 자본({budget}원)은 지역 첨단 융합 산업 벨트 구축에 크게 기여할 것입니다. 수집된 소상공인 데이터를 기반으로 가장 맥박(Pulse)이 떨어지는 구간에 긴급 수혈을 권장합니다.",
                "sector_boost": "서비스 및 IT 산업",
                "vulnerability_warning": "초기 인프라 매몰 비용 리스크"
            }
        
        return {"status": "success", "simulation": sim_data}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
