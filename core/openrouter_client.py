import os
import time
from typing import Any, Dict, List, Optional

import requests

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemma-3-27b-it:free"

# Ordered list of free models to try when the caller uses `chat_completions_cascade`.
FREE_MODEL_CASCADE = [
    "google/gemma-3-27b-it:free",
    "deepseek/deepseek-r1-0528:free",
]


class OpenRouterError(RuntimeError):
    pass


def chat_completions(
    *,
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    timeout: int = 60,
    retries: int = 2,
) -> str:
    """Call OpenRouter Chat Completions and return the assistant message content.

    Uses OPENROUTER_API_KEY from the environment.
    """

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise OpenRouterError("OPENROUTER_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Optional but helps OpenRouter attribute traffic.
        "HTTP-Referer": os.environ.get("SITE_URL", "https://whatsnext.dev"),
        "X-Title": os.environ.get("OPENROUTER_APP_NAME", "What's Next"),
    }

    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    last_error: Optional[BaseException] = None
    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload,
                timeout=timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            content = (data["choices"][0]["message"].get("content") or "").strip()
            # Reasoning models (e.g. DeepSeek R1) may return empty content.
            # In that case, fall back to the reasoning text if available.
            if not content:
                reasoning = data["choices"][0]["message"].get("reasoning", "")
                if reasoning:
                    content = reasoning.strip()
            if not content:
                raise OpenRouterError(f"Empty response from {model}")
            return content
        except Exception as e:
            last_error = e
            if attempt >= retries:
                break
            backoff = 1.5 ** attempt
            time.sleep(backoff)

    raise OpenRouterError(f"OpenRouter request failed: {last_error}")


def chat_completions_cascade(
    *,
    messages: List[Dict[str, str]],
    models: Optional[List[str]] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    timeout: int = 90,
) -> tuple:
    """Try each model in *models* (defaults to FREE_MODEL_CASCADE) until one
    succeeds.  Returns ``(content, model_used)``.
    """
    models = models or FREE_MODEL_CASCADE
    last_error: Optional[BaseException] = None
    for model in models:
        try:
            print(f"[AI] Trying OpenRouter model: {model}")
            text = chat_completions(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
                retries=1,
            )
            print(f"[AI] Success with {model}")
            return text, model
        except OpenRouterError as e:
            print(f"[AI] {model} failed: {e}")
            last_error = e
    raise OpenRouterError(f"All free models failed. Last error: {last_error}")
