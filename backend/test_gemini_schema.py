import os
import json
from google import genai
from google.genai import types

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

res = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="테스트 데이터입니다. 온도 25도, 습도 60%. 다음 형식의 JSON으로 응답해 주세요: {\"insights\": \"간단한 인사이트 문자열\", \"ai_ready_data\": {\"temp\": 25, \"humidity\": 60}}",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
    )
)

print(res.text)
