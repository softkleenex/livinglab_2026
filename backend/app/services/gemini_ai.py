import os
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    
model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
model = genai.GenerativeModel(model_name)
