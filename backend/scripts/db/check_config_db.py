import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres"):
    print("Using PostgreSQL")
elif db_url.startswith("sqlite"):
    print("Using SQLite")
else:
    print(f"Unknown DB URL protocol: {db_url.split(':')[0]}")
