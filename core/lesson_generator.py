"""
AI Lesson Generation Service
Generates personalized micro-learning content for roadmap modules
"""

import json
import os
from typing import List, Dict, Any
import google.generativeai as genai

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def generate_lessons_for_module(
    module_title: str,
    module_description: str,
    user_level: str = "intermediate",
    learning_platform: str = "freeCodeCamp",
    tech_stack: str = "JavaScript"
) -> List[Dict[str, Any]]:
    """
    Generate AI-powered lesson plan for a module
    
    Args:
        module_title: Title of the module
        module_description: Description of what the module covers
        user_level: User's experience level (novice, apprentice, pro, expert)
        learning_platform: User's preferred learning platform
        tech_stack: Primary technology/language for the module
    
    Returns:
        List of lesson dictionaries with structure matching frontend expectations
    """
    
    prompt = f"""You are an expert curriculum designer creating a micro-learning lesson plan.

**Module Information:**
- Title: {module_title}
- Description: {module_description}
- Target Audience: {user_level} level developers
- Primary Platform: {learning_platform}
- Technology: {tech_stack}

**Task:** Generate a comprehensive lesson plan with 10-14 lessons organized into 3 phases:

**Phase 1: FOUNDATIONS (5 lessons)**
- Beginner-friendly concepts
- Setup and basic syntax
- Core fundamentals

**Phase 2: INTERMEDIATE (5 lessons)**
- Practical applications
- Real-world patterns
- Best practices
- Common pitfalls

**Phase 3: ADVANCED (4 lessons)**
- Advanced techniques
- Performance optimization
- Production-ready patterns
- Deployment considerations

**For each lesson, provide:**
1. **title**: Clear, actionable title (e.g., "Setting Up Your Development Environment")
2. **description**: 2-3 sentences explaining what the lesson covers
3. **phase**: 1, 2, or 3
4. **order**: Sequential number within the entire module (1-14)
5. **xp_reward**: Always 20
6. **estimated_minutes**: Realistic time estimate (15-60 minutes)
7. **resources**:
   - **primary**: Main learning resource from {learning_platform} or official documentation
     - title: Resource title
     - url: Actual URL (use real, accessible URLs)
     - type: "docs", "video", "interactive", or "course"
     - platform_reference: Chapter/section reference (e.g., "Section 5.3")
   - **supplementary**: Array of 2-3 additional resources
     - title, url, type (prioritize YouTube, MDN, reputable blogs)

**Quality Standards:**
- Use REAL, accessible URLs (MDN, official docs, popular YouTube channels)
- Ensure resources are recent (prefer 2020+)
- Include variety: documentation, video tutorials, interactive exercises
- Make titles specific and actionable
- Descriptions should explain "what" and "why"

**Output Format:** Return ONLY a valid JSON array. No markdown, no explanations, just the JSON array.

Example structure:
[
  {{
    "title": "Introduction to Variables and Data Types",
    "description": "Learn the fundamental building blocks of programming. Understand how to store and manipulate data using variables, and explore different data types available in JavaScript.",
    "phase": 1,
    "order": 1,
    "xp_reward": 20,
    "estimated_minutes": 30,
    "resources": {{
      "primary": {{
        "title": "JavaScript Variables - MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables",
        "type": "docs",
        "platform_reference": "Chapter 2.1"
      }},
      "supplementary": [
        {{
          "title": "JavaScript Variables Explained - Fireship",
          "url": "https://www.youtube.com/watch?v=9vJRopau0g0",
          "type": "video"
        }},
        {{
          "title": "Interactive Variables Exercise",
          "url": "https://www.codecademy.com/learn/introduction-to-javascript",
          "type": "interactive"
        }}
      ]
    }}
  }}
]

Generate the complete lesson plan now:"""

    try:
        # Use Gemini to generate lessons
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        # Parse JSON response
        lessons_json = response.text.strip()
        
        # Remove markdown code blocks if present
        if lessons_json.startswith('```'):
            lessons_json = lessons_json.split('```')[1]
            if lessons_json.startswith('json'):
                lessons_json = lessons_json[4:]
        
        lessons = json.loads(lessons_json)
        
        # Validate and enrich lessons
        for lesson in lessons:
            lesson['is_completed'] = False
            lesson['confidence_rating'] = None
            lesson['completed_at'] = None
        
        return lessons
        
    except Exception as e:
        print(f"Error generating lessons: {e}")
        # Return fallback lessons if AI fails
        return generate_fallback_lessons(module_title, module_description)


def generate_fallback_lessons(module_title: str, module_description: str) -> List[Dict[str, Any]]:
    """
    Generate basic fallback lessons if AI generation fails
    """
    return [
        {
            "title": f"Introduction to {module_title}",
            "description": f"Get started with the fundamentals of {module_title}. {module_description[:100]}",
            "phase": 1,
            "order": 1,
            "xp_reward": 20,
            "estimated_minutes": 30,
            "is_completed": False,
            "confidence_rating": None,
            "completed_at": None,
            "resources": {
                "primary": {
                    "title": "Official Documentation",
                    "url": "https://developer.mozilla.org",
                    "type": "docs"
                },
                "supplementary": [
                    {"title": "Video Tutorial", "url": "https://youtube.com", "type": "video"},
                    {"title": "Interactive Exercise", "url": "https://codecademy.com", "type": "interactive"}
                ]
            }
        }
    ]
