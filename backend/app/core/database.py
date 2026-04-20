import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mdga_local.db")

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String, nullable=True)
    role = Column(String, default="store") # 'store', 'gov', 'leader', 'guest'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    stores = relationship("Store", back_populates="owner")
    wallet = relationship("Wallet", back_populates="user", uselist=False)

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Integer, default=0)
    
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    amount = Column(Integer)
    tx_type = Column(String) # 'EARN', 'SPEND'
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    wallet = relationship("Wallet", back_populates="transactions")

class Region(Base):
    __tablename__ = "regions"
    __table_args__ = (UniqueConstraint('name', 'parent_id', name='uix_region_name_parent'),)
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    name = Column(String, index=True)
    level_type = Column(String) # City, Gu, Dong, Street
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    total_value = Column(Integer, default=0)
    pulse_rate = Column(Integer, default=70)
    nodes = Column(Integer, default=0)
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    children = relationship("Region", backref="parent", remote_side=[id])
    stores = relationship("Store", back_populates="region")

class Store(Base):
    __tablename__ = "stores"
    __table_args__ = (UniqueConstraint('name', 'region_id', name='uix_store_name_region'),)
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True)
    industry = Column(String)
    total_value = Column(Integer, default=0)
    pulse_rate = Column(Integer, default=70)
    trust_index = Column(Float, default=50.0)
    history = Column(JSON, default=list)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    region = relationship("Region", back_populates="stores")
    owner = relationship("User", back_populates="stores")
    entries = relationship("DataEntry", back_populates="store", cascade="all, delete-orphan")

class DataEntry(Base):
    __tablename__ = "data_entries"

    id = Column(Integer, primary_key=True, index=True)
    location_path = Column(String, index=True) 
    store_id = Column(Integer, ForeignKey("stores.id"))
    industry = Column(String, index=True)
    is_guest = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    drive_link = Column(String, nullable=True)
    insights = Column(Text)
    trust_index = Column(Float)
    effective_value = Column(Integer)
    hash_val = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    store = relationship("Store", back_populates="entries")
    
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
