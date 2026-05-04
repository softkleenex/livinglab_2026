from sqlalchemy import create_engine, text

DB_URL = "postgresql://postgres.nwtnczpvczppajomtbiy:Xhdtls12!%40%23@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

engine = create_engine(DB_URL, pool_pre_ping=True)
with engine.connect() as conn:
    res = conn.execute(text("SELECT count(*) FROM regions;"))
    for row in res:
        print("Total regions in DB:", row[0])
    res = conn.execute(text("SELECT count(*) FROM stores;"))
    for row in res:
        print("Total stores in DB:", row[0])
