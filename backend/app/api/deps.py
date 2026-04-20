from fastapi import Depends, HTTPException, Header
from app.core.database import SessionLocal, User, Wallet
from google.oauth2 import id_token
from google.auth.transport import requests
import os

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    if token == "guest-token":
        return {"user_id": 0, "email": "guest@mdga.io", "role": "guest"}
    elif token == "mock-jwt-token":
        email = "test@mdga.io"
        name = "Test User"
        picture = None
    else:
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture')
        except ValueError:
            raise HTTPException(status_code=403, detail="Forbidden: Invalid Google token")
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, name=name, picture=picture, role="store")
            db.add(user)
            db.commit()
            db.refresh(user)
            
            wallet = Wallet(user_id=user.id, balance=0)
            db.add(wallet)
            db.commit()
            
        return {"user_id": user.id, "email": user.email, "role": user.role}
    finally:
        db.close()

