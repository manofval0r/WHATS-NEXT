from datetime import datetime
import hashlib
import hmac
import json

# Simple certificate generation
def generate_certificate_token(user_id, item_id):
    """
    Generate a tamper-proof certificate verification token.
    """
    data = f"{user_id}:{item_id}:{datetime.now().isoformat()}"
    token = hashlib.sha256(data.encode()).hexdigest()
    return token

def create_portfolio_html(user, completed_items):
    """
    Generate a static HTML portfolio page.
    """
    
    skills = set()
    for item in completed_items:
        # Extract skills from module labels
        words = item.label.split()
        for word in words:
            if len(word) > 3:
                skills.add(word)
    
    projects_html = ""
    for i, item in enumerate(completed_items, 1):
        projects_html += f"""
        <div class="project-card">
            <h3>{item.module_title}</h3>
            <p>{item.cv_text}</p>
            <span class="date">{item.date}</span>
            {f'<a href="{item.link}" target="_blank" class="project-link">View Project →</a>' if item.link else ''}
        </div>
        """
    
    skills_html = "".join([f'<span class="skill">{skill}</span>' for skill in sorted(skills)[:15]])
    
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{user.username} - Portfolio</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f4f4f4;
            }}
            .container {{ max-width: 900px; margin: 0 auto; padding: 20px; }}
            header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
                border-radius: 8px;
                margin-bottom: 40px;
            }}
            header h1 {{ font-size: 2.5em; margin-bottom: 10px; }}
            header p {{ font-size: 1.1em; opacity: 0.9; }}
            .meta {{
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
                font-size: 0.9em;
            }}
            .meta a {{ color: white; text-decoration: none; }}
            
            .section {{
                background: white;
                padding: 30px;
                margin-bottom: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }}
            .section h2 {{
                font-size: 1.5em;
                margin-bottom: 20px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }}
            
            .skills {{
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }}
            .skill {{
                background: #667eea;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9em;
            }}
            
            .project-card {{
                padding: 20px;
                border-left: 4px solid #667eea;
                margin-bottom: 15px;
                background: #f9f9f9;
                border-radius: 4px;
            }}
            .project-card h3 {{
                margin-bottom: 10px;
                color: #333;
            }}
            .project-card p {{
                margin-bottom: 10px;
                color: #666;
            }}
            .date {{
                font-size: 0.85em;
                color: #999;
                margin-right: 15px;
            }}
            .project-link {{
                color: #667eea;
                text-decoration: none;
                font-weight: bold;
            }}
            .project-link:hover {{ text-decoration: underline; }}
            
            footer {{
                text-align: center;
                padding: 20px;
                color: #999;
                font-size: 0.9em;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>{user.username.upper()}</h1>
                <p>{user.target_career} | Portfolio & Credentials</p>
                <div class="meta">
                    {f'<a href="{user.github_link}">GitHub</a>' if user.github_link else ''}
                    {f'<a href="{user.linkedin_link}">LinkedIn</a>' if user.linkedin_link else ''}
                    <span>{user.email}</span>
                </div>
            </header>
            
            <div class="section">
                <h2>Technical Skills</h2>
                <div class="skills">{skills_html}</div>
            </div>
            
            <div class="section">
                <h2>Project Experience</h2>
                {projects_html if projects_html else '<p>No projects yet.</p>'}
            </div>
            
            <footer>
                Generated by WHATS-NEXT • {datetime.now().strftime('%B %d, %Y')}
            </footer>
        </div>
    </body>
    </html>
    """
    return html
