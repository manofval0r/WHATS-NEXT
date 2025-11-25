# JSON Schema for validating AI-generated roadmap modules
MODULE_SCHEMA = {
    "type": "object",
    "properties": {
        "label": {"type": "string", "maxLength": 200},
        "description": {"type": "string", "maxLength": 1000},
        "status": {"type": "string", "enum": ["locked", "active", "completed"]},
        "market_value": {"type": "string", "enum": ["Low", "Med", "High"]},
        "resources": {"type": "object"},
        "project_prompt": {"type": "string", "maxLength": 500}
    },
    "required": ["label", "description", "status", "market_value", "resources", "project_prompt"]
}

ROADMAP_SCHEMA = {
    "type": "array",
    "items": MODULE_SCHEMA,
    "minItems": 1,
    "maxItems": 20
}

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
        clean_text = safe_parse_json(text)
        
        if clean_text is None:
            print("Failed to parse JSON; using fallback")
            return get_fallback_roadmap(niche, uni_course)
        
        # Validate against schema
        try:
            validate(instance=clean_text, schema=ROADMAP_SCHEMA)
        except ValidationError as e:
            print(f"Schema validation failed: {e}")
            return get_fallback_roadmap(niche, uni_course)
        
        modules_list = clean_text
        
        print("Fetching YouTube videos for modules...")
        for module in modules_list:
            videos = search_youtube_videos(module.get('label', ''), max_results=3)
            if not isinstance(module.get('resources'), dict):
                module['resources'] = {"main": "", "alt": ""}
            module['resources']['videos'] = videos
        
        return layout_engine(modules_list)

    except Exception as e:
        print(f"AI Logic Failed: {e}")
        return get_fallback_roadmap(niche, uni_course)

def safe_parse_json(text):
    """
    Safely parse JSON from AI output with error handling.
    """
    try:
        # Remove markdown code blocks if present
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        # Handle trailing comma before closing bracket
        if clean_text.endswith(",]"): 
            clean_text = clean_text.replace(",]", "]")
        
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
        payload = {{ 
            "contents": [{{ "parts": [{{"text": prompt}}] }}],
            "generationConfig": {{ "temperature": 0.3 }}
        }}
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