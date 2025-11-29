import os
import json
import requests
from jsonschema import validate, ValidationError
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# Use the latest available Gemini 2.5 Flash model
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

# JSON Schema for validating AI-generated roadmap modules
MODULE_SCHEMA = {
    "type": "object",
    "properties": {
        "label": {"type": "string", "maxLength": 200},
        "description": {"type": "string", "maxLength": 1000},
        "status": {"type": "string", "enum": ["locked", "active", "completed"]},
        "market_value": {"type": "string", "enum": ["Low", "Med", "High", "Low-Med", "Med-High"]},
        "resources": {"type": "object"},
        "project_prompt": {"type": "string", "maxLength": 500}
    },
    "required": ["label", "description", "status", "market_value", "resources", "project_prompt"]
}

ROADMAP_SCHEMA = {
    "type": "array",
    "items": MODULE_SCHEMA,
    "minItems": 1
}

def generate_detailed_roadmap(niche, uni_course, budget):
    """
    Generates a highly specific, context-aware roadmap.
    """
    
    uni_context = ""
    if uni_course and len(uni_course) > 2:
        uni_context = f"The user is currently studying '{uni_course}' in University. You MUST include at least 2 'Bridge Modules' that show how their degree applies to {niche}."
    
    budget_context = "User prefers FREE resources (YouTube, Docs, Open Source)."
    if budget == 'PAID':
        budget_context = "User is willing to pay. Recommend high-quality courses (Udemy, Coursera) but keep free alternatives."

    prompt = f"""
    Act as a Senior Technical Career Coach. 
       {{
         "primary": [
           {{"title": "Best Resource Name", "url": "https://...", "type": "interactive|docs|video|course"}},
           {{"title": "Second Best Resource", "url": "https://...", "type": "interactive|docs|video|course"}}
         ],
         "additional": [
           {{"title": "Alternative 1", "url": "https://...", "type": "interactive|docs|video|course"}},
           {{"title": "Alternative 2", "url": "https://...", "type": "interactive|docs|video|course"}},
           {{"title": "Alternative 3", "url": "https://...", "type": "interactive|docs|video|course"}}
         ]
       }}
       
       IMPORTANT Resource Guidelines:
       - Prioritize FREE, high-quality resources: FreeCodeCamp, MDN, Scrimba, Official Docs, W3Schools, edx, etc.
       - For "interactive" type: Use FreeCodeCamp, Scrimba, Codecademy Free, Khan Academy or other hidden gems
       - For "docs" type: Use Official Documentation (React docs, Python docs, MDN, etc.)
       - For "video" type: Use the best YouTube channels (Traversy Media, freeCodeCamp.org, Fireship, etc.), before the less known ones
       - For "course" type: Use Udemy/Coursera only if budget is PAID, otherwise use free alternatives
       - Each URL must be a REAL, working link (not placeholder)
       - Order by quality: Best resources in "primary", good alternatives in "additional"
    
    Output Format:
    Return ONLY a raw JSON list of objects. 
    IMPORTANT: Do NOT include any conversational text like "Here is your roadmap" or "As a career coach".
    Start the response immediately with `[` and end with `]`.
    Do not wrap in markdown code blocks.

    [
        {{
            "label": "Module Title",
            "description": "2 sentences on what to learn and why.",
            "status": "locked", 
            "market_value": "Med",
            "resources": {{ 
                "primary": [
                    {{"title": "FreeCodeCamp JavaScript Course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "type": "interactive"}},
                    {{"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"}}
                ],
                "additional": [
                    {{"title": "JavaScript.info Tutorial", "url": "https://javascript.info/", "type": "docs"}},
                    {{"title": "Traversy Media JS Crash Course", "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c", "type": "video"}},
                    {{"title": "Eloquent JavaScript Book", "url": "https://eloquentjavascript.net/", "type": "docs"}}
                ]
            }},
            "project_prompt": "Specific project idea"
        }}
    ]
    """

    try:
        payload = { 
            "contents": [{ "parts": [{"text": prompt}] }],
            "generationConfig": { "temperature": 0.7 }
        }
        print(f"[AI] Calling Gemini API at {GEMINI_URL}")
        print(f"[AI] Payload: {json.dumps(payload, indent=2)[:200]}...")
        response = requests.post(GEMINI_URL, json=payload, timeout=60)
        print(f"[AI] Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[AI] API Error: {response.text}")
            return get_fallback_roadmap(niche, uni_course)

        result = response.json()
        print(f"[AI] Got response from API, parsing JSON...")
        text = result['candidates'][0]['content']['parts'][0]['text']
        print(f"[AI] Raw text from API: {text[:200]}...")
        clean_text = safe_parse_json(text)
        
        if clean_text is None:
            print(f"[AI] Failed to parse JSON; using fallback")
            return get_fallback_roadmap(niche, uni_course)
        
        print(f"[AI] Parsed {len(clean_text)} modules from API")
        
        # Validate against schema
        try:
            validate(instance=clean_text, schema=ROADMAP_SCHEMA)
            print(f"[AI] Schema validation passed")
        except ValidationError as e:
            print(f"[AI] Schema validation failed: {e}")
            return get_fallback_roadmap(niche, uni_course)
        
        modules_list = clean_text
        
        # Optimization: Skip separate YouTube API calls to reduce generation time.
        # We rely on Gemini to provide the video links in the 'resources' field.
        
        print(f"[AI] Roadmap generation successful!")
        print(f"[AI] Returning {len(modules_list)} modules")
        return layout_engine(modules_list)

    except Exception as e:
        print(f"[AI] AI Logic Failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return get_fallback_roadmap(niche, uni_course)

def safe_parse_json(text):
    """
    Safely parse JSON from AI output with error handling.
    """
    try:
        # Find the first '[' and last ']'
        start_idx = text.find('[')
        end_idx = text.rfind(']')
        
        if start_idx == -1 or end_idx == -1:
            print("[AI] Error: No JSON array found in response")
            return None
            
        clean_text = text[start_idx:end_idx+1]
        
        # Parse and validate JSON
        data = json.loads(clean_text)
        
        # Ensure it's a list
        if not isinstance(data, list):
            print("JSON is not a list")
            return None
        
        return data
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error during JSON parsing: {e}")
        return None

def layout_engine(modules_list):
    """
    Takes a list of modules and returns just the modules (not nodes/edges).
    The views.py handles the nodes/edges formatting.
    """
    # Ensure each module has required fields
    for module in modules_list:
        if module.get('status') is None:
            module['status'] = 'locked'
        if module.get('resources') is None:
            module['resources'] = {}
    
    return modules_list

def get_fallback_roadmap(niche, uni_course):
    """
    Used if AI is down.
    """
    print("Using Fallback Roadmap")
    dummy_data = [
        {
            "label": f"{niche} Foundations",
            "description": "Understanding the core syntax and environment setup.",
            "status": "active",
            "market_value": "Low",
            "resources": {
                "primary": [
                    {"title": "MDN Web Docs", "url": "https://developer.mozilla.org", "type": "docs"},
                    {"title": "Traversy Media", "url": "https://www.youtube.com/c/TraversyMedia", "type": "video"}
                ],
                "additional": [
                    {"title": "FreeCodeCamp", "url": "https://www.freecodecamp.org", "type": "interactive"}
                ]
            },
            "project_prompt": "Hello World & Setup"
        },
        {
            "label": f"{uni_course} Integration",
            "description": f"Applying {niche} skills to {uni_course} problems.",
            "status": "locked",
            "market_value": "Med",
            "resources": {
                "primary": [
                    {"title": "Data Analysis with Python", "url": "https://www.coursera.org", "type": "course"}
                ],
                "additional": []
            },
            "project_prompt": "Build a Calculation Tool"
        },
        {
            "label": "Advanced Concepts",
            "description": "Deep dive into frameworks and architecture.",
            "status": "locked",
            "market_value": "High",
            "resources": {
                "primary": [
                    {"title": "Official Documentation", "url": "https://devdocs.io", "type": "docs"}
                ],
                "additional": []
            },
            "project_prompt": "Full Capstone Build"
        }
    ]
    return layout_engine(dummy_data)

def normalize_university_course(raw_course):
    """
    Uses AI to normalize raw university course input (e.g. "Bsc Accounting" -> "Accounting").
    Returns a clean, standard version of the course name.
    """
    if not raw_course or len(raw_course.strip()) < 2:
        return ""
    
    prompt = f"""
    Normalize this university course name into a standard, clean format.
    Input: "{raw_course}"
    
    Return ONLY the normalized course name, nothing else. Examples:
    - "Bsc Acctng" -> "Accounting"
    - "M.Sc. Data Science" -> "Data Science"
    - "BS Comp Sci" -> "Computer Science"
    
    Return just the clean name, no quotes or extra text:
    """
    
    try:
        payload = { 
            "contents": [{ "parts": [{"text": prompt}] }],
            "generationConfig": { "temperature": 0.3 }
        }
        response = requests.post(GEMINI_URL, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text'].strip()
            # Clean up any quotes or extra whitespace
            cleaned = text.strip('"\'').strip()
            return cleaned if cleaned else raw_course
        else:
            return raw_course
    except Exception as e:
        print(f"Course normalization error: {e}")
        return raw_course

def generate_quiz(module_label, description):
    """
    Generate a 5-question multiple choice quiz using Gemini AI.
    """
    prompt = f"""
    Create a 5-question multiple choice quiz for this programming module:
    
    Module: {module_label}
    Description: {description}
    
    Requirements:
    - 5 questions testing practical understanding
    - 4 options per question (A, B, C, D)
    - Mix of conceptual and practical questions
    - Include brief explanations for correct answers
    - Questions should be clear and unambiguous
    
    Return ONLY valid JSON in this exact format (no markdown, no code blocks):
    [
      {{
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0,
        "explanation": "Why this is correct"
      }}
    ]
    """
    
    try:
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(GEMINI_URL, json=payload)
        response.raise_for_status()
        
        result = response.json()
        raw_text = result['candidates'][0]['content']['parts'][0]['text']
        
        raw_text = raw_text.strip()
        if raw_text.startswith('```'):
            raw_text = raw_text.split('\n', 1)[1]
            raw_text = raw_text.rsplit('```', 1)[0]
        raw_text = raw_text.strip()
        
        quiz_data = json.loads(raw_text)
        return quiz_data
        
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        return [
            {
                "question": f"What is the main purpose of {module_label}?",
                "options": [
                    "To build applications",
                    "To write documentation",
                    "To design interfaces",
                    "To manage databases"
                ],
                "correct": 0,
                "explanation": f"{module_label} is primarily used for building applications."
            }
        ]