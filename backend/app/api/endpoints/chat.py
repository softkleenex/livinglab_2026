from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.engine import engine
from app.services.gemini_ai import model

router = APIRouter()

class ChatPayload(BaseModel):
    path: str
    industry: str
    message: str

@router.post("")
async def chat_with_copilot(payload: ChatPayload):
    path_list = [p for p in payload.path.split("/") if p]
    obj = engine.get_object(path_list)
    if not obj: raise HTTPException(status_code=404, detail="Store not found")
    
    parent_obj = engine.get_object(path_list[:-1]) if len(path_list) > 1 else engine.db
    parent_avg = parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1))
    
    entries = obj.get("data_entries", [])
    history_text = "\n".join([f"- {e['timestamp']}: {e['insights']}" for e in entries[-5:]]) if entries else "아직 데이터가 없습니다."
    
    current_value = obj["metadata"].get("total_value", 0)
    current_pulse = obj["metadata"].get("pulse_rate", 0)
    
    prompt = f"""
    당신은 '{obj['name']}' ({payload.industry})의 전담 AI 비서(MDGA Copilot);입니다.
    
    [실시간 사업장 현황]
    - 누적 매출/생산 가치: {current_value}원 (상권 평균: {parent_avg}원)
    - 사업장 활성도: {current_pulse} BPM
    
    [최근 데이터 피딩 기록]
    {history_text}
    
    사용자의 질문: "{payload.message}"
    
    위의 구체적인 수치 데이터와 기록을 반드시 인용하면서, 사용자에게 친절하고 전문적으로 2~3문장 내외로 답변해주세요. 
    만약 데이터와 무관한 질문이라도 산업군에 맞는 조언을 추가해주세요.
    """
    try:
        res = model.generate_content(prompt)
        reply = res.text
    except Exception:
        reply = "죄송합니다. 현재 네트워크 문제로 답변을 드릴 수 없습니다."
        
    return {"status": "success", "reply": reply}
