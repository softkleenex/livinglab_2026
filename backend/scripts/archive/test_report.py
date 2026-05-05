import asyncio
from app.services.report_service import report_service

async def run():
    print(await report_service.generate_weekly_report(
        "대구광역시", "공공", {"total_value": 0, "pulse_rate": 80, "location": [35.87, 128.60]}, {"total_value": 0}, "Root", [{"timestamp": "2026-04-20 12:00", "insights": "Test insight"}]
    ))

if __name__ == "__main__":
    asyncio.run(run())
