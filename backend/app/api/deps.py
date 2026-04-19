from fastapi import Depends, HTTPException, Header

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token")
    token = authorization.split(" ")[1]
    
    # In a real app, verify the JWT token here using python-jose
    if token != "mock-jwt-token":
        raise HTTPException(status_code=403, detail="Forbidden: Invalid token")
        
    return {"user_id": "test_user", "role": "admin"}
