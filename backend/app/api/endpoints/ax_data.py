from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, SyntheticData
from app.services.public_data_service import public_data_service
import traceback

router = APIRouter()

@router.get("/yield-prediction")
async def get_yield_prediction(
    region: str = Query(..., description="Target region (e.g. 대구광역시 북구)"),
    crop: str = Query(..., description="Target crop (e.g. 사과)")
):
    try:
        # Generate new synthetic prediction
        result = await public_data_service.generate_synthetic_yield_prediction(region, crop)
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crop-simulator")
async def get_crop_simulator(
    region: str = Query(..., description="Target region"),
    crop: str = Query(..., description="Target crop")
):
    try:
        result = await public_data_service.generate_crop_simulator(region, crop)
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/oversupply-risk")
async def get_oversupply_risk(
    crop: str = Query(..., description="Target crop")
):
    try:
        result = await public_data_service.generate_oversupply_risk(crop)
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/livestock-alert")
async def get_livestock_alert(
    region: str = Query(..., description="Target region"),
    livestock_type: str = Query(..., description="Livestock type (e.g. 한우, 돼지)")
):
    try:
        result = await public_data_service.generate_livestock_alert(region, livestock_type)
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resource-efficiency")
async def get_resource_efficiency(
    region: str = Query(..., description="Target region"),
    crop: str = Query(..., description="Target crop")
):
    try:
        result = await public_data_service.generate_resource_efficiency(region, crop)
        return {"status": "success", "data": result}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_synthetic_data_history(
    region: str = Query(None),
    data_type: str = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch cached synthetic data from the DB"""
    query = db.query(SyntheticData)
    if region:
        query = query.filter(SyntheticData.region_path.like(f"{region}%"))
    if data_type:
        query = query.filter(SyntheticData.data_type == data_type)
        
    results = query.order_by(SyntheticData.created_at.desc()).limit(20).all()
    
    return {
        "status": "success", 
        "history": [
            {
                "id": r.id, 
                "region": r.region_path, 
                "type": r.data_type, 
                "result": r.synthetic_result,
                "confidence": r.confidence_score,
                "created_at": r.created_at
            } for r in results
        ]
    }
