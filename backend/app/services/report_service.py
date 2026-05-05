import asyncio
import logging
from app.services.gemini_ai import model
from app.services.weather_service import weather_service

logger = logging.getLogger("mdga_enterprise")

class ReportService:
    async def generate_weekly_report(self, path: str, industry: str, obj_metadata: dict, parent_metadata: dict, parent_name: str, entries: list) -> str:
        """Generates an AI-powered weekly business report based on raw insights and context."""
        if not entries:
            return "아직 충분한 데이터가 수집되지 않았습니다. 사업장의 일상이나 현장 데이터를 먼저 피딩(업로드)해 주세요!"
            
        history_text = "\n".join([f"- {e['timestamp']}: {e['insights']} (신뢰도: {e.get('trust_index', 50)}%)" for e in entries[-7:]])
        
        current_value = obj_metadata.get("total_value", 0)
        current_pulse = obj_metadata.get("pulse_rate", 0)
        parent_val = parent_metadata.get("total_value", 0)
        
        # Calculate competitiveness
        market_share = round((current_value / parent_val * 100) if parent_val > 0 else 0, 1)
        
        # Fetch real weather data
        location = obj_metadata.get("location", [35.8714, 128.6014])
        weather_info = await weather_service.get_forecast(location[0], location[1])
            
        prompt = f"""
        당신은 '{path}' 사업장/기업의 전담 최고경영자(CEO) 컨설턴트이자 최고 데이터 분석가(CDO)입니다.
        대상 산업군(Industry)은 '{industry}'이며, B2B SaaS 환경에서 가장 전문적이고 날카로운 통찰력을 제공하는 것이 당신의 목표입니다.

        [정량적 데이터 지표 (Quantitative Data)]
        - 누적 자산(데이터 가치): {current_value:,}원
        - 상권/지역({parent_name}) 평균 자산 대비 점유율: {market_share}%
        - 현재 조직 활성도(Pulse): {current_pulse} BPM
        - 주간 기상 및 환경 예측: {weather_info}
        
        [정성적 데이터 피딩 히스토리 (Qualitative Data)]
        {history_text}
        
        위의 '정량적 지표'와 '정성적 히스토리', 그리고 '기상 예측'을 입체적으로 교차 분석(Cross-validation)하여,
        '{industry}' 산업 특성에 맞는 고도화된 주간 경영/생산 분석 리포트를 작성해 주세요.
        특히, 소속 지역({parent_name}) 평균 대비 경쟁력을 명확한 수치와 데이터에 기반하여 분석해 주세요.

        리포트는 가독성이 매우 뛰어난 형식으로 작성되어야 하며, 불필요한 서론이나 맺음말 없이 **핵심만 깔끔하게** 렌더링되도록 아래의 구조를 100% 준수해 주세요. (적절한 이모지를 사용하여 전문성과 가독성을 높이세요.)
        
        ## 📊 [{industry} 산업] 맞춤형 주간 경영 요약
        (단순 요약이 아닌, 데이터 지표의 변화와 원인을 경영학적 관점에서 짚어줄 것)
        
        ## 🔍 데이터 기반 핵심 분석 및 상권 경쟁력 비교
        (지역 평균 대비 성과 분석, 기상 및 맥박(Pulse) 데이터를 융합한 딥 인사이트 도출)
        
        ## 🚀 차주 핵심 액션 플랜 (Next Steps)
        (구체적이고 당장 실행 가능한 지시사항 3가지를 명확히 제시)
        """
        try:
            res = await asyncio.to_thread(model.generate_content, prompt)
            return res.text
        except Exception as e:
            logger.error(f"ReportService AI error: {str(e)}")
            return "현재 AI 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요."

report_service = ReportService()
vice()
