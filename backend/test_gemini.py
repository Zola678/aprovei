import httpx
import os
import json
from app.core.config import settings

api_key = settings.GEMINI_API_KEY
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
payload = {
    "contents": [{"role": "user", "parts": [{"text": "Oi"}]}],
}
response = httpx.post(url, headers={'Content-Type': 'application/json'}, json=payload, timeout=10.0)
print(response.status_code)
print(response.text)
