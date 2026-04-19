import os
import json
import google.generativeai as genai
import typing_extensions as typing

class ChatActionResponse(typing.TypedDict):
    action_type: str
    target_hash: str
    new_text: str

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

intent_prompt = """
당신은 텍스트 파서입니다.
사용자의 질문: "방금 올린 이 데이터를 삭제해줘."
선택된 해시 목록: ['ed5ab387']

지시사항:
- 삭제 요구 시 action_type="DELETE", target_hash 기입
- 질문이나 일반 대화 시 action_type="NONE"
"""

res = model.generate_content(
    intent_prompt,
    generation_config=genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=ChatActionResponse
    )
)
print(res.text)
