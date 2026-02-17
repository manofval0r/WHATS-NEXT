"""
YouTube video fetcher — module-aware
======================================
Accepts a list of module labels from the user's roadmap and issues one
API call per module (capped) so the returned list is ordered by learning
progression rather than generic relevance.

Falls back to curated static videos when the API key is absent.
"""

from __future__ import annotations

import os
import requests
from dotenv import load_dotenv

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def search_youtube_videos(query, max_results=3):
    """
    Legacy single-query search.

    Kept for backward compat; new code should prefer
    ``fetch_youtube_for_modules``.
    """
    if isinstance(query, list):
        return fetch_youtube_for_modules(query, per_module=max_results)
    return _single_search(query, max_results)


def fetch_youtube_for_modules(
    module_labels: list[str],
    per_module: int = 2,
    limit: int = 30,
) -> list[dict]:
    """
    Fetch YouTube tutorials ordered by module progression.

    Parameters
    ----------
    module_labels : list[str]
        e.g. ["HTML & CSS Foundations", "JavaScript Essentials", ...]
    per_module : int
        Videos per module (default 2).
    limit : int
        Overall max videos returned.

    Returns
    -------
    list[dict]
        Each dict has *title, url, thumbnail, channel, description,
        module_index, module_label, type*.
    """
    if not YOUTUBE_API_KEY:
        return _get_fallback_videos()

    seen_ids: set[str] = set()
    results: list[dict] = []

    for idx, label in enumerate(module_labels):
        if len(results) >= limit:
            break
        videos = _single_search(f"{label} tutorial programming", per_module + 1)
        for vid in videos:
            vid_id = vid['url'].split('v=')[-1] if 'v=' in vid['url'] else vid['url']
            if vid_id in seen_ids:
                continue
            seen_ids.add(vid_id)
            vid['module_index'] = idx
            vid['module_label'] = label
            vid['type'] = 'video'
            results.append(vid)
            if len(results) >= limit:
                break

    return results


# ─── internal helpers ─────────────────────────────────────────────────

def _single_search(query: str, max_results: int = 3) -> list[dict]:
    """Fire one YouTube Data API v3 search request."""
    if not YOUTUBE_API_KEY:
        return _get_fallback_videos()

    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": max_results,
            "key": YOUTUBE_API_KEY,
            "videoDuration": "medium",
            "relevanceLanguage": "en",
            "safeSearch": "strict",
            "order": "relevance",
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        videos: list[dict] = []

        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]
            desc = snippet.get("description", "")

            videos.append({
                "title": snippet["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["medium"]["url"],
                "channel": snippet["channelTitle"],
                "description": (desc[:150] + "...") if len(desc) > 150 else desc,
            })

        return videos

    except requests.exceptions.RequestException as e:
        print(f"[youtube_logic] API error: {e}")
        return []
    except Exception as e:
        print(f"[youtube_logic] Unexpected error: {e}")
        return []


def _get_fallback_videos() -> list[dict]:
    """Curated static videos when no API key is available."""
    return [
        {
            "title": "Learn to Code – for Free | freeCodeCamp.org",
            "url": "https://www.youtube.com/watch?v=zOjov-2OZ0E",
            "thumbnail": "https://img.youtube.com/vi/zOjov-2OZ0E/mqdefault.jpg",
            "channel": "freeCodeCamp.org",
            "description": "Learn to code for free with this comprehensive guide.",
            "module_index": 0,
            "module_label": "Getting Started",
            "type": "video",
        },
        {
            "title": "Harvard CS50 – Full Computer Science University Course",
            "url": "https://www.youtube.com/watch?v=8hly31xKli0",
            "thumbnail": "https://img.youtube.com/vi/8hly31xKli0/mqdefault.jpg",
            "channel": "freeCodeCamp.org",
            "description": "Harvard's Introduction to Computer Science.",
            "module_index": 0,
            "module_label": "Getting Started",
            "type": "video",
        },
        {
            "title": "100+ Computer Science Concepts Explained",
            "url": "https://www.youtube.com/watch?v=-uleG_Vecis",
            "thumbnail": "https://img.youtube.com/vi/-uleG_Vecis/mqdefault.jpg",
            "channel": "Fireship",
            "description": "A quick overview of many CS concepts.",
            "module_index": 0,
            "module_label": "Getting Started",
            "type": "video",
        },
    ]
