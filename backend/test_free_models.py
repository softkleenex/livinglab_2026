import os
import google.generativeai as genai

api_key = "AIzaSyC5bW7Q5S8taBwsD75UWBPmIJIXEq5UuWA"
genai.configure(api_key=api_key)

models_to_test = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]

for m in models_to_test:
    try:
        print(f"Testing {m}...")
        model = genai.GenerativeModel(m)
        response = model.generate_content("Hello, reply with OK if you work.")
        print(f"Success with {m}: {response.text}")
        break
    except Exception as e:
        print(f"Error with {m}: {e}")
