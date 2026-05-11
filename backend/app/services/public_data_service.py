import httpx
import asyncio
import json
import random
import os
from typing import Dict, Any
from app.services.gemini_ai import client, model_name
from app.core.database import SessionLocal, SyntheticData


class PublicDataService:
    def __init__(self):
        self.kma_api_key = os.getenv("KMA_API_KEY", "")
        self.rda_api_key = os.getenv("RDA_API_KEY", "")

    async def fetch_weather_forecast(self, region: str) -> Dict[str, Any]:
        """Fetch short-term and mid-term weather forecast for a region."""
        # Simulated actual API call to Korea Meteorological Administration (기상청) or NOAA
        await asyncio.sleep(0.5)
        # Data representing a heatwave or unusual temperature drop
        temp_variance = round(random.uniform(-5.0, 5.0), 1)
        return {
            "source": "기상청",
            "region": region,
            "forecast": {
                "avg_temp": 28.5 + temp_variance,
                "humidity": random.randint(40, 90),
                "anomalies": ["Heatwave Warning"] if temp_variance > 3.0 else [],
            },
        }

    async def fetch_crop_data(self, crop_type: str, region: str) -> Dict[str, Any]:
        """Fetch crop yield statistics and soil data."""
        # Simulated actual API call to aT (한국농수산식품유통공사) or RDA (농촌진흥청)
        await asyncio.sleep(0.5)
        
        base_yield = 1000  # kg per 10a
        return {
            "source": "농촌진흥청 / aT 도매시장",
            "crop": crop_type,
            "region": region,
            "soil_health_index": round(random.uniform(60.0, 95.0), 1),
            "historical_yield_avg": base_yield,
            "current_market_price": random.randint(3000, 8000),  # KRW per kg
            "insight": f"지역 내 {crop_type} 생육 적합도 양호"
        }

    async def generate_synthetic_yield_prediction(
        self, region: str, crop_type: str
    ) -> Dict[str, Any]:
        """Combine public data and use Gemini to generate Synthetic Data."""
        # 1. Fetch Data
        weather_data = await self.fetch_weather_forecast(region)
        crop_data = await self.fetch_crop_data(crop_type, region)

        # Calculate THI
        t = weather_data["forecast"]["avg_temp"]
        h = weather_data["forecast"]["humidity"]
        thi = (0.81 * t) + (0.01 * h * ((0.99 * t) - 14.3)) + 46.3

        # Calculate Climate Stress Factor and Yield Change
        crop_thresholds = {"딸기": 28, "토마토": 30, "사과": 32, "쌀": 33}
        threshold = crop_thresholds.get(crop_type, 28)  # default to 28
        climate_stress_factor = max(0.0, min(1.0, (t - threshold) * 0.05)) if t > threshold else 0.0
        calculated_yield = int(crop_data["historical_yield_avg"] * (1 - climate_stress_factor))
        calculated_change_percent = -round(climate_stress_factor * 100, 1)

        # 2. Prepare Prompt for Gemini
        prompt = f"""
        당신은 농업 데이터 분석 AI입니다. 다음 공공 데이터를 바탕으로 '{region}'의 '{crop_type}' 작물에 대한 '수확량 변동성 예측 및 합성 데이터(Synthetic Data)'를 생성해주세요.
        출력은 반드시 JSON 형식이어야 합니다.

        [기상청 데이터]
        - 예상 평균 기온: {t}도
        - 습도: {h}%
        - 산출된 THI(온습도지수): {round(thi, 1)}
        - 특이사항: {", ".join(weather_data["forecast"]["anomalies"]) if weather_data["forecast"]["anomalies"] else "없음"}

        [농촌진흥청 / aT 데이터]
        - 토양 건강 지수: {crop_data["soil_health_index"]}/100
        - 과거 평균 수확량 (10a당): {crop_data["historical_yield_avg"]}kg
        - 현재 시장 도매가: {crop_data["current_market_price"]}원/kg
        - 생육 인사이트: {crop_data.get("insight", "없음")}

        [시뮬레이션 엔진 사전 계산 결과]
        - 예상 수확량: {calculated_yield}kg
        - 과거 대비 증감율: {calculated_change_percent}%

        다음 구조의 JSON으로만 응답하세요:
        {{
            "predicted_yield_kg": {calculated_yield},
            "yield_change_percent": {calculated_change_percent},
            "oversupply_risk_level": ("High", "Medium", "Low"),
            "actionable_insight": (농가를 위한 2~3문장 대비책)
        }}
        """

        # 3. Request to Gemini
        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception as e:
            print(f"Gemini parsing error: {e}")
            synthetic_result = {
                "predicted_yield_kg": 950,
                "yield_change_percent": -5.0,
                "oversupply_risk_level": "Medium",
                "actionable_insight": "기온 이상으로 인한 일시적 수확량 감소가 예상됩니다. 관수 시설 점검을 권장합니다.",
            }

        # 4. Save to DB (Caching)
        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path=region,
                data_type="yield_prediction",
                raw_sources=[weather_data, crop_data],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(85.0, 98.0), 1),
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result

    async def generate_crop_simulator(
        self, region: str, current_crop: str
    ) -> Dict[str, Any]:
        """A-2: Future climate crop simulator."""
        await asyncio.sleep(0.5)
        # 1. Fetch Climate Scenario Data
        climate_scenario = {
            "scenario": "RCP 8.5",
            "temp_increase": round(random.uniform(1.5, 3.5), 1),
            "precipitation_change": f"{random.choice(['+', '-'])}{random.randint(5, 20)}%",
        }

        # 2. Prepare Prompt
        prompt = f"""
        당신은 농업 데이터 분석 AI입니다. 기후 변화 시나리오를 바탕으로 '{region}'의 현재 작물 '{current_crop}'에 대한 '미래 기후 대응형 재배 적지(適地) 시뮬레이션' 결과를 JSON으로 출력하세요.
        [기후 변화 시나리오 (기상청)]
        - 적용 시나리오: {climate_scenario["scenario"]}
        - 기온 상승: {climate_scenario["temp_increase"]}도
        - 강수량 변화: {climate_scenario["precipitation_change"]}

        다음 구조의 JSON으로만 응답하세요:
        {{
            "survival_rate_10yr": (10년 후 현재 작물 생존율 %),
            "recommended_alternative_crop": (대체 아열대 작물 추천),
            "expected_productivity_index": (100점 만점 생산성 지수),
            "actionable_insight": (농가를 위한 2~3문장 대비책)
        }}
        """

        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception:
            synthetic_result = {
                "survival_rate_10yr": random.randint(40, 80),
                "recommended_alternative_crop": "한라봉 또는 무화과",
                "expected_productivity_index": random.randint(60, 85),
                "actionable_insight": f"기온 {climate_scenario['temp_increase']}도 상승 예상. 아열대 작물 전환 검토 요망.",
            }

        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path=region,
                data_type="crop_simulator",
                raw_sources=[climate_scenario],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(80.0, 95.0), 1),
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result

    async def generate_oversupply_risk(self, crop: str) -> Dict[str, Any]:
        """A-3: Oversupply Risk Index."""
        await asyncio.sleep(0.5)
        market_data = {
            "current_price": random.randint(1000, 5000),
            "cultivation_area_trend": f"{random.choice(['+', '-'])}{random.randint(5, 25)}%",
        }

        prompt = f"""
        당신은 농업 경제 분석 AI입니다. '{crop}' 작물에 대한 '수급 불균형 위험 지표(Oversupply Risk Index)' 결과를 JSON으로 출력하세요.
        [aT 및 통계청 데이터]
        - 현재 도매가: {market_data["current_price"]}원
        - 재배 면적 증감 추이: {market_data["cultivation_area_trend"]}

        다음 구조의 JSON으로만 응답하세요:
        {{
            "risk_index": (0~100 사이 위험 지수),
            "risk_level": ("고위험", "주의", "안전"),
            "expected_price_drop_percent": (예상 가격 하락폭 %),
            "actionable_insight": (농가 및 지자체 대비책)
        }}
        """

        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception:
            synthetic_result = {
                "risk_index": random.randint(60, 95),
                "risk_level": random.choice(["고위험", "주의", "안전"]),
                "expected_price_drop_percent": random.randint(5, 30),
                "actionable_insight": "재배 면적 변동 추이에 따른 수급 불균형이 우려됩니다. 가공식품 전환 등의 대비가 필요합니다.",
            }

        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path="전국",
                data_type="oversupply_risk",
                raw_sources=[market_data],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(85.0, 98.0), 1),
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result

    async def generate_livestock_alert(
        self, region: str, livestock_type: str
    ) -> Dict[str, Any]:
        """A-4: Livestock heatwave mortality alert."""
        await asyncio.sleep(0.5)
        # Use semi-dynamic values rather than static 35.5
        weather_data = {"max_temp": round(random.uniform(32.0, 38.0), 1), "humidity": random.randint(60, 95)}

        t = weather_data["max_temp"]
        h = weather_data["humidity"]
        thi = (0.81 * t) + (0.01 * h * ((0.99 * t) - 14.3)) + 46.3

        prompt = f"""
        당신은 축산 데이터 분석 AI입니다. '{region}'의 '{livestock_type}' 농가에 대한 '폭염 폐사 방지 골든타임 알림' 결과를 JSON으로 출력하세요.
        [기상청 데이터]
        - 최고 기온: {t}도
        - 습도: {h}%
        - 사전 산출된 THI(온습도지수): {round(thi, 1)}

        다음 구조의 JSON으로 응답:
        {{
            "heat_stress_index": {round(thi, 1)},
            "mortality_risk_level": ("심각", "경고", "주의", "정상"),
            "golden_time_hours": (폐사 위험 급증 전 골든타임 시간),
            "feed_change_percent": (사료 섭취량 변화율 %),
            "water_change_percent": (음수량 변화율 %),
            "actionable_insight": (환풍기 가동 등 즉각적인 조치 가이드)
        }}
        """

        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception:
            synthetic_result = {
                "heat_stress_index": round(thi, 1),
                "mortality_risk_level": "심각" if thi >= 89 else ("경고" if thi >= 79 else "주의"),
                "golden_time_hours": random.randint(1, 4),
                "feed_change_percent": round(random.uniform(-15.0, 5.0), 1),
                "water_change_percent": round(random.uniform(-5.0, 10.0), 1),
                "actionable_insight": f"{region} 지역의 {livestock_type} 농가는 현재 스트레스 지수 {round(thi,1)}입니다. 환기 시스템을 점검하세요.",
            }

        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path=region,
                data_type="livestock_alert",
                raw_sources=[weather_data],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(90.0, 99.0), 1),
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result

    async def generate_resource_efficiency(
        self, region: str, crop: str
    ) -> Dict[str, Any]:
        """A-5: Resource Efficiency guide."""
        await asyncio.sleep(0.5)
        soil_data = {"moisture": random.randint(20, 80), "nitrogen": random.choice(["Low", "Medium", "High"])}

        prompt = f"""
        당신은 정밀 농업 분석 AI입니다. '{region}'의 '{crop}' 농가에 대한 '탄소 저감형 자원 투입 가이드'를 JSON으로 출력하세요.
        [농어촌공사/농진청 데이터]
        - 토양 수분: {soil_data["moisture"]}%
        - 질소 함량: {soil_data["nitrogen"]}

        다음 구조의 JSON으로 응답:
        {{
            "water_supply_recommendation_liters": (권장 관수량 L),
            "fertilizer_reduction_percent": (비료 절감 가능 퍼센트 %),
            "carbon_reduction_kg": (예상 탄소 저감량 kg),
            "actionable_insight": (비용 절감 및 탄소 저감 가이드)
        }}
        """

        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            raw_eval = res.text.replace("```json", "").replace("```", "").strip()
            synthetic_result = json.loads(raw_eval)
        except Exception:
            synthetic_result = {
                "water_supply_recommendation_liters": random.randint(80, 200),
                "fertilizer_reduction_percent": random.randint(10, 30),
                "carbon_reduction_kg": round(random.uniform(2.0, 10.0), 1),
                "actionable_insight": f"토양 상태에 따른 스마트 자원 투입으로 탄소 발자국을 최소화할 수 있습니다.",
            }

        db = SessionLocal()
        try:
            synth_entry = SyntheticData(
                region_path=region,
                data_type="resource_efficiency",
                raw_sources=[soil_data],
                synthetic_result=synthetic_result,
                confidence_score=round(random.uniform(85.0, 95.0), 1),
            )
            db.add(synth_entry)
            db.commit()
        finally:
            db.close()

        return synthetic_result


public_data_service = PublicDataService()
()
