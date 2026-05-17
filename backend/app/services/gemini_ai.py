from google import genai
from app.core.config import settings
import asyncio
import time
import random

api_key_str = settings.GEMINI_API_KEY
api_keys = [k.strip() for k in api_key_str.split(',')] if api_key_str else []

# Fallback client for backward compatibility
client = genai.Client(api_key=api_keys[0]) if api_keys else None
model_name = settings.GEMINI_MODEL

async def generate_content_with_fallback(contents, config=None, **kwargs):
    if not api_keys:
        raise Exception("API Keys are missing in .env")
    
    last_exception = None
    # Shuffle keys or just loop through them sequentially
    # It's better to loop sequentially or pick a random starting point to distribute load
    keys_to_try = list(api_keys)
    random.shuffle(keys_to_try)
    
    for key in keys_to_try:
        try:
            temp_client = genai.Client(api_key=key)
            if config:
                res = await asyncio.to_thread(
                    temp_client.models.generate_content,
                    model=model_name,
                    contents=contents,
                    config=config,
                    **kwargs
                )
            else:
                res = await asyncio.to_thread(
                    temp_client.models.generate_content,
                    model=model_name,
                    contents=contents,
                    **kwargs
                )
            return res
        except Exception as e:
            last_exception = e
            print(f"⚠️ Gemini API Request failed with key {key[:5]}... Trying next key if available. Error: {e}")
            continue
            
    raise last_exception

