import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey, Boolean
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

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    name = Column(String, index=True)
    level_type = Column(String) # City, Gu, Dong, Street
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    total_value = Column(Float, default=0.0)
    pulse_rate = Column(Integer, default=70)
    nodes = Column(Integer, default=0)
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    children = relationship("Region", backref="parent", remote_side=[id])
    stores = relationship("Store", back_populates="region")

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    name = Column(String, index=True)
    industry = Column(String)
    total_value = Column(Float, default=0.0)
    pulse_rate = Column(Integer, default=70)
    trust_index = Column(Float, default=50.0)
    history = Column(JSON, default=list)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    region = relationship("Region", back_populates="stores")
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
    effective_value = Column(Float)
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
