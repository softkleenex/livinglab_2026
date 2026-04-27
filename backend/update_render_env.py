import json
import urllib.request
import ssl

API_KEY = "rnd_PYHB2Xs7OAd9HVGIxeiGIjn7K7mi"
SERVICE_ID = "srv-d7ae8obuibrs739nql5g"
URL = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(URL, headers={
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}"
})

with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode())

new_env_vars = []
for item in data:
    env_var = item["envVar"]
    if env_var["key"] == "GEMINI_API_KEY":
        env_var["value"] = "AIzaSyC5bW7Q5S8taBwsD75UWBPmIJIXEq5UuWA"
    # Convert 'key' to 'name' as required by Render's PUT endpoint? No, the documentation says to pass it as it came, let's keep it but check if Render requires 'key' or 'name' for PUT. Usually 'key' works. Actually, Render PUT uses envVars with 'key' and 'value'
    new_env_vars.append(env_var)

put_req = urllib.request.Request(URL, data=json.dumps(new_env_vars).encode("utf-8"), headers={
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}, method="PUT")

try:
    with urllib.request.urlopen(put_req, context=ctx) as put_response:
        print("Success:", put_response.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.read().decode())
