from fastapi import Depends, HTTPException, Header
from app.core.database import SessionLocal, User, Wallet

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    if token == "mock-jwt-token":
        email = "test@mdga.io"
    else:
        email = token
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, name=email.split('@')[0], role="store")
            db.add(user)
            db.commit()
            db.refresh(user)
            
            wallet = Wallet(user_id=user.id, balance=0.0)
            db.add(wallet)
            db.commit()
            
        return {"user_id": user.id, "email": user.email, "role": user.role}
    finally:
        db.close()

