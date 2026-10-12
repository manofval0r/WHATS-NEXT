"""
The single-page app fallback.

These exist because the failure this guards against is silent and looks
like a working deployment: the API answers, /api/health/ is green, and the
site itself 404s on every path a visitor would actually type.
"""

from django.test import TestCase
from django.urls import resolve, reverse

from whats_next_backend import settings as project_settings


class SpaRootTests(TestCase):
    def test_root_serves_the_app_shell(self):
        # Not the DRF API index. DefaultRouter contributes a `^$` view of its
        # own, and when it is registered before the SPA fallback "/" serves a
        # browsable JSON listing of every endpoint.
        match = resolve("/")
        self.assertEqual(match.func.__module__, "core.spa")

    def test_deep_links_resolve_to_the_app_shell(self):
        for path in ("/case-study", "/roadmap", "/profile", "/community"):
            with self.subTest(path=path):
                self.assertEqual(resolve(path).func.__module__, "core.spa")

    def test_api_paths_are_not_swallowed(self):
        for path in ("/api/health/", "/api/jobs/match/", "/api/my-roadmap/"):
            with self.subTest(path=path):
                self.assertNotEqual(resolve(path).func.__module__, "core.spa")

    def test_admin_is_not_swallowed(self):
        self.assertTrue(
            resolve("/admin/").func.__module__.startswith("django.contrib.admin"),
            "the SPA fallback swallowed /admin/",
        )

    def test_named_route_exists(self):
        self.assertEqual(reverse("spa_root"), "/")


class SpaResponseTests(TestCase):
    """The fallback needs frontend/dist to exist; when it does not, the
    response has to say what to do rather than raising a 500."""

    def setUp(self):
        self.dist = project_settings.FRONTEND_DIST

    def test_missing_build_explains_itself(self):
        if self.dist.joinpath("index.html").is_file():
            self.skipTest("frontend/dist exists; nothing to assert about the missing build")

        response = self.client.get("/case-study")
        self.assertEqual(response.status_code, 503)
        body = response.content.decode()
        self.assertIn("npm run build", body)
        self.assertIn("build.sh", body)

    def test_missing_asset_is_404_not_the_shell(self):
        # Serving index.html for a missing .png or .js makes the browser try
        # to parse HTML as an image, which reports as a corrupt-image error
        # rather than a missing one.
        if not self.dist.joinpath("index.html").is_file():
            self.skipTest("frontend/dist does not exist")

        response = self.client.get("/assets/definitely-not-here.js")
        self.assertEqual(response.status_code, 404)


class WhitenoiseRootTests(TestCase):
    def test_dist_is_mounted_at_the_site_root(self):
        # Vite emits root-absolute URLs (/assets/..., /figure-locks.html),
        # which collectstatic would rewrite under /static/ and break.
        # WHITENOISE_ROOT mounts the build directory at / instead.
        if not project_settings.FRONTEND_DIST.is_dir():
            self.skipTest("frontend/dist does not exist")
        self.assertEqual(
            project_settings.WHITENOISE_ROOT,
            project_settings.FRONTEND_DIST,
        )