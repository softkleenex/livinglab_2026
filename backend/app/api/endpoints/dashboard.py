from fastapi import APIRouter, HTTPException, Depends
from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, DataEntry, Farm, User, Wallet, Transaction, Region
from app.services.gemini_ai import model
from app.api.deps import verify_token
import httpx
import io
import csv
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/personal")
async def get_personal_dashboard(path: str, db: Session = Depends(get_db), user: dict = Depends(verify_token)) -> dict:
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj: raise HTTPException(status_code=404, detail="Farm not found. Please setup context.")
    
    if obj.get("type") == "Farm":
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r: parent_id = r.id
            else: break
        farm = db.query(Farm).filter(Farm.name == path_list[-1], Farm.region_id == parent_id).first()
        if farm and farm.owner_id != user["user_id"] and user["role"] not in ["admin", "guest"]:
            raise HTTPException(status_code=403, detail="Not authorized to view this personal dashboard.")
    
    # Get parent object to compare
    parent_obj = engine.get_object(db, path_list[:-1]) if len(path_list) > 1 else engine.get_object(db, ["전체 (Root)"])
    
    entries = obj.get("data_entries", [])
    avg_trust = sum(e.get("trust_index", 50.0) for e in entries) / len(entries) if entries else 50.0
    
    user_wallet = db.query(Wallet).filter(Wallet.user_id == user["user_id"]).first()
    balance = int(user_wallet.balance) if user_wallet else 0
    
    return {
        "farm": {
            "name": obj["name"],
            "total_value": obj["metadata"].get("total_value", 0),
            "pulse": obj["metadata"].get("pulse_rate", 0),
            "trust_index": round(avg_trust, 1),
            "history": obj["metadata"].get("history", []),
            "entries": entries,
            "wallet_balance": balance
        },
        "parent": {
            "name": parent_obj["name"],
            "type": parent_obj["type"],
            "avg_value": parent_obj["metadata"].get("total_value", 0) // max(1, parent_obj["metadata"].get("nodes", 1)),
            "pulse": parent_obj["metadata"].get("pulse_rate", 0)
        }
    }

async def get_weather_forecast(lat: float, lng: float) -> str:
    try:
        # Open-Meteo API (No key required)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                max_temps = data['daily']['temperature_2m_max']
                precip = data['daily']['precipitation_sum']
                avg_max = sum(max_temps) / len(max_temps)
                total_precip = sum(precip)
                return f"향후 7일 평균 최고기온 {avg_max:.1f}°C, 총 강수량 {total_precip:.1f}mm 예상."
            return "기상 데이터 수집 지연."
    except Exception as e:
        return "기상 데이터 API 오류."

@router.get("/wallet/transactions")
async def get_wallet_transactions(db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    user_wallet = db.query(Wallet).filter(Wallet.user_id == user["user_id"]).first()
    if not user_wallet:
        return {"status": "success", "balance": 0, "transactions": []}

    txs = db.query(Transaction).filter(Transaction.wallet_id == user_wallet.id).order_by(Transaction.created_at.desc()).limit(50).all()

    tx_list = [{
        "id": tx.id,
        "amount": int(tx.amount),
        "type": tx.tx_type,
        "description": tx.description,
        "timestamp": tx.created_at.strftime("%Y-%m-%d %H:%M:%S")
    } for tx in txs]

    return {"status": "success", "balance": int(user_wallet.balance), "transactions": tx_list}
@router.get("/report")
async def generate_weekly_report(path: str, industry: str = "공공", db: Session = Depends(get_db)) -> dict:
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj: raise HTTPException(status_code=404, detail="Farm not found")
    
    # Get Parent context for competitiveness
    parent_obj = engine.get_object(db, path_list[:-1]) if len(path_list) > 1 else engine.get_object(db, ["전체 (Root)"])
    if not parent_obj:
        parent_obj = {"name": "상위 영역", "metadata": {"total_value": 0, "pulse_rate": 0}}
    
    entries = obj.get("data_entries", [])
    
    if not entries:
        return {"status": "success", "report": "아직 충분한 데이터가 수집되지 않았습니다. 농장/필지의 일상이나 현장 데이터를 먼저 피딩(업로드)해 주세요!"}

    from app.services.report_service import report_service
    report_text = await report_service.generate_weekly_report(
        path=path,
        industry=industry,
        obj_metadata=obj["metadata"],
        parent_metadata=parent_obj["metadata"],
        parent_name=parent_obj["name"],
        entries=entries
    )

    return {"status": "success", "report": report_text}

@router.post("/market/buy")
async def buy_market_data(payload: dict, db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    industry = payload.get("industry")
    price = payload.get("price", 1000)
    
    user_wallet = db.query(Wallet).filter(Wallet.user_id == user["user_id"]).with_for_update().first()
    if not user_wallet or user_wallet.balance < price:
        raise HTTPException(status_code=400, detail="Not enough $MDGA tokens.")
        
    user_wallet.balance -= price
    
    tx = Transaction(
        wallet_id=user_wallet.id,
        amount=-price,
        tx_type="SPEND",
        description=f"Purchased {industry} Market Data"
    )
    db.add(tx)
    db.commit()
    
    return {"status": "success", "message": f"{industry} 데이터를 구매했습니다. (차감: {price} $MDGA)", "new_balance": user_wallet.balance}

@router.post("/wallet/withdraw")
async def withdraw_funds(payload: dict, db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    amount = payload.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid withdrawal amount.")
        
    user_wallet = db.query(Wallet).filter(Wallet.user_id == user["user_id"]).with_for_update().first()
    if not user_wallet or user_wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")
        
    user_wallet.balance -= amount
    
    tx = Transaction(
        wallet_id=user_wallet.id,
        amount=-amount,
        tx_type="SPEND",
        description="Withdrawal to external bank account"
    )
    db.add(tx)
    db.commit()
    
    return {"status": "success", "message": "Withdrawal processed successfully", "new_balance": user_wallet.balance}

@router.get("/export")
async def export_csv(path: str, industry: str = "공공", db: Session = Depends(get_db), user: dict = Depends(verify_token)):
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj: raise HTTPException(status_code=404, detail="Farm not found.")

    if obj.get("type") == "Farm":
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = db.query(Region).filter(Region.name == p, Region.parent_id == parent_id).first()
            if r: parent_id = r.id
            else: break
        farm = db.query(Farm).filter(Farm.name == path_list[-1], Farm.region_id == parent_id).first()
        if farm and farm.owner_id != user["user_id"] and user["role"] not in ["admin", "guest"]:
            raise HTTPException(status_code=403, detail="Not authorized to export this farm's raw data.")

    entries = obj.get("data_entries", [])    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Farm Name", "Industry", "Hash", "Scope", "Trust Index", "Effective Value", "Raw Text", "Insights"])
    
    # 1. Existing Real Entries
    for e in entries:
        writer.writerow([
            e.get("timestamp", ""),
            obj['name'],
            industry,
            e.get("hash", ""),
            e.get("scope", ""),
            e.get("trust_index", ""),
            e.get("effective_value", ""),
            e.get("raw_text", "N/A"),
            e.get("insights", "")
        ])
        
    import urllib.parse
    output.seek(0)
    filename = f"MDGA_Data_Export_{obj['name']}.csv"
    encoded_filename = urllib.parse.quote(filename)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{encoded_filename}"}
    )
