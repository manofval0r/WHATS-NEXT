"""
AI provider cascade, tested without touching the network.

The original bug here was not subtle but it was invisible: three model IDs
had been removed from OpenRouter's catalogue, so the cascade always 404'd,
always raised, and silently handed 100% of traffic to a fallback. Nothing
reported it.

These tests pin the behaviour that makes that failure loud and recoverable:
correct IDs, transient-status handling, truncation detection, and a
headroom budget for reasoning models.
"""

from unittest import mock

from django.test import SimpleTestCase

from core import openrouter_client
from core.openrouter_client import (
    DEFAULT_MODEL,
    FREE_MODEL_CASCADE,
    ModelUnavailable,
    OpenRouterError,
    chat_completions,
    chat_completions_cascade,
)

MESSAGES = [{"role": "user", "content": "hi"}]


def _response(payload, status=200):
    resp = mock.Mock()
    resp.status_code = status
    resp.raise_for_status = mock.Mock(
        side_effect=(
            Exception(f"HTTP {status}") if status >= 400 else None
        )
    )
    resp.json.return_value = payload
    resp.text = str(payload)
    return resp


def _ok(content, finish_reason="stop", reasoning=""):
    return _response(
        {
            "choices": [
                {
                    "message": {"content": content, "reasoning": reasoning},
                    "finish_reason": finish_reason,
                }
            ]
        }
    )


class CascadeConfigurationTests(SimpleTestCase):
    def test_no_model_id_is_empty_or_malformed(self):
        for model in FREE_MODEL_CASCADE:
            self.assertTrue(model)
            self.assertIn("/", model, f"{model} does not look like a model id")
            self.assertNotIn(" ", model)

    def test_default_model_is_in_the_cascade(self):
        """A default outside the cascade means the first call 404s needlessly."""
        self.assertIn(DEFAULT_MODEL, FREE_MODEL_CASCADE)

    def test_cascade_has_no_duplicates(self):
        self.assertEqual(len(FREE_MODEL_CASCADE), len(set(FREE_MODEL_CASCADE)))

    def test_cascade_orders_a_known_good_model_first(self):
        """Verified live at cost 0 with clean JSON and finish_reason=stop."""
        self.assertEqual(FREE_MODEL_CASCADE[0], "nvidia/nemotron-3-super-120b-a12b:free")


class TransientHandlingTests(SimpleTestCase):
    def test_rate_limit_is_treated_as_try_the_next_model(self):
        """A 429 upstream must degrade, not break the product."""
        calls = []

        def fake_post(url, headers=None, json=None, timeout=None):
            model = json["model"]
            calls.append(model)
            if model == FREE_MODEL_CASCADE[0]:
                return _response({"error": "rate limited"}, status=429)
            return _ok("done")

        with mock.patch.object(openrouter_client.requests, "post", side_effect=fake_post):
            content, used = chat_completions_cascade(messages=MESSAGES)

        self.assertEqual(content, "done")
        self.assertEqual(used, FREE_MODEL_CASCADE[1])
        self.assertEqual(calls[0], FREE_MODEL_CASCADE[0])

    def test_missing_model_is_treated_as_try_the_next(self):
        def fake_post(url, headers=None, json=None, timeout=None):
            if json["model"] == FREE_MODEL_CASCADE[0]:
                return _response({"error": "no such model"}, status=404)
            return _ok("recovered")

        with mock.patch.object(openrouter_client.requests, "post", side_effect=fake_post):
            content, _ = chat_completions_cascade(messages=MESSAGES)

        self.assertEqual(content, "recovered")

    def test_all_models_failing_raises_one_clear_error(self):
        with mock.patch.object(
            openrouter_client.requests, "post", return_value=_response({}, status=429)
        ):
            with self.assertRaises(OpenRouterError) as ctx:
                chat_completions_cascade(messages=MESSAGES)

        self.assertIn("cascade failed", str(ctx.exception))


class ResponseHandlingTests(SimpleTestCase):
    def test_reasoning_only_response_is_accepted(self):
        """Reasoning models can return content=None with the answer in reasoning."""
        with mock.patch.object(
            openrouter_client.requests,
            "post",
            return_value=_ok("", finish_reason="stop", reasoning="the answer is 4"),
        ):
            self.assertEqual(chat_completions(messages=MESSAGES, retries=0), "the answer is 4")

    def test_truncated_response_is_a_failure_not_a_partial_string(self):
        """
        A reasoning model that exhausts max_tokens returns a half-written
        JSON document. Passing that to a parser produces a confusing error
        far from the cause.
        """
        with mock.patch.object(
            openrouter_client.requests, "post", return_value=_ok('{"questions": [', finish_reason="length")
        ):
            with self.assertRaises(ModelUnavailable):
                chat_completions(messages=MESSAGES, retries=0)

    def test_fully_empty_response_is_a_failure(self):
        with mock.patch.object(openrouter_client.requests, "post", return_value=_ok("")):
            with self.assertRaises(ModelUnavailable):
                chat_completions(messages=MESSAGES, retries=0)


class TokenBudgetTests(SimpleTestCase):
    def test_reasoning_models_get_headroom(self):
        """
        Measured: reasoning consumed 172/215, 358/376 and 566/627 completion
        tokens on a real prompt, so the caller's budget must be inflated.
        """
        captured = {}

        def fake_post(url, headers=None, json=None, timeout=None):
            captured.update(json)
            return _ok("ok")

        with mock.patch.object(openrouter_client.requests, "post", side_effect=fake_post):
            chat_completions(messages=MESSAGES, max_tokens=1024, retries=0)

        self.assertGreater(captured["max_tokens"], 1024)

    def test_budget_has_a_floor(self):
        """A small request still needs room to think."""
        captured = {}

        def fake_post(url, headers=None, json=None, timeout=None):
            captured.update(json)
            return _ok("ok")

        with mock.patch.object(openrouter_client.requests, "post", side_effect=fake_post):
            chat_completions(messages=MESSAGES, max_tokens=16, retries=0)

        self.assertGreaterEqual(captured["max_tokens"], openrouter_client.MIN_REASONING_MAX_TOKENS)


class MissingKeyTests(SimpleTestCase):
    def test_missing_key_raises_a_clear_error(self):
        with mock.patch.dict(openrouter_client.os.environ, {"OPENROUTER_API_KEY": ""}):
            with self.assertRaises(OpenRouterError) as ctx:
                chat_completions(messages=MESSAGES)

        self.assertIn("OPENROUTER_API_KEY", str(ctx.exception))