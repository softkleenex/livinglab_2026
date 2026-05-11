import os
from dotenv import dotenv_values

env_dict = dotenv_values("backend/.env")
db_url = env_dict.get("DATABASE_URL", "None")
print(f"backend/.env DATABASE_URL starts with: {db_url.split(':')[0]}")

root_env_dict = dotenv_values(".env")
root_db_url = root_env_dict.get("DATABASE_URL", "None")
print(f".env DATABASE_URL starts with: {root_db_url.split(':')[0]}")
