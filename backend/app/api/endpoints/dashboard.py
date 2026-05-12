from fastapi import APIRouter, HTTPException, Depends, Query
from app.core.engine import engine
from sqlalchemy.orm import Session
from app.core.database import get_db, Farm, Wallet, Transaction, Region
from app.api.deps import verify_token
import httpx
import io
import csv
import random
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/twin-map-risks")
async def get_twin_map_risks(db: Session = Depends(get_db)):
    """Fetch real-time biosecurity and environmental risks for the Twin Map."""
    # Fetch real regions
    regions = db.query(Region).filter(Region.parent_id != None).limit(3).all()
    
    if not regions:
        return {"status": "success", "risks": []}

    from app.services.public_data_service import public_data_service
    risks = []
    
    for i, r in enumerate(regions):
        # Determine risk type heuristically or alternatingly
        if i % 2 == 0:
            alert = await public_data_service.generate_livestock_alert(r.name, "돼지")
            r_type = "weather" if "폭염" in alert.get("actionable_insight", "") else "disease"
            r_status = "critical" if alert.get("mortality_risk_level") in ["심각", "고위험"] else "warning"
            r_name = f"위험 지수 {alert.get('heat_stress_index', '경계')}"
            r_distance = f"골든타임 {alert.get('golden_time_hours', 2)}시간"
        else:
            alert = await public_data_service.generate_oversupply_risk("사과")
            r_type = "ventilation"
            r_status = "warning"
            r_name = f"수급 위험: {alert.get('risk_level', '주의')}"
            r_distance = f"예상 하락폭 {alert.get('expected_price_drop_percent', 10)}%"

        lat = r.lat + random.uniform(-0.05, 0.05) if r.lat else 36.0 + random.uniform(-1, 1)
        lng = r.lng + random.uniform(-0.05, 0.05) if r.lng else 128.0 + random.uniform(-1, 1)
        
        risks.append({
            "id": i + 1,
            "type": r_type,
            "name": r_name,
            "status": r_status,
            "location": f"{r.name}",
            "distance": r_distance,
            "lat": lat,
            "lng": lng
        })

    return {"status": "success", "risks": risks}

@router.get("/sales-insight")
async def get_sales_insight(path: str = Query(""), db: Session = Depends(get_db)):
    """Fetch integrated sales, shipment, and AI recommendation data."""
    # In reality, this would aggregate from e-commerce APIs (Cafe24, SmartStore, etc.)
    # Here, we dynamically simulate it based on the farm's transactions/wallet if possible,
    # or generate a structured response based on the path.
    
    # Try to find user wallet if user context was passed (simplified here)
    # Since we might not have a full token in this generic dashboard call, we simulate based on farm value.
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list) if path_list else None
    
    base_sales = 12500000
    base_shipped = 4200
    if obj and obj.get("type") == "Farm":
        base_sales += obj["metadata"].get("total_value", 0) * 1000
        base_shipped += obj["metadata"].get("total_value", 0) // 10
        
    # AI Recommendation calculation
    growth_trend = random.uniform(-0.1, 0.3)
    if growth_trend > 0.1:
        recommendation = f"최근 3개월 판매량 증가 추세. 다음 달 재배량 {int(growth_trend*100)}% 상향 권장."
    elif growth_trend < -0.05:
        recommendation = f"최근 판매량 감소 추세. 재고 관리 및 B급 가공품 전환 비중을 {int(abs(growth_trend)*100)}% 확대하세요."
    else:
        recommendation = "최근 판매량 안정적 유지 중. 현재 수준의 재배량을 유지하세요."
        
    return {
        "status": "success", 
        "data": {
            "totalSales": f"{int(base_sales):,}",
            "totalShipped": int(base_shipped),
            "pendingShipment": random.randint(50, 300),
            "recommendation": recommendation,
            "growth_trend": round(growth_trend * 100, 1)
        }
    }

@router.get("/personal")
async def get_personal_dashboard(
    path: str, db: Session = Depends(get_db), user: dict = Depends(verify_token)
) -> dict:
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj:
        raise HTTPException(
            status_code=404, detail="Farm not found. Please setup context."
        )

    if obj.get("type") == "Farm":
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = (
                db.query(Region)
                .filter(Region.name == p, Region.parent_id == parent_id)
                .first()
            )
            if r:
                parent_id = r.id
            else:
                break
        farm = (
            db.query(Farm)
            .filter(Farm.name == path_list[-1], Farm.region_id == parent_id)
            .first()
        )
        if (
            farm
            and farm.owner_id != user["user_id"]
            and user["role"] not in ["admin", "guest"]
        ):
            raise HTTPException(
                status_code=403,
                detail="Not authorized to view this personal dashboard.",
            )

    # Get parent object to compare
    parent_obj = (
        engine.get_object(db, path_list[:-1])
        if len(path_list) > 1
        else engine.get_object(db, ["전체 (Root)"])
    )

    entries = obj.get("data_entries", [])
    avg_trust = (
        sum(e.get("trust_index", 50.0) for e in entries) / len(entries)
        if entries
        else 50.0
    )

    sample_entries = []
    if not entries:
        # Fetch real dataset samples if the user has no data yet
        sample_farm = db.query(Farm).filter(Farm.name == "Real Dataset Farm (Kaggle/HF)").first()
        if sample_farm:
            from app.core.database import DataEntry
            samples = db.query(DataEntry).filter(DataEntry.farm_id == sample_farm.id).limit(10).all()
            sample_entries = [
                {
                    "timestamp": s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "raw_text": s.raw_text,
                    "insights": s.insights,
                    "structured_data": {} # Fallback
                } for s in samples
            ]

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
            "sample_entries": sample_entries,
            "wallet_balance": balance,
        },
        "parent": {
            "name": parent_obj["name"],
            "type": parent_obj["type"],
            "avg_value": parent_obj["metadata"].get("total_value", 0)
            // max(1, parent_obj["metadata"].get("nodes", 1)),
            "pulse": parent_obj["metadata"].get("pulse_rate", 0),
        },
    }


async def get_weather_forecast(lat: float, lng: float) -> str:
    try:
        # Open-Meteo API (No key required)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                max_temps = data["daily"]["temperature_2m_max"]
                precip = data["daily"]["precipitation_sum"]
                avg_max = sum(max_temps) / len(max_temps)
                total_precip = sum(precip)
                return f"향후 7일 평균 최고기온 {avg_max:.1f}°C, 총 강수량 {total_precip:.1f}mm 예상."
            return "기상 데이터 수집 지연."
    except Exception:
        return "기상 데이터 API 오류."


@router.get("/wallet/transactions")
async def get_wallet_transactions(
    db: Session = Depends(get_db), user: dict = Depends(verify_token)
):
    user_wallet = db.query(Wallet).filter(Wallet.user_id == user["user_id"]).first()
    if not user_wallet:
        return {"status": "success", "balance": 0, "transactions": []}

    txs = (
        db.query(Transaction)
        .filter(Transaction.wallet_id == user_wallet.id)
        .order_by(Transaction.created_at.desc())
        .limit(50)
        .all()
    )

    tx_list = [
        {
            "id": tx.id,
            "amount": int(tx.amount),
            "type": tx.tx_type,
            "description": tx.description,
            "timestamp": tx.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for tx in txs
    ]

    return {
        "status": "success",
        "balance": int(user_wallet.balance),
        "transactions": tx_list,
    }


@router.get("/report")
async def generate_weekly_report(
    path: str, industry: str = "공공", db: Session = Depends(get_db)
) -> dict:
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Get Parent context for competitiveness
    parent_obj = (
        engine.get_object(db, path_list[:-1])
        if len(path_list) > 1
        else engine.get_object(db, ["전체 (Root)"])
    )
    if not parent_obj:
        parent_obj = {
            "name": "상위 영역",
            "metadata": {"total_value": 0, "pulse_rate": 0},
        }

    entries = obj.get("data_entries", [])

    if not entries:
        return {
            "status": "success",
            "report": "아직 충분한 데이터가 수집되지 않았습니다. 농장/필지의 일상이나 현장 데이터를 먼저 피딩(업로드)해 주세요!",
        }

    from app.services.report_service import report_service

    report_text = await report_service.generate_weekly_report(
        path=path,
        industry=industry,
        obj_metadata=obj["metadata"],
        parent_metadata=parent_obj["metadata"],
        parent_name=parent_obj["name"],
        entries=entries,
    )

    return {"status": "success", "report": report_text}


@router.post("/market/buy")
async def buy_market_data(
    payload: dict, db: Session = Depends(get_db), user: dict = Depends(verify_token)
):
    industry = payload.get("industry")
    price = payload.get("price", 1000)

    user_wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user["user_id"])
        .with_for_update()
        .first()
    )
    if not user_wallet or user_wallet.balance < price:
        raise HTTPException(status_code=400, detail="Not enough $MDGA tokens.")

    user_wallet.balance -= price

    tx = Transaction(
        wallet_id=user_wallet.id,
        amount=-price,
        tx_type="SPEND",
        description=f"Purchased {industry} Market Data",
    )
    db.add(tx)
    db.commit()

    return {
        "status": "success",
        "message": f"{industry} 데이터를 구매했습니다. (차감: {price} $MDGA)",
        "new_balance": user_wallet.balance,
    }


@router.post("/wallet/withdraw")
async def withdraw_funds(
    payload: dict, db: Session = Depends(get_db), user: dict = Depends(verify_token)
):
    amount = payload.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid withdrawal amount.")

    user_wallet = (
        db.query(Wallet)
        .filter(Wallet.user_id == user["user_id"])
        .with_for_update()
        .first()
    )
    if not user_wallet or user_wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    user_wallet.balance -= amount

    tx = Transaction(
        wallet_id=user_wallet.id,
        amount=-amount,
        tx_type="SPEND",
        description="Withdrawal to external bank account",
    )
    db.add(tx)
    db.commit()

    return {
        "status": "success",
        "message": "Withdrawal processed successfully",
        "new_balance": user_wallet.balance,
    }


@router.get("/export")
async def export_csv(
    path: str,
    industry: str = "공공",
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token),
):
    path_list = [p for p in path.split("/") if p]
    obj = engine.get_object(db, path_list)
    if not obj:
        raise HTTPException(status_code=404, detail="Farm not found.")

    if obj.get("type") == "Farm":
        parent_id = None
        for i, p in enumerate(path_list[:-1]):
            r = (
                db.query(Region)
                .filter(Region.name == p, Region.parent_id == parent_id)
                .first()
            )
            if r:
                parent_id = r.id
            else:
                break
        farm = (
            db.query(Farm)
            .filter(Farm.name == path_list[-1], Farm.region_id == parent_id)
            .first()
        )
        if (
            farm
            and farm.owner_id != user["user_id"]
            and user["role"] not in ["admin", "guest"]
        ):
            raise HTTPException(
                status_code=403, detail="Not authorized to export this farm's raw data."
            )

    entries = obj.get("data_entries", [])
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Timestamp",
            "Farm Name",
            "Industry",
            "Hash",
            "Scope",
            "Trust Index",
            "Effective Value",
            "Raw Text",
            "Insights",
        ]
    )

    # 1. Existing Real Entries
    for e in entries:
        writer.writerow(
            [
                e.get("timestamp", ""),
                obj["name"],
                industry,
                e.get("hash", ""),
                e.get("scope", ""),
                e.get("trust_index", ""),
                e.get("effective_value", ""),
                e.get("raw_text", "N/A"),
                e.get("insights", ""),
            ]
        )

    import urllib.parse

    output.seek(0)
    filename = f"MDGA_Data_Export_{obj['name']}.csv"
    encoded_filename = urllib.parse.quote(filename)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename*=utf-8''{encoded_filename}"
        },
    )
