import feedparser
from datetime import datetime
import time

def fetch_tech_news(career_target):
    """
    Fetches latest news from Google News RSS based on the user's career.
    """
    # URL encoded query (e.g., "Web Development" -> "Web+Development")
    query = career_target.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}+technology+when:7d&hl=en-NG&gl=NG&ceid=NG:en"
    
    feed = feedparser.parse(rss_url)
    
    news_items = []
    for entry in feed.entries[:8]: # Top 8 items
        # Simple Logic: If user is beginner, filter out complex jargon? 
        # For now, we return specific relevant news.
        
        image = None
        # Google RSS doesn't always give images, so we use a placeholder based on category later
        
        news_items.append({
            "title": entry.title,
            "link": entry.link,
            "source": entry.source.title if hasattr(entry, 'source') else "Tech News",
            "published": entry.published if hasattr(entry, 'published') else "Recently",
            "type": "news"
        })
    return news_items

def fetch_internships(career_target):
    """
    Fetches remote/internship jobs from WeWorkRemotely RSS.
    """
    # WeWorkRemotely RSS Feed
    rss_url = "https://weworkremotely.com/categories/remote-programming-jobs.rss"
    feed = feedparser.parse(rss_url)
    
    jobs = []
    keywords = career_target.lower().split() # e.g. ["web", "developer"]
    
    for entry in feed.entries:
        title = entry.title.lower()
        
        # Filter: Must match user's career AND be entry-level friendly
        # Note: True "Internship" feeds are rare publicly. We filter for "Junior" or generic matches.
        matches_career = any(k in title for k in keywords)
        
        if matches_career:
            is_junior = "junior" in title or "entry" in title or "intern" in title or "associate" in title
            
            jobs.append({
                "title": entry.title,
                "company": "Remote Company", # WWR puts company in title sometimes
                "link": entry.link,
                "is_hot": is_junior, # Tag it as Hot if it's explicitly junior
                "type": "job"
            })
            
    return jobs[:10]