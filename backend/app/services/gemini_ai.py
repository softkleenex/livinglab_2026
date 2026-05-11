from google import genai
from app.core.config import settings

api_key = settings.GEMINI_API_KEY
client = genai.Client(api_key=api_key) if api_key else None

model_name = settings.GEMINI_MODEL
