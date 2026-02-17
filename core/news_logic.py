"""
Resource feed fetchers — news & jobs
=====================================
All functions accept a list of keyword strings (derived from the user's
roadmap module labels) and return deduplicated, chronologically-sorted
lists of dicts.

External sources
-----------------
* **News**: Google News RSS (public, no key required)
* **Jobs**: WeWorkRemotely RSS + Remotive RSS + Hacker News Algolia API
"""

from __future__ import annotations

import re
from datetime import datetime, timezone as dt_tz
from email.utils import parsedate_to_datetime

import feedparser
import requests

# ─── helpers ──────────────────────────────────────────────────────────

def _parse_rfc2822(date_str: str) -> datetime | None:
    """Best-effort parse of RFC-2822 / RSS date strings."""
    if not date_str:
        return None
    try:
        return parsedate_to_datetime(date_str)
    except Exception:
        pass
    for fmt in ('%a, %d %b %Y %H:%M:%S %z', '%a, %d %b %Y %H:%M:%S GMT',
                '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d'):
        try:
            return datetime.strptime(date_str, fmt).replace(tzinfo=dt_tz.utc)
        except Exception:
            continue
    return None


def _dedup_by_key(items: list[dict], key: str = 'link') -> list[dict]:
    """Remove duplicates keeping first occurrence."""
    seen: set[str] = set()
    out: list[dict] = []
    for item in items:
        val = item.get(key, '')
        if val and val not in seen:
            seen.add(val)
            out.append(item)
    return out


def _keyword_batches(keywords: list[str], batch_size: int = 3) -> list[str]:
    """
    Combine keyword list into compact search batches.
    e.g. ["HTML & CSS Foundations", "JavaScript Essentials", "Git"]
    → ["HTML CSS JavaScript", "Git"]
    """
    clean = []
    for kw in keywords:
        words = re.sub(r'[&/()]', ' ', kw).split()
        words = [w for w in words if len(w) > 2 and w.lower() not in
                 {'and', 'the', 'for', 'with', 'basics', 'fundamentals',
                  'essentials', 'introduction', 'deep', 'dive', 'advanced',
                  'project', 'capstone', 'soft', 'skills', 'career',
                  'communication'}]
        if words:
            clean.append(' '.join(words[:2]))

    batches = []
    for i in range(0, len(clean), batch_size):
        batches.append(' '.join(clean[i:i + batch_size]))
    return batches or ['technology programming']


# ─── NEWS ─────────────────────────────────────────────────────────────

def fetch_tech_news(keywords: list[str], career_title: str = '', limit: int = 30) -> list[dict]:
    """
    Fetch tech news from Google News RSS for the given keyword list.
    Returns up to *limit* items sorted newest-first.

    Accepts either:
      - keywords: list[str]  (new API — module labels)
      - keywords: str         (legacy — single career string, auto-wrapped)
    """
    # Legacy compat: if called with a plain string, wrap it
    if isinstance(keywords, str):
        career_title = career_title or keywords
        keywords = [keywords]

    batches = _keyword_batches(keywords)
    if career_title:
        batches.insert(0, career_title.replace(' ', '+'))

    all_items: list[dict] = []

    for query_str in batches[:6]:
        query = query_str.replace(' ', '+')
        rss_url = f"https://news.google.com/rss/search?q={query}+technology+when:7d&hl=en&gl=US&ceid=US:en"
        try:
            feed = feedparser.parse(rss_url)
            for entry in feed.entries[:10]:
                pub_dt = _parse_rfc2822(getattr(entry, 'published', ''))
                all_items.append({
                    'title': entry.title,
                    'link': entry.link,
                    'source': entry.source.title if hasattr(entry, 'source') else 'Tech News',
                    'published': entry.published if hasattr(entry, 'published') else 'Recently',
                    'published_ts': pub_dt.isoformat() if pub_dt else '',
                    'type': 'news',
                })
        except Exception as exc:
            print(f"[news_logic] RSS error for '{query_str}': {exc}")

    items = _dedup_by_key(all_items, 'link')
    items.sort(key=lambda x: x.get('published_ts', ''), reverse=True)
    return items[:limit]


# ─── JOBS ─────────────────────────────────────────────────────────────

def _extract_company_from_title(raw_title: str) -> tuple[str, str]:
    """
    Many RSS feeds embed the company in the title as "Company: Role"
    or "Role at Company". Try to split them.
    """
    if ':' in raw_title:
        parts = raw_title.split(':', 1)
        return parts[0].strip(), parts[1].strip()
    if ' at ' in raw_title.lower():
        idx = raw_title.lower().index(' at ')
        return raw_title[idx + 4:].strip(), raw_title[:idx].strip()
    return 'Remote Company', raw_title.strip()


def _is_entry_level(title: str) -> bool:
    low = title.lower()
    return any(k in low for k in ('junior', 'jr.', 'jr ', 'entry', 'intern',
                                   'associate', 'graduate', 'trainee'))


def _flat_terms(keywords: list[str]) -> set[str]:
    terms = set()
    for kw in keywords:
        terms.update(w.lower() for w in re.sub(r'[&/()]', ' ', kw).split() if len(w) > 2)
    return terms


def _fetch_wwr(keywords: list[str], limit: int = 15) -> list[dict]:
    """WeWorkRemotely RSS."""
    rss_url = 'https://weworkremotely.com/categories/remote-programming-jobs.rss'
    try:
        feed = feedparser.parse(rss_url)
    except Exception:
        return []

    terms = _flat_terms(keywords)
    items: list[dict] = []
    for entry in feed.entries:
        title_low = entry.title.lower()
        if not any(t in title_low for t in terms):
            continue
        pub_dt = _parse_rfc2822(getattr(entry, 'published', ''))
        company, clean_title = _extract_company_from_title(entry.title)
        items.append({
            'title': clean_title or entry.title,
            'company': company,
            'link': entry.link,
            'is_hot': _is_entry_level(entry.title),
            'published': entry.published if hasattr(entry, 'published') else '',
            'published_ts': pub_dt.isoformat() if pub_dt else '',
            'source': 'WeWorkRemotely',
            'type': 'job',
        })
        if len(items) >= limit:
            break
    return items


def _fetch_remotive(keywords: list[str], limit: int = 15) -> list[dict]:
    """Remotive RSS feed for software dev jobs."""
    rss_url = 'https://remotive.com/remote-jobs/software-dev/feed'
    try:
        feed = feedparser.parse(rss_url)
    except Exception:
        return []

    terms = _flat_terms(keywords)
    items: list[dict] = []
    for entry in feed.entries:
        title_low = entry.title.lower()
        if not any(t in title_low for t in terms):
            continue
        pub_dt = _parse_rfc2822(getattr(entry, 'published', ''))
        company, clean_title = _extract_company_from_title(entry.title)
        items.append({
            'title': clean_title or entry.title,
            'company': company,
            'link': entry.link,
            'is_hot': _is_entry_level(entry.title),
            'published': entry.published if hasattr(entry, 'published') else '',
            'published_ts': pub_dt.isoformat() if pub_dt else '',
            'source': 'Remotive',
            'type': 'job',
        })
        if len(items) >= limit:
            break
    return items


def _fetch_hn_jobs(keywords: list[str], limit: int = 10) -> list[dict]:
    """Hacker News job stories via Algolia API."""
    batches = _keyword_batches(keywords, batch_size=4)
    items: list[dict] = []

    for query_str in batches[:3]:
        try:
            resp = requests.get('https://hn.algolia.com/api/v1/search', params={
                'query': query_str,
                'tags': 'job',
                'hitsPerPage': 10,
            }, timeout=8)
            resp.raise_for_status()
            for hit in resp.json().get('hits', []):
                title = hit.get('title') or hit.get('story_title', '')
                if not title:
                    continue
                pub_dt = _parse_rfc2822(hit.get('created_at', ''))
                company, clean_title = _extract_company_from_title(title)
                items.append({
                    'title': clean_title or title,
                    'company': company,
                    'link': hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
                    'is_hot': _is_entry_level(title),
                    'published': hit.get('created_at', ''),
                    'published_ts': pub_dt.isoformat() if pub_dt else '',
                    'source': 'Hacker News',
                    'type': 'job',
                })
        except Exception as exc:
            print(f"[news_logic] HN Algolia error: {exc}")

    return items[:limit]


def fetch_jobs_multi(keywords: list[str], career_title: str = '', limit: int = 30) -> list[dict]:
    """
    Aggregate job listings from multiple free sources.
    Deduplicated by link, sorted newest-first.
    """
    search_kw = list(keywords)
    if career_title:
        search_kw.insert(0, career_title)

    all_jobs: list[dict] = []
    all_jobs.extend(_fetch_wwr(search_kw))
    all_jobs.extend(_fetch_remotive(search_kw))
    all_jobs.extend(_fetch_hn_jobs(search_kw))

    items = _dedup_by_key(all_jobs, 'link')
    items.sort(key=lambda x: x.get('published_ts', ''), reverse=True)
    return items[:limit]


# ── Legacy wrapper for backward compat ────────────────────────────────

def fetch_internships(career_target: str) -> list[dict]:
    """Legacy wrapper — used by old code paths."""
    return fetch_jobs_multi([career_target], career_title=career_target, limit=10)