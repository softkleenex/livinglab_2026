from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db, Product, Matching, Farm, DataAPIKey
from app.api.deps import verify_token
from app.services.gemini_ai import client, model_name
from PIL import Image
import io
import json
import asyncio
import traceback
import secrets

router = APIRouter()

@router.post("/apikeys")
async def generate_api_key(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token),
):
    try:
        user_id = user["user_id"]
        # Generate a secure API key
        raw_key = secrets.token_urlsafe(32)
        key_value = f"mdga_{raw_key}"
        
        new_key = DataAPIKey(
            user_id=user_id,
            key_value=key_value,
            status="active"
        )
        db.add(new_key)
        db.commit()
        db.refresh(new_key)
        return {"status": "success", "api_key": key_value, "key_id": new_key.id}
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products")
async def create_product(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    price: int = Form(0),
    stock: int = Form(1),
    region_id: int = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token),
):
    try:
        user_id = user["user_id"]

        # If region_id is not provided, try to get it from the user's first farm
        if not region_id:
            user_farm = db.query(Farm).filter(Farm.owner_id == user_id).first()
            if user_farm:
                region_id = user_farm.region_id

        ai_grade = "A" if category == "synthetic_data" else None
        ai_recommendation = "기후/생육 AI 모델 학습용으로 적합합니다." if category == "synthetic_data" else None
        image_url = None

        if file and file.content_type and file.content_type.startswith("image/"):
            # Mock image url for the sake of the MVP UI (real impl would upload to S3/Drive)
            image_url = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop"
            try:
                file_data = await file.read()
                img = Image.open(io.BytesIO(file_data))
                prompt_parts = [
                    "당신은 B급 농산물 품질 감별 및 매칭 AI입니다.",
                    "제공된 사진의 농산물 품질 상태(A, B, C)와 소상공인(베이커리, 주스바 등)용 추천 매칭처를 분석하세요.",
                    "다음 JSON 구조로 응답하세요:\n{\"ai_grade\": \"B\", \"ai_recommendation\": \"지역 베이커리 잼 원료로 매칭 추천\"}"
                ]
                prompt_parts.append(img)
                
                from google import genai
                from pydantic import BaseModel, Field
                
                class ProductEval(BaseModel):
                    ai_grade: str = Field(description="A, B, C 등급")
                    ai_recommendation: str = Field(description="추천 매칭처 및 사유")
                    
                res = await asyncio.to_thread(
                    client.models.generate_content, 
                    model=model_name, 
                    contents=prompt_parts,
                    config=genai.types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=ProductEval,
                    )
                )
                res_json = json.loads(res.text)
                ai_grade = res_json.get("ai_grade", "B")
                ai_recommendation = res_json.get("ai_recommendation", "가공용 추천")
            except Exception as e:
                print(f"Failed to run AI evaluation: {e}")
                ai_grade = "B"
                ai_recommendation = "비전 분석 보류 (기본 가공용 추천)"

        new_product = Product(
            seller_id=user_id,
            region_id=region_id,
            category=category,
            title=title,
            description=description,
            price=price,
            stock=stock,
            image_url=image_url,
            ai_grade=ai_grade,
            ai_recommendation=ai_recommendation,
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return {"status": "success", "product_id": new_product.id, "ai_grade": ai_grade, "ai_recommendation": ai_recommendation}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products")
async def list_products(category: str = Query(None), db: Session = Depends(get_db)):
    try:
        query = db.query(Product).filter(Product.status == "available")
        if category:
            query = query.filter(Product.category == category)

        products = query.order_by(Product.created_at.desc()).all()
        return {
            "status": "success",
            "products": [
                {
                    "id": p.id,
                    "category": p.category,
                    "title": p.title,
                    "price": p.price,
                    "stock": p.stock,
                    "ai_grade": p.ai_grade,
                    "ai_recommendation": p.ai_recommendation,
                }
                for p in products
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/matchings")
async def create_matching(
    product_id: int,
    quantity: int = 1,
    message: str = "",
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token),
):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or product.stock < quantity:
            raise HTTPException(
                status_code=400, detail="Product unavailable or insufficient stock."
            )

        new_match = Matching(
            product_id=product_id,
            buyer_id=user["user_id"],
            quantity=quantity,
            message=message,
        )
        db.add(new_match)

        # Deduct stock
        product.stock -= quantity
        if product.stock <= 0:
            product.status = "matched"

        db.commit()
        return {"status": "success", "matching_id": new_match.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
