import google.generativeai as genai
from app.core.config import settings

api_key = settings.GEMINI_API_KEY
if api_key:
    genai.configure(api_key=api_key)

model_name = settings.GEMINI_MODEL
model = genai.GenerativeModel(model_name)
