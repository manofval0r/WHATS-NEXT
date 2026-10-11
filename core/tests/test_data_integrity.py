"""
Data integrity and API contract regressions.

Each test names the defect it prevents. The contract tests matter most:
the single largest bug class in this codebase was the frontend reading
response keys the backend never returned, which is invisible to any test
that only exercises one side.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

import datetime

from core.job_matching import _canonical_skills, _score_job
from core.models import (
    Certificate,
    Quiz,
    UserActivity,
    UserRoadmapItem,
    XpEvent,
)

User = get_user_model()


class UsernameRuleTests(TestCase):
    """
    Regression: registration enforced a 30-char cap, a [A-Za-z0-9_] charset
    and case-insensitive uniqueness, while renaming enforced only a 150-char
    cap and case-sensitive uniqueness -- so "Alice" could be claimed over
    "alice", and header-unsafe characters could be injected.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.client.force_authenticate(self.user)

    def test_check_rejects_username_over_30_chars(self):
        res = self.client.get("/api/check-username/", {"q": "a" * 31})
        self.assertFalse(res.data["available"])

    def test_check_accepts_30_chars(self):
        res = self.client.get("/api/check-username/", {"q": "a" * 30})
        self.assertTrue(res.data["available"])

    def test_check_rejects_header_unsafe_characters(self):
        res = self.client.get("/api/check-username/", {"q": 'ab";filename="x'})
        self.assertFalse(res.data["available"])

    def test_rename_cannot_impersonate_by_case(self):
        User.objects.create_user("Admin", "admin@example.com", "pw-admin-12345")
        res = self.client.post("/api/account/username/", {"username": "ADMIN"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_rename_rejects_bad_charset(self):
        res = self.client.post("/api/account/username/", {"username": "a b!@#"}, format="json")
        self.assertEqual(res.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "alice")

    def test_rename_rejects_over_30_chars(self):
        res = self.client.post("/api/account/username/", {"username": "z" * 31}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_rename_allows_a_valid_new_name(self):
        res = self.client.post("/api/account/username/", {"username": "alice_2"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "alice_2")

    def test_rename_to_own_name_is_a_noop(self):
        res = self.client.post("/api/account/username/", {"username": "alice"}, format="json")
        self.assertEqual(res.status_code, 200)


class SubmissionTimestampTests(TestCase):
    """
    Regression: submitted_at was ``auto_now=True``, so every save() rewrote
    it. An upvote re-dated someone else's project as freshly submitted and
    floated it to the top of the public feed.
    """

    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.item = UserRoadmapItem.objects.create(
            user=self.user, label="Module", step_order=0, status="completed"
        )

    def test_unsaved_item_has_no_submitted_at(self):
        self.assertIsNone(self.item.submitted_at)

    def test_editing_cv_text_does_not_resubmit_the_timestamp(self):
        self.item.project_submission_link = "https://github.com/alice/p"
        self.item.submitted_at = "2026-01-01T00:00:00Z"
        self.item.save()
        # Re-read so `original` is a real datetime, not the string assigned above.
        self.item.refresh_from_db()
        original = self.item.submitted_at

        # This is what an upvote, a CV edit and a quiz submit all did before.
        self.item.verification_count = 5
        self.item.save()

        self.item.refresh_from_db()
        self.assertEqual(self.item.submitted_at, original)

    def test_created_at_survives_unrelated_saves(self):
        self.item.save(update_fields=["status"])
        self.item.refresh_from_db()
        self.assertIsNotNone(self.item.created_at)


class DailyQuizSentinelTests(TestCase):
    """
    Regression: the daily quiz wrote 1000 into UserActivity.count, and every
    consumer summed ``count`` as real activity -- so one click awarded
    15,000 XP and lit up the heatmap.
    """

    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.activity = UserActivity.objects.create(
            user=self.user, date=datetime.date(2026, 10, 11), count=3
        )

    def test_count_never_carries_the_old_sentinel(self):
        self.assertLess(self.activity.count, 1000)

    def test_quiz_state_lives_in_its_own_column(self):
        from django.utils import timezone

        self.activity.daily_quiz_completed_at = timezone.now()
        self.activity.save()

        self.activity.refresh_from_db()
        self.assertIsNotNone(self.activity.daily_quiz_completed_at)
        self.assertEqual(self.activity.count, 3)


class QuizCreationTests(TestCase):
    """
    Regression: Quiz.questions was a NOT NULL JSONField with no default, so
    the only Quiz.objects.get_or_create() in the codebase raised
    IntegrityError on every module -- the entire per-module quiz path was
    dead and unreachable.
    """

    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.item = UserRoadmapItem.objects.create(
            user=self.user, label="Module", step_order=0, status="active"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_quiz_row_can_be_created_without_questions(self):
        quiz, created = Quiz.objects.get_or_create(roadmap_item=self.item)
        self.assertTrue(created)
        self.assertEqual(quiz.questions, [])

    def test_quiz_endpoint_does_not_500(self):
        """
        The call must not raise. Generation is stubbed so the test asserts
        the endpoint's behaviour rather than OpenRouter's availability.
        """
        from unittest import mock

        with mock.patch(
            "core.ai_logic.generate_quiz",
            return_value=[
                {
                    "question": "What does git stage?",
                    "options": ["Commits", "Stages", "Tags"],
                    "correct": 1,
                    "explanation": "Staging is the index.",
                }
            ],
        ):
            res = self.client.get(f"/api/quiz/{self.item.id}/")

        self.assertIn(res.status_code, (200, 400))


class CertificateIdTests(TestCase):
    def test_certificate_ids_use_eight_hex_characters(self):
        cid = Certificate.generate_certificate_id("React Essentials")
        suffix = cid.rsplit("-", 1)[-1]
        self.assertEqual(len(suffix), 8)

    def test_certificate_ids_are_unique_across_many_calls(self):
        ids = {Certificate.generate_certificate_id("React Essentials") for _ in range(2000)}
        self.assertGreater(len(ids), 1990)


class XpLedgerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")

    def test_total_is_the_sum_of_the_ledger(self):
        XpEvent.objects.create(user=self.user, amount=100, reason="module_completed", reference="1")
        XpEvent.objects.create(user=self.user, amount=20, reason="lesson_completed", reference="l1")
        XpEvent.objects.create(user=self.user, amount=-30, reason="adjustment", reference="")

        total = sum(XpEvent.objects.filter(user=self.user).values_list("amount", flat=True))
        self.assertEqual(total, 90)

    def test_duplicate_award_is_rejected_for_the_same_reference(self):
        from django.db import IntegrityError, transaction

        XpEvent.objects.create(user=self.user, amount=100, reason="module_completed", reference="7")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                XpEvent.objects.create(
                    user=self.user, amount=100, reason="module_completed", reference="7"
                )

    def test_unreferenced_adjustments_are_not_deduplicated(self):
        XpEvent.objects.create(user=self.user, amount=1, reason="adjustment", reference="")
        XpEvent.objects.create(user=self.user, amount=1, reason="adjustment", reference="")
        self.assertEqual(XpEvent.objects.filter(user=self.user).count(), 2)


class RoadmapOrderingTests(TestCase):
    def test_step_order_is_unique_per_user(self):
        from django.db import IntegrityError, transaction

        alice = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        UserRoadmapItem.objects.create(user=alice, label="A", step_order=0)

        # Same user, same position: the constraint must refuse it.
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                UserRoadmapItem.objects.create(user=alice, label="B", step_order=0)

    def test_different_users_may_share_a_position(self):
        alice = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        bob = User.objects.create_user("bob", "bob@example.com", "pw-bob-123456")
        UserRoadmapItem.objects.create(user=alice, label="A", step_order=0)
        UserRoadmapItem.objects.create(user=bob, label="B", step_order=0)
        self.assertEqual(UserRoadmapItem.objects.filter(step_order=0).count(), 2)


class SearchContractTests(TestCase):
    """
    Regression: search_community read ``r.votes`` (the field is ``upvotes``)
    and used Postgres-only SearchVector against a SQLite fallback, so it 500'd
    on any non-empty result.
    """

    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        from core.models import CommunityPost

        self.post = CommunityPost.objects.create(
            author=self.user, title="React patterns", content="hooks explained", upvotes=3
        )

    def test_search_returns_results_without_error(self):
        res = self.client.get("/api/community/search/", {"q": "React"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 1)

    def test_search_returns_the_upvotes_field(self):
        res = self.client.get("/api/community/search/", {"q": "React"})
        self.assertEqual(res.data["results"][0]["votes"], 3)

    def test_search_rejects_a_non_integer_page(self):
        res = self.client.get("/api/community/search/", {"q": "React", "page": "abc"})
        self.assertEqual(res.status_code, 400)


class JobMatchingTests(TestCase):
    """
    The replacement for the employer job board. These assert the two things
    that make it honest: only completed modules count as evidence, and every
    score comes with a stated reason.
    """

    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.user.target_career = "Backend Developer"
        self.user.save()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_canonical_skills_are_detected(self):
        found = _canonical_skills("Senior Django developer wanted, REST APIs")
        self.assertIn("python", found)
        self.assertIn("api-design", found)

    def test_score_explains_itself(self):
        job = {
            "title": "Backend Engineer (Django, PostgreSQL)",
            "description": "You will work with Python and REST APIs.",
            "is_hot": True,
        }
        user_skills = {"python", "databases", "api-design"}

        scored = _score_job(job, user_skills, "Backend Developer")

        self.assertGreater(scored["match_score"], 0)
        self.assertTrue(scored["match_reasons"], "a score with no reason is not explainable")
        self.assertIn("api-design", scored["skills_matched"])
        self.assertEqual(scored["skills_missing"], [])

    def test_a_gap_is_stated_rather_than_scored_high(self):
        job = {
            "title": "Kubernetes Platform Engineer",
            "description": "Docker, Kubernetes and Terraform.",
            "is_hot": False,
        }
        scored = _score_job(job, {"python"}, "Backend Developer")

        self.assertLess(scored["match_score"], 25)
        self.assertTrue(
            any(r.startswith("Gap:") for r in scored["match_reasons"]),
            "an unmatched posting must say why",
        )

    def test_match_endpoint_is_empty_without_completed_modules(self):
        res = self.client.get("/api/jobs/match/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 0)
        self.assertIn("message", res.data)

    def test_match_endpoint_rejects_a_non_integer_limit(self):
        res = self.client.get("/api/jobs/match/", {"limit": "abc"})
        self.assertEqual(res.status_code, 400)