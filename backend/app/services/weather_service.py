import httpx
import logging

logger = logging.getLogger("mdga_enterprise")

class WeatherService:
    async def get_forecast(self, lat: float, lng: float) -> str:
        """Fetches the 7-day weather forecast using Open-Meteo API."""
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7"
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=5.0)
                if resp.status_code == 200:
                    data = resp.json()
                    max_temps = data['daily']['temperature_2m_max']
                    precip = data['daily']['precipitation_sum']
                    
                    avg_temp = sum(max_temps) / len(max_temps) if max_temps else 20.0
                    rain_days = sum(1 for p in precip if p > 2.0)
                    
                    forecast = f"주간 평균 최고기온 약 {avg_temp:.1f}도."
                    if rain_days > 2:
                        forecast += f" 강수 예상일이 {rain_days}일 있습니다. 야외 운영 및 배달/물류 지연에 대비하세요."
                    elif rain_days > 0:
                        forecast += " 약한 비가 예상되는 날이 있습니다."
                    else:
                        forecast += " 대체로 맑은 날씨가 이어집니다."
                    return forecast
                else:
                    logger.warning(f"Weather API returned status: {resp.status_code}")
                    return "날씨 데이터를 불러오지 못했습니다."
        except Exception as e:
            logger.error(f"WeatherService error: {str(e)}")
            return "날씨 서비스 연결에 실패했습니다."

weather_service = WeatherService()
