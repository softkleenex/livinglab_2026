import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_api_key():
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"🔍 현재 로드된 키: {api_key[:10]}...")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("안녕, 너는 지금 정상 작동 중이니? 아주 짧게 대답해줘.")
        print(f"✅ [테스트 성공] AI 응답: {response.text}")
    except Exception as e:
        print(f"❌ [테스트 실패] 에러 원인: {str(e)}")

if __name__ == "__main__":
    test_api_key()
