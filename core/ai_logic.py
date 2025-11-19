import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

def generate_detailed_roadmap(niche, uni_course, budget):
    """
    Generates a React Flow graph with 'Futuristic' metadata.
    Input: "Web Dev", "Accounting", "FREE"
    Output: JSON with nodes and edges.
    """
    
    prompt = f"""
    Create a detailed career roadmap for a user wanting to be a: "{niche}".
    User Context: Studying "{uni_course}" (University), Budget Preference: "{budget}".
    
    Task: Create a Directed Acyclic Graph (DAG) of skills.
    
    Output Requirements (JSON Only):
    Return a JSON object with 'nodes' and 'edges'.
    
    Node Structure:
    {{
      "id": "unique_string",
      "type": "customNode",
      "position": {{ "x": integer, "y": integer }}, (Arrange vertically bottom-to-top. Start at y=500, end at y=0)
      "data": {{
         "label": "Skill Name",
         "status": "locked" (default) or "active" (for the first node),
         "market_value": "Low" or "Med" or "High",
         "description": "Short summary of why this is needed.",
         "resources": {{ 
            "main": "Specific {budget} resource title/link", 
            "alt": "Alternative resource" 
         }},
         "project_prompt": "A specific mini-project idea to verify this skill."
      }}
    }}
    
    Edge Structure:
    {{ "id": "e1-2", "source": "id_1", "target": "id_2", "animated": true }}
    """

    try:
        payload = { "contents": [{ "parts": [{"text": prompt}] }] }
        # Increased timeout for complex response
        response = requests.post(GEMINI_URL, json=payload, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            # Clean Markdown
            clean_text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
            
    except Exception as e:
        print(f"AI Error: {e}")
        
    # FALLBACK (Futuristic structure)
    return {
        "nodes": [
            { 
                "id": "1", "type": "customNode", "position": { "x": 250, "y": 400 },
                "data": { "label": f"{niche} Foundations", "status": "active", "market_value": "Low", "description": "The absolute basics.", "resources": {"main": "MDN Docs", "alt": "Crash Course"}, "project_prompt": "Hello World Page" }
            },
            { 
                "id": "2", "type": "customNode", "position": { "x": 150, "y": 200 },
                "data": { "label": f"Relevant {uni_course} Logic", "status": "locked", "market_value": "Med", "description": "Applying your degree.", "resources": {"main": "Data Analysis Course", "alt": "YouTube"}, "project_prompt": "Spreadsheet Calculator" }
            },
            { 
                "id": "3", "type": "customNode", "position": { "x": 350, "y": 200 },
                "data": { "label": "Core Tech", "status": "locked", "market_value": "High", "description": "The hard skills.", "resources": {"main": "FreeCodeCamp", "alt": "Docs"}, "project_prompt": "API Fetcher" }
            }
        ],
        "edges": [
            { "id": "e1-2", "source": "1", "target": "2", "animated": True, "style": {"stroke": "#00f2ff"} },
            { "id": "e1-3", "source": "1", "target": "3", "animated": True, "style": {"stroke": "#00f2ff"} }
        ]
    }