import os
import json
import requests
import time
from jsonschema import validate, ValidationError
from dotenv import load_dotenv

from .openrouter_client import chat_completions, chat_completions_cascade, OpenRouterError

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# Use the latest available Gemini 2.5 Flash model
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"


def _call_gemini_text(prompt: str, *, temperature: float, timeout=(10, 90)) -> str:
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature},
    }
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing")

    response = requests.post(GEMINI_URL, json=payload, timeout=timeout)
    response.raise_for_status()
    result = response.json()
    return result['candidates'][0]['content']['parts'][0]['text']

# JSON Schema for validating AI-generated roadmap modules
MODULE_SCHEMA = {
    "type": "object",
    "properties": {
        "label": {"type": "string", "maxLength": 200},
        "description": {"type": "string", "maxLength": 1000},
        "status": {"type": "string", "enum": ["locked", "active", "completed"]},
        "market_value": {"type": "string", "enum": ["Low", "Med", "High", "Low-Med", "Med-High"]},
        "resources": {"type": "object"},
        "project_prompt": {"type": "string", "maxLength": 500},
        "lessons": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "maxLength": 200},
                    "description": {"type": "string", "maxLength": 500},
                    "phase": {"type": "integer", "minimum": 1, "maximum": 3},
                    "order": {"type": "integer", "minimum": 1, "maximum": 20},
                    "estimated_minutes": {"type": "integer", "minimum": 10, "maximum": 90}
                },
                "required": ["title", "description", "phase", "order", "estimated_minutes"]
            },
            "minItems": 6
        }
    },
    "required": ["label", "description", "status", "market_value", "resources", "project_prompt", "lessons"]
}

ROADMAP_SCHEMA = {
    "type": "array",
    "items": MODULE_SCHEMA,
    "minItems": 1
}

def generate_detailed_roadmap(niche, uni_course, budget, return_meta: bool = False):
    """
    Generates a highly specific, context-aware roadmap.
    """

    def _return(modules, meta):
        print(
            f"[AI] roadmap_generation provider={meta.get('provider')} model={meta.get('model')} "
            f"fallback_used={meta.get('fallback_used')}"
        )
        return (modules, meta) if return_meta else modules

    def _fallback(reason: str):
        modules = get_fallback_roadmap(niche, uni_course)
        meta = {
            "provider": "fallback",
            "model": None,
            "fallback_used": True,
            "reason": reason,
        }
        return _return(modules, meta)
    
    uni_context = ""
    if uni_course and len(uni_course) > 2:
        uni_context = f"The user is currently studying '{uni_course}' in University. You MUST include at least 2 'Bridge Modules' that show how their degree applies to {niche}."
    
    budget_context = "User prefers FREE resources (YouTube, Docs, Open Source)."
    if budget == 'PAID':
        budget_context = "User is willing to pay. Recommend high-quality courses (Udemy, Coursera) but keep free alternatives."

    prompt = f"""
    Act as a Senior Technical Career Coach.

    TARGET CAREER PATH: {niche}
    BUDGET: {budget}
    {budget_context}
    {uni_context}

    You must generate a roadmap ONLY for the target career path above.
    The modules must be specific to {niche} (do not return generic JavaScript/web modules unless they are truly required for {niche}).

    You must generate modules AND a lesson outline for each module.
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
    
        Lessons format (include in each module as "lessons"):
            - 8 to 12 lessons per module
            - Each lesson must include: title, description (1–2 sentences), phase (1/2/3), order, estimated_minutes
            - Lessons must directly match the module title and description (no off-topic items)

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
                        "project_prompt": "Specific project idea",
                        "lessons": [
                                {{
                                    "title": "Lesson title",
                                    "description": "Short description",
                                    "phase": 1,
                                    "order": 1,
                                    "estimated_minutes": 30
                                }}
                        ]
        }}
    ]
    """

    try:
        text = None
        meta = None

        try:
            # Primary: free model cascade (Gemma 3 27B → DeepSeek R1)
            text, model_used = chat_completions_cascade(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=8192,
                timeout=120,
            )
            meta = {
                "provider": "openrouter",
                "model": model_used,
                "fallback_used": False,
            }
        except OpenRouterError as e:
            print(f"[AI] OpenRouter failed, falling back to Gemini: {e}")
            # Fallback: Gemini
            last_error = None
            for attempt in range(2):
                try:
                    text = _call_gemini_text(prompt, temperature=0.7, timeout=(10, 90))
                    meta = {
                        "provider": "gemini",
                        "model": "gemini-2.5-flash",
                        "fallback_used": True,
                        "fallback_from": "openrouter",
                    }
                    last_error = None
                    break
                except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectTimeout) as ex:
                    last_error = ex
                    backoff = 1.5 ** attempt
                    print(f"[AI] Timeout calling Gemini (attempt {attempt + 1}/2). Retrying in {backoff:.1f}s...")
                    time.sleep(backoff)
            if last_error is not None:
                raise last_error

        if not text:
            return _fallback("empty_ai_response")

        print(f"[AI] Raw response length: {len(text)}")
        print(f"[AI] Raw response first 300 chars: {repr(text[:300])}")

        clean_text = safe_parse_json(text)
        
        if clean_text is None:
            print(f"[AI] Failed to parse JSON; using fallback")
            print(f"[AI] Full raw text for debug: {repr(text[:1000])}")
            return _fallback("json_parse_failed")
        
        print(f"[AI] Parsed {len(clean_text)} modules from API")

        # --- Normalise common LLM variations before schema validation ---
        _MV_MAP = {
            "low": "Low", "medium": "Med", "med": "Med", "high": "High",
            "low-med": "Low-Med", "low-medium": "Low-Med",
            "med-high": "Med-High", "medium-high": "Med-High",
        }
        _STATUS_MAP = {"lock": "locked", "active": "active", "complete": "completed", "completed": "completed", "locked": "locked"}
        for mod in clean_text:
            mv = (mod.get("market_value") or "Med").strip()
            mod["market_value"] = _MV_MAP.get(mv.lower(), "Med")
            st = (mod.get("status") or "locked").strip()
            mod["status"] = _STATUS_MAP.get(st.lower(), "locked")
            # Clamp numeric ranges for lessons
            for lesson in mod.get("lessons") or []:
                lesson["phase"] = max(1, min(3, int(lesson.get("phase", 1))))
                lesson["order"] = max(1, min(20, int(lesson.get("order", 1))))
                lesson["estimated_minutes"] = max(10, min(90, int(lesson.get("estimated_minutes", 30))))

        # Validate against schema
        try:
            validate(instance=clean_text, schema=ROADMAP_SCHEMA)
            print(f"[AI] Schema validation passed")
        except ValidationError as e:
            print(f"[AI] Schema validation failed: {e}")
            return _fallback("schema_validation_failed")
        
        modules_list = clean_text
        
        # Optimization: Skip separate YouTube API calls to reduce generation time.
        # We rely on Gemini to provide the video links in the 'resources' field.
        
        modules_out = layout_engine(modules_list)
        meta = meta or {"provider": "unknown", "model": None, "fallback_used": False}
        return _return(modules_out, meta)

    except Exception as e:
        print(f"[AI] AI Logic Failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return _fallback("exception")

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
        if module.get('lessons') is None:
            module['lessons'] = []
    
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
            "project_prompt": "Hello World & Setup",
            "lessons": [
                {
                    "title": "Environment Setup",
                    "description": "Install tools and verify your dev environment.",
                    "phase": 1,
                    "order": 1,
                    "estimated_minutes": 25
                }
            ]
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
            "project_prompt": "Build a Calculation Tool",
            "lessons": [
                {
                    "title": "Bridge Concepts",
                    "description": "Connect core concepts to your degree and target role.",
                    "phase": 2,
                    "order": 2,
                    "estimated_minutes": 30
                }
            ]
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
            "project_prompt": "Full Capstone Build",
            "lessons": [
                {
                    "title": "Capstone Planning",
                    "description": "Plan a production-ready project scope and milestones.",
                    "phase": 3,
                    "order": 3,
                    "estimated_minutes": 40
                }
            ]
        }
    ]
    roadmap_data = layout_engine(dummy_data)
    # Mark as fallback so frontend knows to auto-regenerate
    for item in roadmap_data:
        if 'resources' not in item:
            item['resources'] = {}
        item['resources']['is_fallback'] = True
    return roadmap_data

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
        try:
            text, _ = chat_completions_cascade(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=64,
                timeout=30,
            )
            text = text.strip()
        except OpenRouterError as e:
            print(f"Course normalization OpenRouter failed, falling back to Gemini: {e}")
            text = _call_gemini_text(prompt, temperature=0.3, timeout=10).strip()

        cleaned = text.strip('"\'').strip()
        return cleaned if cleaned else raw_course
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
        try:
            raw_text, _ = chat_completions_cascade(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1200,
                timeout=60,
            )
        except OpenRouterError as e:
            print(f"Quiz generation OpenRouter failed, falling back to Gemini: {e}")
            raw_text = _call_gemini_text(prompt, temperature=0.5, timeout=(10, 60))
        
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


def generate_lesson_quiz(module_label: str, lesson_title: str, lesson_description: str = ""):
    """
    Generate a 5-question MCQ quiz scoped to a single lesson.
    Used as a gate before a lesson can be marked complete.
    Cascade → Gemini fallback, same pattern as generate_quiz().
    """
    prompt = f"""
    Create a 5-question multiple choice quiz for this specific lesson:

    Module: {module_label}
    Lesson: {lesson_title}
    Lesson description: {lesson_description or 'N/A'}

    Requirements:
    - 5 questions testing practical understanding of THIS SPECIFIC LESSON topic only
    - 4 options per question (A, B, C, D)
    - Mix of conceptual and practical questions
    - Include brief explanations for correct answers
    - Questions should be clear and unambiguous
    - Focus on key concepts a learner should know after studying this lesson
    - Make questions slightly different each time (vary wording, examples, order)

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
        try:
            raw_text, _ = chat_completions_cascade(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=1400,
                timeout=60,
            )
        except OpenRouterError as e:
            print(f"Lesson quiz OpenRouter failed, falling back to Gemini: {e}")
            raw_text = _call_gemini_text(prompt, temperature=0.6, timeout=(10, 60))

        raw_text = raw_text.strip()
        if raw_text.startswith('```'):
            raw_text = raw_text.split('\n', 1)[1]
            raw_text = raw_text.rsplit('```', 1)[0]
        raw_text = raw_text.strip()

        quiz_data = json.loads(raw_text)

        # Validate structure
        if not isinstance(quiz_data, list) or len(quiz_data) == 0:
            raise ValueError("Quiz data is not a non-empty list")

        for q in quiz_data:
            if not all(k in q for k in ('question', 'options', 'correct', 'explanation')):
                raise ValueError(f"Missing required keys in question: {q}")

        return quiz_data[:5]  # cap at 5

    except Exception as e:
        print(f"Lesson Quiz Generation Error: {e}")
        # Hardcoded fallback so the user isn't blocked
        return [
            {
                "question": f"What is the primary focus of the lesson '{lesson_title}'?",
                "options": [
                    f"Understanding {lesson_title} concepts",
                    "Database administration",
                    "Network security fundamentals",
                    "Mobile app deployment",
                ],
                "correct": 0,
                "explanation": f"This lesson focuses on {lesson_title} within {module_label}.",
            },
            {
                "question": f"Which best describes a key concept from '{lesson_title}'?",
                "options": [
                    "A practical skill taught in this lesson",
                    "An unrelated historical fact",
                    "A deprecated technology",
                    "A hardware specification",
                ],
                "correct": 0,
                "explanation": "The lesson teaches practical, relevant skills.",
            },
            {
                "question": f"After completing '{lesson_title}', you should be able to:",
                "options": [
                    f"Apply {lesson_title} concepts in real projects",
                    "Write a complete operating system",
                    "Design physical circuit boards",
                    "Manage an enterprise data center",
                ],
                "correct": 0,
                "explanation": "Lessons focus on applicable, project-ready knowledge.",
            },
            {
                "question": f"How does '{lesson_title}' relate to {module_label}?",
                "options": [
                    f"It builds foundational knowledge for {module_label}",
                    "It is completely unrelated",
                    "It only covers advanced topics",
                    "It replaces the need for practice",
                ],
                "correct": 0,
                "explanation": f"Each lesson builds toward mastery of {module_label}.",
            },
            {
                "question": "What is the best approach to mastering this lesson's content?",
                "options": [
                    "Study the resources and practice hands-on",
                    "Memorize definitions without context",
                    "Skip to the next module immediately",
                    "Only read the title of each resource",
                ],
                "correct": 0,
                "explanation": "Hands-on practice reinforces theoretical knowledge.",
            },
        ]