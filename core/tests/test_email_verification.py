"""
Email verification configuration.

The bug this pins: ACCOUNT_EMAIL_VERIFICATION was hardcoded to "mandatory".
With no SMTP_HOST the mail backend is Django's console backend, so allauth
sends the confirmation link to stdout, the user never receives it, and
signup cannot be completed by anyone. It looked like a strict security
setting and behaved like an outage.
"""

import importlib
import os
import unittest
from types import SimpleNamespace

from django.core.exceptions import ImproperlyConfigured

import whats_next_backend.settings as settings_module

MANAGED = (
    "SMTP_HOST",
    "ACCOUNT_EMAIL_VERIFICATION",
)


def load_settings(**env):
    """Import settings under a controlled environment, and snapshot the result.

    Reloading mutates the same module object in place, so the live module
    cannot be returned and then restored in a finally block -- restoring
    overwrites the very attributes the caller is about to assert on. The
    values are copied out before the environment is put back.
    """
    saved = {k: os.environ.get(k) for k in MANAGED}
    try:
        for k in MANAGED:
            os.environ.pop(k, None)
        for k, v in env.items():
            os.environ[k] = v
        reloaded = importlib.reload(settings_module)
        return SimpleNamespace(
            ACCOUNT_EMAIL_VERIFICATION=reloaded.ACCOUNT_EMAIL_VERIFICATION,
            EMAIL_BACKEND=reloaded.EMAIL_BACKEND,
        )
    finally:
        for k, v in saved.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
        importlib.reload(settings_module)


class VerificationDefaultsTests(unittest.TestCase):
    def test_no_smtp_means_optional(self):
        # The demo has to be signable-up-able. Mandatory here means the
        # confirmation link goes to stdout and nobody can finish registering.
        s = load_settings()
        self.assertEqual(s.ACCOUNT_EMAIL_VERIFICATION, "optional")
        self.assertEqual(
            s.EMAIL_BACKEND, "django.core.mail.backends.console.EmailBackend"
        )

    def test_smtp_means_mandatory(self):
        # Secure by default wherever the secure setting is possible.
        s = load_settings(SMTP_HOST="smtp.example.com")
        self.assertEqual(s.ACCOUNT_EMAIL_VERIFICATION, "mandatory")
        self.assertEqual(
            s.EMAIL_BACKEND, "django.core.mail.backends.smtp.EmailBackend"
        )

    def test_blank_smtp_host_counts_as_absent(self):
        # SMTP_HOST="" is set-but-empty in a lot of .env files. Treating it as
        # configured would select the SMTP backend against an empty host.
        s = load_settings(SMTP_HOST="   ")
        self.assertEqual(s.ACCOUNT_EMAIL_VERIFICATION, "optional")


class VerificationOverrideTests(unittest.TestCase):
    def test_explicit_optional_is_honoured_with_smtp(self):
        s = load_settings(SMTP_HOST="smtp.example.com", ACCOUNT_EMAIL_VERIFICATION="optional")
        self.assertEqual(s.ACCOUNT_EMAIL_VERIFICATION, "optional")

    def test_explicit_none_is_honoured(self):
        s = load_settings(ACCOUNT_EMAIL_VERIFICATION="none")
        self.assertEqual(s.ACCOUNT_EMAIL_VERIFICATION, "none")

    def test_mandatory_without_smtp_is_refused(self):
        # Not downgraded. Somebody asked for a guarantee the system cannot
        # deliver; starting without it silently is the failure worth refusing.
        with self.assertRaises(ImproperlyConfigured) as ctx:
            load_settings(ACCOUNT_EMAIL_VERIFICATION="mandatory")
        self.assertIn("SMTP_HOST", str(ctx.exception))

    def test_invalid_value_is_refused(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            load_settings(ACCOUNT_EMAIL_VERIFICATION="yes-please")
        self.assertIn("mandatory", str(ctx.exception))


class LiveSettingsTests(unittest.TestCase):
    """Whatever this process actually loaded has to be self-consistent."""

    def test_imported_settings_are_valid(self):
        self.assertIn(
            settings_module.ACCOUNT_EMAIL_VERIFICATION,
            {"mandatory", "optional", "none"},
        )

    def test_mandatory_implies_a_real_transport(self):
        self.assertNotEqual(
            settings_module.ACCOUNT_EMAIL_VERIFICATION,
            "mandatory",
            "this process loaded mandatory verification without SMTP_HOST; "
            "signup cannot be completed",
        )