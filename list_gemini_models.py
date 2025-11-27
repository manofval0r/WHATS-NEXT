import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

# List available models
url = f'https://generativelanguage.googleapis.com/v1/models?key={api_key}'
try:
    resp = requests.get(url, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        print("Available Models:")
        for model in data.get('models', []):
            print(f"  - {model.get('name')}")
    else:
        print(f"Error: {resp.status_code}")
        print(resp.text)
except Exception as e:
    print(f"Exception: {e}")
