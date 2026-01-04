import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in .env")
    exit(1)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

print(f"Testing Gemini API with key: {GEMINI_API_KEY[:5]}...{GEMINI_API_KEY[-5:]}")

# Test Simple Prompt
prompt = "Explain quantum computing in 5 words."
payload = { 
    "contents": [{ "parts": [{"text": prompt}] }]
}

try:
    print("Sending simple prompt...")
    response = requests.post(GEMINI_URL, json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("SUCCESS: API is working.")
        result = response.json()
        print("AI Output:", result['candidates'][0]['content']['parts'][0]['text'])
    else:
        print("FAILURE: API returned error.")

except Exception as e:
    print(f"EXCEPTION: {e}")

# Import actual logic to test internal function
try:
    print("\nTesting Generate Detailed Roadmap Logic...")
    from core.ai_logic import generate_detailed_roadmap
    
    # Mock fallback to check if it returns fallback or real AI
    roadmap = generate_detailed_roadmap("Full Stack Developer", "Computer Science", "FREE")
    
    if roadmap and len(roadmap) > 0:
        print(f"SUCCESS: Generated {len(roadmap)} modules.")
        print("First module:", roadmap[0]['label'])
        
        # Check if it looks like fallback data
        if roadmap[0]['label'] == "Full Stack Developer Foundations" and "Traversy Media" in str(roadmap[0]['resources']):
            print("WARNING: It seems to be returning FALLBACK data, not AI data.")
        else:
            print("CONFIRMED: Data looks like AI generated content.")
            
    else:
        print("FAILURE: Returned empty roadmap.")

except ImportError:
    print("Could not import core.ai_logic. Run this from project root.")
except Exception as e:
    print(f"Logic Test Error: {e}")
