import json
import urllib.request
import urllib.parse
import ssl
import time
import sys
import os

# Add current dir to path to import seed_data properly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seed_data import get_massive_data, generate_sensor_json

context = ssl._create_unverified_context()

massive_data = get_massive_data()

print(
    f"Starting Mass Ingestion to Live Server (DB + Drive)... ({len(massive_data)} Nodes)"
)

for item in massive_data:
    state = item.get("state", "대구광역시")
    if len(item["region"]) == 0:
        path_str = f"{state}/{item['name']}"
    else:
        path_str = f"{state}/" + "/".join(item["region"]) + "/" + item["name"]

    industry = item["industry"]

    # 1. Onboard
    onboard_data = json.dumps(
        {"role": "farm", "industry": industry, "location": path_str.split("/")}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://mdga-api.onrender.com/api/v1/hierarchy/user/context",
        data=onboard_data,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, context=context)
    except Exception as e:
        print("Onboard Warning:", e)

    # 2. Ingest
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    sensor_json = generate_sensor_json(item.get("type", "smartfarm"))
    full_insight = (
        f"{item['insight']}\n\n[실시간 센서 및 공공데이터 오버레이]\n{sensor_json}"
    )

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="raw_text"\r\n\r\n'
        f"[초기 시드 데이터] {full_insight}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="location"\r\n\r\n'
        f"{path_str}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="industry"\r\n\r\n'
        f"{industry}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="is_guest"\r\n\r\n'
        f"false\r\n"
        f"--{boundary}--\r\n"
    )

    req_ingest = urllib.request.Request(
        "https://mdga-api.onrender.com/api/v1/ingest", data=body.encode("utf-8")
    )
    req_ingest.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    try:
        urllib.request.urlopen(req_ingest, context=context)
        print(f"✅ Successfully ingested: {path_str}")
    except Exception as e:
        print(f"❌ Failed to ingest {path_str}: {e}")

    time.sleep(1)  # Prevent rate limiting

print("Done Seeding Production!")
