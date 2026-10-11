"""
Verify the configured AI providers against reality.

    python manage.py check_ai_providers

The class of bug this exists to catch: hardcoded model IDs rot silently.
The original cascade listed three OpenRouter models that no longer exist, so
every generation 404'd, the cascade always failed, and 100% of AI traffic
fell through to a fallback -- with nothing anywhere reporting a problem.

Run this in CI or as a Render pre-deploy check. Exit code 1 on failure so it
actually gates.
"""

import os

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core.openrouter_client import FREE_MODEL_CASCADE, OPENROUTER_API_URL


class Command(BaseCommand):
    help = "Check that configured AI providers and model IDs are live."

    def handle(self, *args, **options):
        failures = []

        self.stdout.write("Checking AI providers...")
        self.stdout.write("")

        openrouter_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

        if not openrouter_key and not gemini_key:
            raise CommandError(
                "No AI provider is configured. Set OPENROUTER_API_KEY or "
                "GEMINI_API_KEY in .env, or the product falls back to static "
                "catalogues with no generation."
            )

        # ---- OpenRouter -------------------------------------------------
        if openrouter_key:
            self.stdout.write(f"  OpenRouter key present ({len(openrouter_key)} chars)")
            try:
                import requests

                resp = requests.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={"Authorization": f"Bearer {openrouter_key}"},
                    timeout=20,
                )
                resp.raise_for_status()
                live = {m["id"] for m in resp.json().get("data", [])}
            except Exception as exc:  # noqa: BLE001
                failures.append(f"OpenRouter model list unreachable: {exc}")
                self.stdout.write(self.style.ERROR("    could not reach model list"))
            else:
                missing = [m for m in FREE_MODEL_CASCADE if m not in live]
                if missing:
                    failures.append(
                        "OpenRouter cascade references models that no longer "
                        f"exist: {', '.join(missing)}. Update "
                        "core.openrouter_client.FREE_MODEL_CASCADE."
                    )
                    self.stdout.write(self.style.ERROR("    stale model IDs:"))
                    for m in missing:
                        self.stdout.write(self.style.ERROR(f"      - {m}"))
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"    all {len(FREE_MODEL_CASCADE)} cascade models are live"
                        )
                    )
        else:
            self.stdout.write(self.style.WARNING("  OpenRouter key missing - skipping"))

        # ---- Gemini -----------------------------------------------------
        if gemini_key:
            self.stdout.write(f"  Gemini key present ({len(gemini_key)} chars)")
            try:
                import requests

                resp = requests.get(
                    "https://generativelanguage.googleapis.com/v1beta/models",
                    params={"key": gemini_key},
                    timeout=20,
                )
                if resp.status_code != 200:
                    failures.append(
                        f"Gemini rejected the key (HTTP {resp.status_code}). "
                        "It may have been revoked."
                    )
                    self.stdout.write(self.style.ERROR(f"    HTTP {resp.status_code}"))
                else:
                    self.stdout.write(self.style.SUCCESS("    key accepted"))
            except Exception as exc:  # noqa: BLE001
                failures.append(f"Gemini unreachable: {exc}")
                self.stdout.write(self.style.ERROR("    unreachable"))
        else:
            self.stdout.write(
                self.style.WARNING("  Gemini key missing - OpenRouter cascade will carry")
            )

        self.stdout.write("")
        if failures:
            for f in failures:
                self.stdout.write(self.style.ERROR(f"FAIL: {f}"))
            raise CommandError(f"{len(failures)} AI provider check(s) failed")

        self.stdout.write(self.style.SUCCESS("All AI provider checks passed."))