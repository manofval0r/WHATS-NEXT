import requests
import json

url = "http://127.0.0.1:8000/api/register/"
data = {
    "username": "testuser_script",
    "password": "password123",
    "email": "test_script@example.com",
    "target_career": "Developer",
    "university_course_raw": "CS"
}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
