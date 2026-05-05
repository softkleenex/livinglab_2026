from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, Product, Matching
import traceback

router = APIRouter()

@router.post("/products")
async def create_product(
    title: str,
    category: str,
    description: str,
    price: int = 0,
    stock: int = 1,
    db: Session = Depends(get_db)
    # In a real scenario, seller_id and region_id would come from auth context
):
    try:
        # Mocking seller and region for now (id 1)
        new_product = Product(
            seller_id=1, 
            region_id=1,
            category=category,
            title=title,
            description=description,
            price=price,
            stock=stock,
            ai_grade="A" if category == "synthetic_data" else None,
            ai_recommendation="기후/생육 AI 모델 학습용으로 적합합니다." if category == "synthetic_data" else None
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return {"status": "success", "product_id": new_product.id}
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
                    "ai_recommendation": p.ai_recommendation
                } for p in products
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/matchings")
async def create_matching(product_id: int, quantity: int = 1, message: str = "", db: Session = Depends(get_db)):
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or product.stock < quantity:
            raise HTTPException(status_code=400, detail="Product unavailable or insufficient stock.")
            
        new_match = Matching(
            product_id=product_id,
            buyer_id=1, # Mock buyer
            quantity=quantity,
            message=message
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
