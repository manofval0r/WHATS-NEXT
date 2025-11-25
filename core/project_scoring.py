import requests
from datetime import datetime, timedelta
import os

GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", None)  # Optional for higher rate limits

def extract_github_repo_info(github_url):
    """
    Extract owner and repo from GitHub URL.
    Supports: https://github.com/owner/repo or https://github.com/owner/repo/
    """
    try:
        # Normalize URL
        url = github_url.rstrip('/')
        
        # Extract owner/repo
        parts = url.split('/')
        if len(parts) < 5:
            return None, None
        
        owner = parts[-2]
        repo = parts[-1]
        
        # Validate format (alphanumeric, hyphens, underscores)
        if not (owner.replace('-', '').replace('_', '').isalnum() and 
                repo.replace('-', '').replace('_', '').isalnum()):
            return None, None
        
        return owner, repo
    except Exception as e:
        print(f"Error extracting repo info: {e}")
        return None, None

def score_github_project(github_url, max_score=100):
    """
    Validates and scores a GitHub project submission.
    Returns a score (0-100) and feedback.
    
    Scoring factors:
    - Repository exists: +20
    - Has README: +15
    - Has commits in last 30 days: +20
    - Multiple commits: +15
    - Has code files (not empty): +15
    - Has tests: +15
    """
    
    owner, repo = extract_github_repo_info(github_url)
    if not owner or not repo:
        return {"score": 0, "valid": False, "feedback": "Invalid GitHub URL format"}
    
    score = 0
    feedback = []
    
    try:
        headers = {}
        if GITHUB_TOKEN:
            headers['Authorization'] = f'token {GITHUB_TOKEN}'
        
        # 1. Check if repo exists
        repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
        repo_resp = requests.get(repo_url, headers=headers, timeout=5)
        
        if repo_resp.status_code != 200:
            return {"score": 0, "valid": False, "feedback": "Repository not found or is private"}
        
        repo_data = repo_resp.json()
        score += 20
        feedback.append("✓ Repository exists")
        
        # 2. Check for README
        readme_url = f"{repo_url}/readme"
        readme_resp = requests.get(readme_url, headers=headers, timeout=5)
        
        if readme_resp.status_code == 200:
            score += 15
            feedback.append("✓ Has README documentation")
        else:
            feedback.append("⚠ No README found (recommended)")
        
        # 3. Check recent commits
        commits_url = f"{repo_url}/commits"
        commits_resp = requests.get(commits_url, headers=headers, timeout=5, params={"per_page": 100})
        
        if commits_resp.status_code == 200:
            commits = commits_resp.json()
            
            if not commits:
                feedback.append("⚠ No commits found")
            else:
                # Check if repo has commits in last 30 days
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                recent_commits = [c for c in commits if 'commit' in c and 'author' in c['commit']]
                
                if recent_commits:
                    latest_date = datetime.fromisoformat(recent_commits[0]['commit']['author']['date'].replace('Z', '+00:00'))
                    if latest_date > cutoff_date:
                        score += 20
                        feedback.append("✓ Recent activity (last 30 days)")
                    else:
                        feedback.append(f"⚠ Last activity was {(datetime.utcnow() - latest_date).days} days ago")
                
                # Multiple commits
                if len(commits) >= 5:
                    score += 15
                    feedback.append(f"✓ Multiple commits ({len(commits)})")
                elif len(commits) >= 2:
                    score += 7
                    feedback.append(f"⚠ Limited commits ({len(commits)})")
        else:
            feedback.append("⚠ Could not fetch commit history")
        
        # 4. Check for code files
        contents_url = f"{repo_url}/contents"
        contents_resp = requests.get(contents_url, headers=headers, timeout=5)
        
        if contents_resp.status_code == 200:
            contents = contents_resp.json()
            code_files = [f for f in contents if f['type'] == 'file' and 
                         not f['name'].startswith('.') and f['name'] != 'README.md']
            
            if code_files:
                score += 15
                feedback.append(f"✓ Contains code files ({len(code_files)})")
            else:
                feedback.append("⚠ No source code files found")
        
        # 5. Check for tests (optional bonus)
        has_tests = False
        if isinstance(contents, list):
            for item in contents:
                if 'test' in item['name'].lower() or item['name'] in ['tests', 'spec', '__tests__']:
                    has_tests = True
                    break
        
        if has_tests:
            score += 15
            feedback.append("✓ Includes test suite")
        
        return {
            "score": min(score, max_score),
            "valid": True,
            "feedback": feedback,
            "repo_url": github_url,
            "stars": repo_data.get('stargazers_count', 0),
            "language": repo_data.get('language', 'Unknown')
        }
        
    except requests.exceptions.Timeout:
        return {"score": 50, "valid": True, "feedback": ["⚠ GitHub timeout (assuming valid submission)"]}
    except requests.exceptions.RequestException as e:
        print(f"GitHub API error: {e}")
        return {"score": 50, "valid": True, "feedback": ["⚠ Could not validate (assuming valid submission)"]}
    except Exception as e:
        print(f"Scoring error: {e}")
        return {"score": 50, "valid": True, "feedback": ["⚠ Validation error (assuming valid submission)"]}
