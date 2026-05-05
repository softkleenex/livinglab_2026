import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime, timezone
from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {},
    pool_size=20 if "sqlite" not in SQLALCHEMY_DATABASE_URL else 5,
    max_overflow=50 if "sqlite" not in SQLALCHEMY_DATABASE_URL else 10,
    pool_pre_ping=True if "sqlite" not in SQLALCHEMY_DATABASE_URL else False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String, nullable=True)
    role = Column(String, default="farm") # 'farm', 'gov', 'leader', 'guest'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    farms = relationship("Farm", back_populates="owner")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    products = relationship("Product", back_populates="seller")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    balance = Column(Integer, default=0)
    
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), index=True)
    amount = Column(Integer)
    tx_type = Column(String, index=True) # 'EARN', 'SPEND'
    description = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    wallet = relationship("Wallet", back_populates="transactions")

class Region(Base):
    __tablename__ = "regions"
    __table_args__ = (UniqueConstraint('name', 'parent_id', name='uix_region_name_parent'),)
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("regions.id"), nullable=True, index=True)
    name = Column(String, index=True)
    level_type = Column(String) # City, Gu, Dong, Street
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    total_value = Column(Integer, default=0)
    pulse_rate = Column(Integer, default=70)
    nodes = Column(Integer, default=0)
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    children = relationship("Region", backref="parent", remote_side=[id])
    farms = relationship("Farm", back_populates="region")
    products = relationship("Product", back_populates="region")

class Farm(Base):
    __tablename__ = "farms"
    __table_args__ = (UniqueConstraint('name', 'region_id', name='uix_farm_name_region'),)
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String, index=True)
    industry = Column(String, index=True)
    total_value = Column(Integer, default=0)
    pulse_rate = Column(Integer, default=70)
    trust_index = Column(Float, default=50.0)
    history = Column(JSON, default=list)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    region = relationship("Region", back_populates="farms")
    owner = relationship("User", back_populates="farms")
    entries = relationship("DataEntry", back_populates="farm", cascade="all, delete-orphan")

class DataEntry(Base):
    __tablename__ = "data_entries"

    id = Column(Integer, primary_key=True, index=True)
    location_path = Column(String, index=True) 
    store_id = Column(Integer, ForeignKey("farms.id"), index=True)
    industry = Column(String, index=True)
    is_guest = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    drive_link = Column(String, nullable=True)
    insights = Column(Text)
    trust_index = Column(Float)
    effective_value = Column(Integer)
    hash_val = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    farm = relationship("Farm", back_populates="entries")

# Phase 2 New Models

class Product(Base):
    """AI 합성 데이터, 농기계 로그, 생육 데이터 등 거래/매칭 대상"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), index=True)
    category = Column(String, index=True) # 'synthetic_data', 'machinery', 'raw_data', 'co-purchase'
    title = Column(String)
    description = Column(Text)
    price = Column(Integer, default=0)
    stock = Column(Integer, default=1)
    status = Column(String, default="available") # 'available', 'matched', 'completed'
    image_url = Column(String, nullable=True)
    ai_grade = Column(String, nullable=True) # A, B, C 등급 (비전 모델 분석 결과)
    ai_recommendation = Column(String, nullable=True) # 용도 추천 (예: 잼 가공용)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    seller = relationship("User", back_populates="products")
    region = relationship("Region", back_populates="products")
    matchings = relationship("Matching", back_populates="product")

class Matching(Base):
    """공동구매, 대여, 수거 등 B2B 트랜잭션 기록"""
    __tablename__ = "matchings"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), index=True)
    quantity = Column(Integer, default=1)
    status = Column(String, default="pending") # 'pending', 'accepted', 'rejected', 'completed'
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    product = relationship("Product", back_populates="matchings")

class SyntheticData(Base):
    """백엔드 배치 작업으로 생성된 기상-수확량-가격 융합 데이터 캐싱"""
    __tablename__ = "synthetic_data"
    
    id = Column(Integer, primary_key=True, index=True)
    region_path = Column(String, index=True) # ex: "대구광역시/북구"
    data_type = Column(String, index=True) # 'yield_prediction', 'oversupply_risk', 'heat_stress'
    raw_sources = Column(JSON, default=list) # e.g., [{"source": "기상청", "type": "단기예보"}]
    synthetic_result = Column(JSON) # AI가 생성한 최종 결과물 (JSON 형태)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
