import os
import requests
from dotenv import load_dotenv

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def search_youtube_videos(query, max_results=3):
    """
    Search YouTube for educational videos related to the query.
    
    Args:
        query: Search term (e.g., "Python basics", "React hooks")
        max_results: Number of videos to return (default 3)
    
    Returns:
        List of video dictionaries with title, url, thumbnail, channel
        Returns empty list if API key not set or request fails
    """
    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY not set in .env file")
        return _get_fallback_videos()
    
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": f"{query} tutorial programming",
            "type": "video",
            "maxResults": max_results,
            "key": YOUTUBE_API_KEY,
            "videoDuration": "medium",  # 4-20 minutes (good for tutorials)
            "relevanceLanguage": "en",
            "safeSearch": "strict",
            "order": "relevance"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        videos = []
        
        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]
            
            videos.append({
                "title": snippet["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["medium"]["url"],
                "channel": snippet["channelTitle"],
                "description": snippet["description"][:150] + "..." if len(snippet["description"]) > 150 else snippet["description"]
            })
        
        return videos
        
    except requests.exceptions.RequestException as e:
        print(f"YouTube API Error: {e}")
        return _get_fallback_videos()
    except Exception as e:
        print(f"Unexpected error in YouTube search: {e}")
        return _get_fallback_videos()

def _get_fallback_videos():
    """Returns a static list of high-quality coding videos."""
    return [
        {
            "title": "Learn to Code - for Free | freeCodeCamp.org",
            "url": "https://www.youtube.com/watch?v=zOjov-2OZ0E",
            "thumbnail": "https://img.youtube.com/vi/zOjov-2OZ0E/mqdefault.jpg",
            "channel": "freeCodeCamp.org",
            "description": "Learn to code for free with this comprehensive guide."
        },
        {
            "title": "Harvard CS50 – Full Computer Science University Course",
            "url": "https://www.youtube.com/watch?v=8hly31xKli0",
            "thumbnail": "https://img.youtube.com/vi/8hly31xKli0/mqdefault.jpg",
            "channel": "freeCodeCamp.org",
            "description": "Harvard's Introduction to Computer Science."
        },
        {
            "title": "100+ Computer Science Concepts Explained",
            "url": "https://www.youtube.com/watch?v=-uleG_Vecis",
            "thumbnail": "https://img.youtube.com/vi/-uleG_Vecis/mqdefault.jpg",
            "channel": "Fireship",
            "description": "A quick overview of many CS concepts."
        }
    ]
