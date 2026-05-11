import os
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'))

db_url = os.environ.get("DATABASE_URL", "")
if db_url.startswith("postgres"):
    print("Using PostgreSQL")
elif db_url.startswith("sqlite"):
    print("Using SQLite")
else:
    print(f"Unknown DB URL protocol: {db_url.split(':')[0]}")
