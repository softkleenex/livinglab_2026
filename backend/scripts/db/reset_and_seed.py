import os
import ssl
import time
import requests
from dotenv import load_dotenv
from PIL import Image

# Import shared massive data generation
from seed_data import get_massive_data, generate_sensor_json

load_dotenv("backend/.env")

context = ssl._create_unverified_context()
requests.packages.urllib3.disable_warnings()

API_URL = os.environ.get("API_URL", "http://localhost:8000")
HEADERS = {"Authorization": "Bearer mdga-admin-seed-2026"}

print("==================================================")
print("🚀 MASSIVE B2B ENTERPRISE DATA SEEDING (50+ NODES) 🚀")
print("==================================================")

# 1. Reset Schema
print("\n[1/3] Resetting Production Database Schema...")
try:
    res = requests.post(f"{API_URL}/api/v1/reset_schema", headers=HEADERS, verify=False)
    print("  -> Schema Reset Successfully:", res.text)
except Exception as e:
    print("  -> Failed to reset schema:", e)

# 2. Dummy Image Generation
dummy_img_path = "seed_dummy.png"
img = Image.new("RGB", (200, 200), color=(45, 60, 80))
img.save(dummy_img_path)

# 3. Procedural Data Generation
print("\n[2/3] Generating Massive Realistic Datasets...")
massive_data = get_massive_data()
print(f"Generated {len(massive_data)} realistic B2B/Public entries.")

print("\n[3/3] Ingesting Data into Supabase & Google Drive Data Lake...")
success_count = 0
for idx, item in enumerate(massive_data):
    state = item.get("state", "대구광역시")
    if len(item["region"]) == 0:
        path_str = f"{state}/{item['name']}"
    else:
        path_str = f"{state}/" + "/".join(item["region"]) + "/" + item["name"]

    industry = item["industry"]
    sensor_json = generate_sensor_json(item.get("type", "smartfarm"))
    full_insight = (
        f"{item['insight']}\n\n[실시간 센서 및 공공데이터 오버레이]\n{sensor_json}"
    )

    try:
        # Pre-create context
        requests.post(
            f"{API_URL}/api/v1/user/context",
            json={
                "role": "farm",
                "industry": industry,
                "location": path_str.split("/"),
            },
            headers=HEADERS,
            verify=False,
        )
    except Exception:
        pass

    with open(dummy_img_path, "rb") as f:
        files = {"file": (f"evidence_{idx}.png", f, "image/png")}
        data = {
            "raw_text": full_insight,
            "location": path_str,
            "industry": industry,
            "is_guest": "false",
        }
        try:
            res = requests.post(
                f"{API_URL}/api/v1/ingest",
                data=data,
                files=files,
                headers=HEADERS,
                verify=False,
            )
            if res.status_code == 200:
                print(f"  [{idx + 1}/{len(massive_data)}] ✅ {path_str}")
                success_count += 1
            else:
                print(
                    f"  [{idx + 1}/{len(massive_data)}] ❌ Failed: {item['name']} ({res.text})"
                )
        except Exception as e:
            print(f"  [{idx + 1}/{len(massive_data)}] ❌ Error: {item['name']} ({e})")

    time.sleep(0.5)  # Slight delay to avoid massive rate limits if any

if os.path.exists(dummy_img_path):
    os.remove(dummy_img_path)

print("\n==================================================")
print(f"🎉 MASSIVE SEEDING COMPLETE! ({success_count}/{len(massive_data)} Success) 🎉")
print("==================================================")
