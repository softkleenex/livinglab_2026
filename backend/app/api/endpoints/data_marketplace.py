from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, SyntheticData, DataEntry
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
import traceback

router = APIRouter()

# Mock API Key for External B2B Consumers (e.g., Snowflake, Databricks, AI Hub)
VALID_API_KEYS = ["mdga-b2b-snowflake-key", "mdga-b2b-aihub-key"]

def verify_b2b_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid B2B API Key")
    return x_api_key

@router.get("/export/synthetic-yield")
async def export_synthetic_yield_data(
    region: str = Query(None, description="Filter by region prefix"),
    limit: int = Query(100, description="Max rows to return"),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_b2b_api_key)
):
    """
    [Phase 4 Commercial Data Hub Integration]
    Export generated Synthetic Data (Yield, Climate) as a CSV feed for external Data Marketplaces.
    """
    try:
        query = db.query(SyntheticData).filter(SyntheticData.data_type == "yield_prediction")
        if region:
            query = query.filter(SyntheticData.region_path.like(f"{region}%"))
            
        results = query.order_by(SyntheticData.created_at.desc()).limit(limit).all()
        
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "region_path", "data_type", "synthetic_result", "confidence_score", "created_at"])
        
        for r in results:
            writer.writerow([r.id, r.region_path, r.data_type, r.synthetic_result, r.confidence_score, r.created_at.isoformat()])
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]), 
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=mdga_synthetic_yield_export.csv"}
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/ai-ready-vision")
async def export_ai_ready_vision_data(
    industry: str = Query(None, description="Filter by industry"),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_b2b_api_key)
):
    """
    [Phase 4 Commercial Data Hub Integration]
    Export AI-Ready processed vision/text JSON logs (e.g. for AI Hub Labeling).
    """
    try:
        query = db.query(DataEntry).filter(DataEntry.drive_link.isnot(None)) # Assuming items with drive_links have images/vision context
        if industry:
            query = query.filter(DataEntry.industry == industry)
            
        results = query.order_by(DataEntry.timestamp.desc()).limit(limit).all()
        
        # Return as JSON lines (common for big data tools like Databricks)
        jsonl_output = []
        for r in results:
            import json
            row = {
                "id": r.id,
                "location_path": r.location_path,
                "industry": r.industry,
                "raw_text": r.raw_text,
                "insights": r.insights,
                "drive_link": r.drive_link,
                "trust_index": r.trust_index,
                "timestamp": r.timestamp.isoformat() if hasattr(r.timestamp, 'isoformat') else r.timestamp
            }
            jsonl_output.append(json.dumps(row, ensure_ascii=False))
            
        return StreamingResponse(
            iter(["\n".join(jsonl_output)]), 
            media_type="application/jsonl",
            headers={"Content-Disposition": "attachment; filename=mdga_ai_ready_vision_logs.jsonl"}
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
