import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'))

from app.core.database import engine
from sqlalchemy import text

def test_conn():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("Successfully connected to the database!")
            return 0
    except Exception as e:
        print(f"Database connection failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(test_conn())
