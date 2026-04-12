import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# Read DATABASE_URL from environment (e.g., from Render)
# Fallback to local SQLite if not provided
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mdga_local.db")

# Render uses 'postgres://' but SQLAlchemy 1.4+ requires 'postgresql://'
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DataEntry(Base):
    __tablename__ = "data_entries"

    id = Column(Integer, primary_key=True, index=True)
    location_path = Column(String, index=True)
    industry = Column(String, index=True)
    is_guest = Column(Integer, default=0) # 0 or 1
    raw_text = Column(Text, nullable=True)
    drive_link = Column(String, nullable=True)
    insights = Column(Text)
    trust_index = Column(Float)
    effective_value = Column(Float)
    hash_val = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
