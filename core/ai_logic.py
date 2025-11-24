import os
import json
import requests
from dotenv import load_dotenv
from .youtube_logic import search_youtube_videos

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

def generate_detailed_roadmap(niche, uni_course, budget):
    """
    Generates a highly specific, context-aware roadmap with YouTube videos.
    """
    
    uni_context = ""
    if uni_course and len(uni_course) > 2:
        uni_context = f"The user is currently studying '{uni_course}' in University. You MUST include at least 2 'Bridge Modules' that show how their degree applies to {niche}."
    
    budget_context = "User prefers FREE resources (YouTube, Docs, Open Source)."
    if budget == 'PAID':
        budget_context = "User is willing to pay. Recommend high-quality courses (Udemy, Coursera) but keep free alternatives."

    prompt = f"""
    Act as a Senior Technical Career Coach. 
    Create a high-quality, step-by-step learning path for a user wanting to become a: "{niche}".
    
    Context:
    {uni_context}
    {budget_context}
    
    Requirements:
    1. Generate exactly 7 to 10 Nodes (Modules).
    2. ORDER them logically from "Absolute Beginner" to "Job Ready".
    3. content MUST be specific. Do NOT say "Learn Basics". Say "Variables, Loops & ES6 Syntax".
    4. 'market_value': Estimate the salary impact of this specific skill (Low, Med, High).
    5. 'project_prompt': A specific, buildable mini-project (e.g., "Build a Budget Tracker").
    
    Output Format:
    Return ONLY a raw JSON list of objects. Do not wrap in 'nodes'/'edges' keys yet.
    [
        {{
            "label": "Module Title",
            "description": "2 sentences on what to learn and why.",
            "status": "locked", 
            "market_value": "Med",
            "resources": {{ "main": "Specific Resource Name/Link", "alt": "Alternative" }},
            "project_prompt": "Specific project idea"
        }}
    ]
    """

    try:
        payload = { 
            "contents": [{ "parts": [{"text": prompt}] }],
            "generationConfig": { "temperature": 0.7 }
        }
        response = requests.post(GEMINI_URL, json=payload, timeout=20)
        
        if response.status_code != 200:
            print(f"API Error: {response.text}")
            return get_fallback_roadmap(niche, uni_course)

        result = response.json()
        text = result['candidates'][0]['content']['parts'][0]['text']
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        if clean_text.endswith(",]"): 
            clean_text = clean_text.replace(",]", "]")
        
        modules_list = json.loads(clean_text)
        
        print("Fetching YouTube videos for modules...")
        for module in modules_list:
            videos = search_youtube_videos(module['label'], max_results=3)
            if not isinstance(module.get('resources'), dict):
                module['resources'] = {"main": "", "alt": ""}
            module['resources']['videos'] = videos
        
        return layout_engine(modules_list)

    except Exception as e:
        print(f"AI Logic Failed: {e}")
        return get_fallback_roadmap(niche, uni_course)

def layout_engine(modules_list):
    """
    Takes a list of data and calculates specific X/Y coordinates.
    """
    nodes = []
    edges = []
    
    x_pos = 250
    y_start = 500
    y_gap = 150
    
    for index, module in enumerate(modules_list):
        if index == 0:
            module['status'] = 'active'
        
        node_id = str(index + 1)
        nodes.append({
            "id": node_id,
            "type": "customNode",
            "position": { "x": x_pos, "y": y_start + (index * y_gap) }, 
            "data": module
        })
        
        if index > 0:
            prev_id = str(index)
            edges.append({
                "id": f"e{prev_id}-{node_id}",
                "source": prev_id,
                "target": node_id,
                "animated": True,
                "style": { "stroke": "#00f2ff", "strokeWidth": 2 }
            })
            
    return { "nodes": nodes, "edges": edges }

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
            "resources": {"main": "MDN Web Docs", "alt": "Traversy Media", "videos": []},
            "project_prompt": "Hello World & Setup"
        },
        {
            "label": f"{uni_course} Integration",
            "description": f"Applying {niche} skills to {uni_course} problems.",
            "status": "locked",
            "market_value": "Med",
            "resources": {"main": "Data Analysis with Python", "alt": "YouTube", "videos": []},
            "project_prompt": "Build a Calculation Tool"
        },
        {
            "label": "Advanced Concepts",
            "description": "Deep dive into frameworks and architecture.",
            "status": "locked",
            "market_value": "High",
            "resources": {"main": "Official Documentation", "alt": "Udemy", "videos": []},
            "project_prompt": "Full Capstone Build"
        }
    ]
    return layout_engine(dummy_data)

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