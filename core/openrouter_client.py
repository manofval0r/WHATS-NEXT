"""
OpenRouter client with a live, verified model cascade.

Why this was rewritten
----------------------
The previous cascade hardcoded three model IDs:

    openrouter/aurora-alpha
    stepfun/step-3.5-flash:free
    nvidia/nemotron-3-nano-30b-a3b:free

None of them exist in OpenRouter's catalogue any more. Every call 404'd,
the cascade always raised, and 100% of AI traffic silently fell through to a
Gemini fallback -- adding six wasted HTTP round-trips and ~3 seconds of
sleep backoff to every generation.

Hardcoded model IDs rot silently, which is the actual bug. Three things
prevent that recurring:

* the IDs below were verified against the live catalogue, and
* ``manage.py check_ai_providers`` re-verifies them on demand, and
* a 429 or 404 is treated as "this model is unavailable right now, try the
  next one" rather than as a fatal error, so a transient upstream limit
  degrades to a working model instead of breaking the product.

Reasoning-token budget
----------------------
Every free model currently in the cascade is a reasoning model: it spends
a large share of its ``max_tokens`` budget on thinking before it emits the
answer. Measured on a real quiz-generation prompt, reasoning consumed
172/215, 358/376 and 566/627 completion tokens respectively. ``max_tokens``
is therefore inflated for reasoning models, and a ``finish_reason`` of
``length`` is treated as a failure rather than silently returning a
truncated JSON document.
"""

import os
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

# Verified live and reachable at cost 0. Ordered best-first: the 120B model
# produced the cleanest JSON at finish_reason="stop"; north-mini-code is
# compact and fast; the 550B ultra is the last resort before gemma.
FREE_MODEL_CASCADE: List[str] = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "cohere/north-mini-code:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
]

# Reasoning models need headroom: on real prompts they spent 80-90% of the
# budget thinking, which truncated the JSON at finish_reason="length".
REASONING_HEADROOM = 3
MIN_REASONING_MAX_TOKENS = 3072

# Status codes meaning "this model is not usable right now, move on".
TRANSIENT_STATUS = {404, 408, 425, 429, 500, 502, 503, 504}


class OpenRouterError(RuntimeError):
    pass


class ModelUnavailable(OpenRouterError):
    """This specific model could not be used; the cascade should continue."""


def _api_key() -> str:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise OpenRouterError("OPENROUTER_API_KEY is missing")
    return key


def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.environ.get("SITE_URL", "http://localhost:8000"),
        "X-Title": os.environ.get("OPENROUTER_APP_NAME", "WHATS-NEXT"),
    }


def list_live_model_ids(timeout: int = 20) -> set:
    """Return the set of model IDs OpenRouter currently serves.

    Used by ``manage.py check_ai_providers`` so a rotated catalogue surfaces
    at deploy time instead of as a production incident.
    """
    resp = requests.get(OPENROUTER_MODELS_URL, headers=_headers(), timeout=timeout)
    resp.raise_for_status()
    return {m["id"] for m in resp.json().get("data", [])}


def _budget_for(max_tokens: int, is_reasoning_model: bool) -> int:
    if not is_reasoning_model:
        return max_tokens
    return max(max_tokens * REASONING_HEADROOM, MIN_REASONING_MAX_TOKENS)


def _is_reasoning_model(model: str) -> bool:
    # Every free model in the current cascade emits reasoning. Keep this
    # explicit rather than pattern-matching so it stays reviewable.
    return True


def chat_completions(
    *,
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    timeout: int = 60,
    retries: int = 1,
) -> str:
    """
    Call OpenRouter Chat Completions and return the assistant content.

    Raises ``ModelUnavailable`` when this model cannot serve the request, so
    the caller can fall through to the next one instead of treating a 429 as
    a hard failure.
    """
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": _budget_for(max_tokens, _is_reasoning_model(model)),
    }

    last_error: Optional[BaseException] = None

    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                OPENROUTER_API_URL,
                headers=_headers(),
                json=payload,
                timeout=timeout,
            )

            if resp.status_code in TRANSIENT_STATUS:
                raise ModelUnavailable(
                    f"{model} returned HTTP {resp.status_code}: "
                    f"{resp.text[:180].strip()}"
                )

            resp.raise_for_status()
            data = resp.json()

            choice = data["choices"][0]
            message = choice.get("message", {}) or {}

            content = (message.get("content") or "").strip()
            if not content:
                content = (message.get("reasoning") or "").strip()

            if not content:
                raise ModelUnavailable(f"{model} returned an empty response")

            # A reasoning model that ran out of budget returns a partial
            # document. Feeding that to a JSON parser produces confusing
            # downstream errors, so treat it as a failure and move on.
            if choice.get("finish_reason") == "length":
                raise ModelUnavailable(
                    f"{model} truncated the response (finish_reason=length); "
                    f"raise max_tokens or use a model with less reasoning overhead"
                )

            return content

        except ModelUnavailable:
            raise  # caller decides what to do; do not burn retries here
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt >= retries:
                break
            time.sleep(1.5 ** attempt)

    raise OpenRouterError(f"OpenRouter request to {model} failed: {last_error}")


def chat_completions_cascade(
    *,
    messages: List[Dict[str, str]],
    models: Optional[List[str]] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    timeout: int = 90,
) -> Tuple[str, str]:
    """
    Try each model in *models* (defaults to ``FREE_MODEL_CASCADE``).

    Returns ``(content, model_used)``. Raises ``OpenRouterError`` only when
    every candidate is exhausted.
    """
    candidates = models or FREE_MODEL_CASCADE
    last_error: Optional[BaseException] = None

    for model in candidates:
        try:
            text = chat_completions(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
                retries=1,
            )
            return text, model
        except OpenRouterError as exc:
            last_error = exc
            continue

    raise OpenRouterError(
        f"All {len(candidates)} models in the cascade failed. "
        f"Last error: {last_error}"
    )