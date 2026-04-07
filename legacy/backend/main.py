from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import datetime
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI(title="MDGA API", description="Universal AI-Data Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 실시간 공공 API 연동 (환각 방지용)
def get_realtime_weather():
    try:
        # 대구광역시 중심부 위경도 기준 Open-Meteo 무료 API
        url = "https://api.open-meteo.com/v1/forecast?latitude=35.8703&longitude=128.6014&current_weather=true"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            current = data.get("current_weather", {})
            temp = current.get("temperature")
            weather_code = current.get("weathercode")
            weather_desc = "맑음/구름조금" if weather_code in [0,1,2,3] else "비/눈/흐림(날씨 영향 고려 필요)"
            return f"대구 실시간 기온: {temp}℃, 상태: {weather_desc}"
    except Exception as e:
        return "날씨 정보 조회 불가"

def get_industry_news(industry):
    try:
        # Google News RSS를 활용한 무료 실시간 산업 동향 검색
        query = urllib.parse.quote(f"{industry} 트렌드 대구")
        url = f"https://news.google.com/rss/search?q={query}&hl=ko&gl=KR&ceid=KR:ko"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            items = root.findall('.//item')
            headlines = [item.find('title').text for item in items[:3]]
            if not headlines:
                return "최근 검색된 주요 지역 뉴스가 없습니다."
            return "\n".join([f"- {h}" for h in headlines])
    except Exception as e:
        return "실시간 뉴스 동향 조회 불가"

# In-memory DB for prototype
community_data_store = [
    {
        "id": 1,
        "type": "public",
        "industry": "공공 데이터 (대구 전체)",
        "timestamp": "2026-04-01T10:00:00",
        "raw_data": {"region": "대구광역시", "population_trend": "감소 추세", "main_industry": "자동차 부품, 섬유, 의료", "support_fund": "200억 편성"},
        "insights": "지역 인구 감소에 대응하여 자동화 및 AI 도입을 통한 생산성 향상이 필수적입니다. 또한, 지자체 지원금(200억)을 활용한 R&D 투자를 적극 고려해야 합니다."
    }
]

class DataSubmission(BaseModel):
    industry: str
    raw_data: dict

@app.get("/")
def read_root():
    return {"message": "Welcome to MDGA API"}

@app.get("/api/submissions")
def get_submissions():
    return sorted(community_data_store, key=lambda x: x["id"], reverse=True)

@app.post("/api/analyze")
def analyze_data(submission: DataSubmission):
    # 실제 공공/외부 API 데이터 페치
    weather_info = get_realtime_weather()
    news_info = get_industry_news(submission.industry)
    
    prompt = f"""
    당신은 {submission.industry} 분야의 수석 비즈니스 분석가이자 컨설턴트입니다.
    
    [실시간 외부 데이터 (환각 방지용 실제 API 수집 데이터)]
    - 현재 대구 날씨: {weather_info}
    - 최근 관련 뉴스 동향:
    {news_info}
    
    [지역 소상공인이 입력한 원본 영업 데이터]
    {submission.raw_data}
    
    위 데이터를 모두 종합하여:
    1. 현재 영업 상황과 외부 요인(날씨, 뉴스 트렌드)의 연관성 분석
    2. 당장 내일 실행 가능한 가장 효과적인 개선 방안 3가지 (Actionable Insights)
    
    답변은 모바일에서 읽기 편하게 간결하고 명확한 한국어로 작성해주세요.
    """
    
    try:
        if not os.environ.get("GEMINI_API_KEY"):
            analysis = "⚠️ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다."
        else:
            response = model.generate_content(prompt)
            analysis = response.text
    except Exception as e:
        analysis = f"Error generating analysis: {str(e)}"
        
    # Save to community store
    new_entry = {
        "id": len(community_data_store) + 1,
        "type": "user",
        "industry": submission.industry,
        "timestamp": datetime.datetime.now().isoformat(),
        "raw_data": submission.raw_data,
        "insights": analysis
    }
    community_data_store.append(new_entry)
        
    return {
        "status": "success",
        "raw_data": submission.raw_data,
        "public_data_used": {"weather": weather_info, "news": news_info},
        "processed_data": {
            "insights": analysis
        }
    }
