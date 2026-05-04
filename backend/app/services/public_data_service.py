import httpx
import asyncio
import json
import random
from typing import Dict, Any, List
from app.services.gemini_ai import model
from app.core.database import SessionLocal, SyntheticData

class PublicDataService:
    def __init__(self):
        # In a real scenario, these would come from env vars
        self.kma_api_key = "MOCK_KMA_KEY"
        self.rda_api_key = "MOCK_RDA_KEY"

    async def fetch_weather_forecast(self, region: str) -> Dict[str, Any]:
        """Fetch short-term and mid-term weather forecast for a region."""
        # MOCK IMPLEMENTATION: Simulating an API call to Korea Meteorological Administration (기상청)
        await asyncio.sleep(0.5)
        # Mock data representing a heatwave or unusual temperature drop
        temp_variance = round(random.uniform(-5.0, 5.0), 1)
        return {
            "source": "기상청",
            "region": region,
            "forecast": {
                "avg_temp": 28.5 + temp_variance,
                "humidity": random.randint(40, 90),
                "anomalies": ["Heatwave Warning"] if temp_variance > 3.0 else []
            }
        }

    async def fetch_crop_data(self, crop_type: str, region: str) -> Dict[str, Any]:
        """Fetch crop yield statistics and soil data."""
        # MOCK IMPLEMENTATION: Simulating an API call to aT / RDA
        await asyncio.sleep(0.5)
        base_yield = 1000  # kg per 10a
        return {
            "source": "농촌진흥청/aT",
            "crop": crop_type,
            "region": region,
            "soil_health_index": round(random.uniform(60.0, 95.0), 1),
            "historical_yield_avg": base_yield,
            "current_market_price": random.randint(3000, 8000) # KRW per kg
        }

    async def generate_synthetic_yield_prediction(self, region: str, crop_type: str) -> Dict[str, Any]:
        """Combine public data and use Gemini to generate Synthetic Data."""
        # 1. Fetch Data
        weather_data = await self.fetch_weather_forecast(region)
        crop_data = await self.fetch_crop_data(crop_type, region)
        
        # 2. Prepare Prompt for Gemini
        prompt = f"""
        당신은 농업 데이터 분석 AI입니다. 다음 공공 데이터를 바탕으로 '{region}'의 '{crop_type}' 작물에 대한 '수확량 변동성 예측 및 합성 데이터(Synthetic Data)'를 생성해주세요.
        출력은 반드시 JSON 형식이어야 합니다.

        [기상청 데이터]
        - 예상 평균 기온: {weather_data['forecast']['avg_temp']}도
        - 습도: {weather_data['forecast']['humidity']}%
        - 특이사항: {', '.join(weather_data['forecast']['anomalies']) if weather_data['forecast']['anomalies'] else '없음'}

        [농촌진흥청/통계청 데이터]
        - 토양 건강 지수: {crop_data['soil_health_index']}/100
        - 과거 평균 수확량 (10a당): {crop_data['historical_yield_avg']}kg
        - 현재 시장 도매가: {crop_data['current_market_price']}원/kg

        다음 구조의 JSON으로만 응답하세요:
        {{
            "predicted_yield_kg": (예상 수확량 숫자),
            "yield_change_percent": (과거 대비 증감율 %),
            "oversupply_risk_level": ("High", "Medium", "Low"),
            "actionable_insight": (농가를 위한 2~3문장 대비책)
        }}
        """

        # 3. Request to Gemini
        try:
            res = model.generate_content(prompt)
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception as e:
            print(f"Gemini parsing error: {e}")
            synthetic_result = {
                "predicted_yield_kg": 950,
                "yield_change_percent": -5.0,
                "oversupply_risk_level": "Medium",
                "actionable_insight": "기온 이상으로 인한 일시적 수확량 감소가 예상됩니다. 관수 시설 점검을 권장합니다."
            }

        # 4. Save to DB (Caching)
        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path=region,
                data_type="yield_prediction",
                raw_sources=[weather_data, crop_data],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(85.0, 98.0), 1)
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result

public_data_service = PublicDataService()
