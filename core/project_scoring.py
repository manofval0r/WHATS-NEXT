"""
Project Scoring Engine (Phase 3)
================================
Automated GitHub project validation and scoring system.
Production-ready with comprehensive error handling and tech-stack matching.
"""

import requests
from datetime import datetime, timedelta
import os
import re

GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", None)  # Required in production for rate limits

# Minimum score required to pass verification (blocks completion if not met)
MINIMUM_SCORE_THRESHOLD = 60

# Tech stack keywords for matching against module labels
TECH_STACK_KEYWORDS = {
    'javascript': ['javascript', 'js', 'node', 'nodejs', 'express', 'vanilla'],
    'typescript': ['typescript', 'ts'],
    'react': ['react', 'reactjs', 'react.js', 'jsx', 'hooks', 'redux'],
    'vue': ['vue', 'vuejs', 'vue.js', 'nuxt'],
    'angular': ['angular', 'angularjs'],
    'python': ['python', 'django', 'flask', 'fastapi', 'py'],
    'java': ['java', 'spring', 'springboot'],
    'csharp': ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
    'go': ['go', 'golang'],
    'rust': ['rust'],
    'ruby': ['ruby', 'rails', 'ruby on rails'],
    'php': ['php', 'laravel', 'symfony'],
    'swift': ['swift', 'ios', 'swiftui'],
    'kotlin': ['kotlin', 'android'],
    'html': ['html', 'html5', 'css', 'css3', 'web'],
    'sql': ['sql', 'database', 'postgresql', 'mysql', 'mongodb'],
    'docker': ['docker', 'container', 'kubernetes', 'k8s'],
    'aws': ['aws', 'cloud', 'lambda', 's3'],
    'machine_learning': ['ml', 'machine learning', 'ai', 'tensorflow', 'pytorch', 'neural'],
    'data_science': ['data', 'pandas', 'numpy', 'jupyter', 'analysis'],
}


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
                repo.replace('-', '').replace('_', '').replace('.', '').isalnum()):
            return None, None
        
        return owner, repo
    except Exception as e:
        print(f"[SCORING] Error extracting repo info: {e}")
        return None, None


def detect_tech_stack(repo_language, repo_contents, repo_data):
    """
    Detect technologies used in the repository.
    Returns a list of detected tech stack items.
    """
    detected = set()
    
    # Primary language
    if repo_language:
        lang_lower = repo_language.lower()
        detected.add(lang_lower)
        
        # Map common language names
        if lang_lower == 'javascript':
            detected.add('javascript')
        elif lang_lower == 'typescript':
            detected.add('typescript')
            detected.add('javascript')  # TS implies JS knowledge
    
    # Check files for framework indicators
    if repo_contents:
        file_names = [f['name'].lower() for f in repo_contents if f['type'] == 'file']
        
        # React indicators
        if any('react' in name or name == 'package.json' for name in file_names):
            detected.add('react')
        
        # Vue indicators
        if any('.vue' in name or 'vue.config' in name for name in file_names):
            detected.add('vue')
        
        # Python indicators
        if any(name.endswith('.py') or name == 'requirements.txt' or name == 'pyproject.toml' for name in file_names):
            detected.add('python')
        
        # Docker
        if any('dockerfile' in name or 'docker-compose' in name for name in file_names):
            detected.add('docker')
        
        # Node.js
        if 'package.json' in file_names:
            detected.add('nodejs')
            detected.add('javascript')
    
    return list(detected)


def match_tech_stack(detected_stack, module_label):
    """
    Check if the project's tech stack matches the module requirements.
    Returns (matches: bool, matched_techs: list, expected_techs: list)
    """
    module_lower = module_label.lower()
    expected_techs = []
    matched_techs = []
    
    # Find expected techs from module label
    for tech_category, keywords in TECH_STACK_KEYWORDS.items():
        for keyword in keywords:
            if keyword in module_lower:
                expected_techs.append(tech_category)
                break
    
    # Check matches
    for tech in expected_techs:
        keywords = TECH_STACK_KEYWORDS.get(tech, [])
        for keyword in keywords:
            if keyword in detected_stack or tech in detected_stack:
                matched_techs.append(tech)
                break
    
    # If no expected techs found, any tech is fine
    if not expected_techs:
        return True, detected_stack, []
    
    # Calculate match ratio
    match_ratio = len(matched_techs) / len(expected_techs) if expected_techs else 1.0
    
    return match_ratio >= 0.5, matched_techs, expected_techs


def score_github_project(github_url, module_label="", max_score=100):
    """
    Validates and scores a GitHub project submission.
    Returns a structured breakdown for UI display.
    
    Returns:
    {
        "score": int (0-100),
        "passed": bool (score >= MINIMUM_SCORE_THRESHOLD),
        "valid": bool,
        "checks": {
            "repo_exists": {"passed": bool, "points": int, "message": str},
            "has_readme": {"passed": bool, "points": int, "message": str},
            "recent_activity": {"passed": bool, "points": int, "message": str},
            "multiple_commits": {"passed": bool, "points": int, "message": str},
            "has_code": {"passed": bool, "points": int, "message": str},
            "has_tests": {"passed": bool, "points": int, "message": str},
            "tech_match": {"passed": bool, "points": int, "message": str}
        },
        "suggestions": list[str],
        "metadata": {
            "repo_url": str,
            "stars": int,
            "language": str,
            "detected_stack": list[str]
        }
    }
    """
    
    owner, repo = extract_github_repo_info(github_url)
    
    if not owner or not repo:
        return {
            "score": 0,
            "passed": False,
            "valid": False,
            "checks": {},
            "suggestions": ["Please provide a valid GitHub repository URL (e.g., https://github.com/username/repo)"],
            "metadata": {}
        }
    
    # Initialize result structure
    checks = {
        "repo_exists": {"passed": False, "points": 0, "max_points": 15, "message": ""},
        "has_readme": {"passed": False, "points": 0, "max_points": 15, "message": ""},
        "recent_activity": {"passed": False, "points": 0, "max_points": 20, "message": ""},
        "multiple_commits": {"passed": False, "points": 0, "max_points": 15, "message": ""},
        "has_code": {"passed": False, "points": 0, "max_points": 15, "message": ""},
        "has_tests": {"passed": False, "points": 0, "max_points": 10, "message": ""},
        "tech_match": {"passed": False, "points": 0, "max_points": 10, "message": ""}
    }
    
    suggestions = []
    metadata = {
        "repo_url": github_url,
        "stars": 0,
        "language": "Unknown",
        "detected_stack": []
    }
    
    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if GITHUB_TOKEN:
            headers['Authorization'] = f'token {GITHUB_TOKEN}'
        else:
            print("[SCORING] Warning: No GITHUB_TOKEN set. Rate limits will apply.")
        
        # 1. CHECK REPOSITORY EXISTS
        repo_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
        repo_resp = requests.get(repo_url, headers=headers, timeout=10)
        
        if repo_resp.status_code == 404:
            checks["repo_exists"]["message"] = "Repository not found or is private"
            suggestions.append("Make sure your repository is public and the URL is correct")
            return {
                "score": 0,
                "passed": False,
                "valid": False,
                "checks": checks,
                "suggestions": suggestions,
                "metadata": metadata
            }
        elif repo_resp.status_code == 403:
            checks["repo_exists"]["message"] = "GitHub API rate limit exceeded"
            suggestions.append("Please try again in a few minutes")
            return {
                "score": 0,
                "passed": False,
                "valid": False,
                "checks": checks,
                "suggestions": suggestions,
                "metadata": metadata
            }
        elif repo_resp.status_code != 200:
            checks["repo_exists"]["message"] = f"GitHub API error: {repo_resp.status_code}"
            return {
                "score": 0,
                "passed": False,
                "valid": False,
                "checks": checks,
                "suggestions": ["Unable to verify repository. Please try again."],
                "metadata": metadata
            }
        
        repo_data = repo_resp.json()
        checks["repo_exists"]["passed"] = True
        checks["repo_exists"]["points"] = 15
        checks["repo_exists"]["message"] = f"Repository verified: {owner}/{repo}"
        
        metadata["stars"] = repo_data.get('stargazers_count', 0)
        metadata["language"] = repo_data.get('language', 'Unknown')
        
        # 2. CHECK README
        readme_url = f"{repo_url}/readme"
        readme_resp = requests.get(readme_url, headers=headers, timeout=10)
        
        if readme_resp.status_code == 200:
            readme_data = readme_resp.json()
            readme_size = readme_data.get('size', 0)
            
            if readme_size > 500:  # At least 500 bytes for meaningful README
                checks["has_readme"]["passed"] = True
                checks["has_readme"]["points"] = 15
                checks["has_readme"]["message"] = "Comprehensive README documentation found"
            else:
                checks["has_readme"]["points"] = 7
                checks["has_readme"]["message"] = "README exists but is minimal"
                suggestions.append("Expand your README with project description, setup instructions, and usage examples")
        else:
            checks["has_readme"]["message"] = "No README file found"
            suggestions.append("Add a README.md explaining your project, how to run it, and what you learned")
        
        # 3. CHECK COMMITS
        commits_url = f"{repo_url}/commits"
        commits_resp = requests.get(commits_url, headers=headers, timeout=10, params={"per_page": 100})
        
        if commits_resp.status_code == 200:
            commits = commits_resp.json()
            
            if commits:
                # Recent activity check
                cutoff_date = datetime.utcnow() - timedelta(days=30)
                try:
                    latest_date = datetime.fromisoformat(
                        commits[0]['commit']['author']['date'].replace('Z', '+00:00')
                    ).replace(tzinfo=None)
                    
                    if latest_date > cutoff_date:
                        checks["recent_activity"]["passed"] = True
                        checks["recent_activity"]["points"] = 20
                        checks["recent_activity"]["message"] = "Active development (commits in last 30 days)"
                    else:
                        days_ago = (datetime.utcnow() - latest_date).days
                        checks["recent_activity"]["points"] = 10
                        checks["recent_activity"]["message"] = f"Last activity was {days_ago} days ago"
                        suggestions.append("Consider making recent commits to show ongoing development")
                except Exception:
                    checks["recent_activity"]["points"] = 10
                    checks["recent_activity"]["message"] = "Could not verify commit dates"
                
                # Multiple commits check
                commit_count = len(commits)
                if commit_count >= 10:
                    checks["multiple_commits"]["passed"] = True
                    checks["multiple_commits"]["points"] = 15
                    checks["multiple_commits"]["message"] = f"Strong commit history ({commit_count}+ commits)"
                elif commit_count >= 5:
                    checks["multiple_commits"]["passed"] = True
                    checks["multiple_commits"]["points"] = 12
                    checks["multiple_commits"]["message"] = f"Good commit history ({commit_count} commits)"
                elif commit_count >= 2:
                    checks["multiple_commits"]["points"] = 7
                    checks["multiple_commits"]["message"] = f"Limited commits ({commit_count})"
                    suggestions.append("Make more incremental commits to show your development process")
                else:
                    checks["multiple_commits"]["message"] = "Only 1 commit found"
                    suggestions.append("Break your work into multiple commits with clear messages")
            else:
                checks["recent_activity"]["message"] = "No commits found"
                checks["multiple_commits"]["message"] = "No commits found"
                suggestions.append("Your repository appears to be empty")
        
        # 4. CHECK CODE FILES
        contents_url = f"{repo_url}/contents"
        contents_resp = requests.get(contents_url, headers=headers, timeout=10)
        
        repo_contents = []
        if contents_resp.status_code == 200:
            repo_contents = contents_resp.json()
            
            # Filter to actual code files
            code_extensions = {'.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', 
                            '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.cs', '.vue', 
                            '.html', '.css', '.scss', '.sass'}
            
            code_files = [f for f in repo_contents if f['type'] == 'file' and 
                         any(f['name'].lower().endswith(ext) for ext in code_extensions)]
            
            # Also check for directories that likely contain code
            code_dirs = [f for f in repo_contents if f['type'] == 'dir' and 
                        f['name'].lower() in {'src', 'app', 'lib', 'components', 'pages', 'api'}]
            
            if code_files or code_dirs:
                checks["has_code"]["passed"] = True
                checks["has_code"]["points"] = 15
                checks["has_code"]["message"] = f"Contains source code ({len(code_files)} files, {len(code_dirs)} directories)"
            elif any(f['type'] == 'file' for f in repo_contents):
                checks["has_code"]["points"] = 7
                checks["has_code"]["message"] = "Files found but no recognized code files"
                suggestions.append("Make sure your main source code files are in the repository")
            else:
                checks["has_code"]["message"] = "No code files found in root directory"
                suggestions.append("Add your project source code to the repository")
        
        # 5. CHECK TESTS
        test_indicators = ['test', 'tests', 'spec', 'specs', '__tests__', 'jest.config', 
                          'pytest.ini', 'test.py', 'test.js', '.test.', '_test.']
        
        has_tests = False
        if repo_contents:
            for item in repo_contents:
                name_lower = item['name'].lower()
                if any(indicator in name_lower for indicator in test_indicators):
                    has_tests = True
                    break
        
        if has_tests:
            checks["has_tests"]["passed"] = True
            checks["has_tests"]["points"] = 10
            checks["has_tests"]["message"] = "Test suite detected"
        else:
            checks["has_tests"]["message"] = "No tests found"
            suggestions.append("Adding tests demonstrates code quality and professional practices")
        
        # 6. TECH STACK MATCHING
        detected_stack = detect_tech_stack(
            repo_data.get('language'),
            repo_contents,
            repo_data
        )
        metadata["detected_stack"] = detected_stack
        
        if module_label:
            matches, matched_techs, expected_techs = match_tech_stack(detected_stack, module_label)
            
            if matches:
                checks["tech_match"]["passed"] = True
                checks["tech_match"]["points"] = 10
                if matched_techs:
                    checks["tech_match"]["message"] = f"Tech stack matches module ({', '.join(matched_techs)})"
                else:
                    checks["tech_match"]["message"] = "Project accepted for this module"
            else:
                checks["tech_match"]["message"] = f"Expected: {', '.join(expected_techs)}, Found: {', '.join(detected_stack) or 'none detected'}"
                suggestions.append(f"This module expects {', '.join(expected_techs)} technologies")
        else:
            # No module label to match against
            checks["tech_match"]["passed"] = True
            checks["tech_match"]["points"] = 10
            checks["tech_match"]["message"] = f"Detected: {', '.join(detected_stack) if detected_stack else 'general project'}"
        
        # Calculate final score
        total_score = sum(check["points"] for check in checks.values())
        passed = total_score >= MINIMUM_SCORE_THRESHOLD
        
        if not passed:
            suggestions.insert(0, f"Score {total_score}/100 is below the minimum threshold of {MINIMUM_SCORE_THRESHOLD}. Please improve your project and try again.")
        
        return {
            "score": min(total_score, max_score),
            "passed": passed,
            "valid": True,
            "checks": checks,
            "suggestions": suggestions,
            "metadata": metadata
        }
        
    except requests.exceptions.Timeout:
        return {
            "score": 0,
            "passed": False,
            "valid": False,
            "checks": checks,
            "suggestions": ["GitHub API timeout. Please try again in a moment."],
            "metadata": metadata
        }
    except requests.exceptions.RequestException as e:
        print(f"[SCORING] GitHub API error: {e}")
        return {
            "score": 0,
            "passed": False,
            "valid": False,
            "checks": checks,
            "suggestions": ["Unable to connect to GitHub. Please check your connection and try again."],
            "metadata": metadata
        }
    except Exception as e:
        print(f"[SCORING] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "score": 0,
            "passed": False,
            "valid": False,
            "checks": checks,
            "suggestions": ["An unexpected error occurred. Please try again or contact support."],
            "metadata": metadata
        }
