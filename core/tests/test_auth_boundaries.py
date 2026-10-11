"""
Authorization boundaries.

Every test here corresponds to a defect that was live before the portfolio
rebuild. They are written as "this must be refused" rather than "this must
return 200" so a regression fails loudly.

Run with:  python manage.py test core
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import CommunityPost, CommunityReply, UserRoadmapItem

User = get_user_model()


class AuthBoundaryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user("alice", "alice@example.com", "pw-alice-1234")
        self.bob = User.objects.create_user("bob", "bob@example.com", "pw-bob-123456")

        self.alice_item = UserRoadmapItem.objects.create(
            user=self.alice, label="Git & Version Control", step_order=0, status="completed"
        )
        self.alice_item.project_submission_link = "https://github.com/alice/project"
        self.alice_item.submitted_at = "2026-01-01T00:00:00Z"
        self.alice_item.save()

        self.bob_item = UserRoadmapItem.objects.create(
            user=self.bob, label="Private Work", step_order=0, status="completed"
        )
        self.bob_item.project_submission_link = "https://github.com/bob/secret"
        self.bob_item.submitted_at = "2026-01-01T00:00:00Z"
        self.bob_item.save()

    # ── Community post / reply ownership ─────────────────────────────────

    def test_cannot_patch_another_users_post(self):
        """Regression: ModelViewSet inherited update from an unscoped queryset."""
        post = CommunityPost.objects.create(author=self.alice, title="Mine", content="x")
        self.client.force_authenticate(self.bob)

        res = self.client.patch(
            reverse("community-post-detail", args=[post.id]),
            {"title": "Hijacked"},
            format="json",
        )

        self.assertIn(res.status_code, (403, 404))
        post.refresh_from_db()
        self.assertEqual(post.title, "Mine", "another user rewrote the post")

    def test_cannot_delete_another_users_post(self):
        post = CommunityPost.objects.create(author=self.alice, title="Mine", content="x")
        self.client.force_authenticate(self.bob)

        res = self.client.delete(reverse("community-post-detail", args=[post.id]))

        self.assertIn(res.status_code, (403, 404))
        self.assertTrue(CommunityPost.objects.filter(pk=post.pk).exists())

    def test_cannot_patch_another_users_reply(self):
        post = CommunityPost.objects.create(author=self.alice, title="Q", content="q")
        reply = CommunityReply.objects.create(post=post, author=self.alice, content="answer")
        self.client.force_authenticate(self.bob)

        res = self.client.patch(
            reverse("community-reply-detail", args=[reply.id]),
            {"content": "tampered"},
            format="json",
        )

        self.assertIn(res.status_code, (403, 404))
        reply.refresh_from_db()
        self.assertEqual(reply.content, "answer")

    def test_author_can_still_edit_own_post(self):
        """The permission must not be a blanket deny."""
        post = CommunityPost.objects.create(author=self.alice, title="Mine", content="x")
        self.client.force_authenticate(self.alice)

        res = self.client.patch(
            reverse("community-post-detail", args=[post.id]),
            {"title": "Updated"},
            format="json",
        )

        self.assertEqual(res.status_code, 200)
        post.refresh_from_db()
        self.assertEqual(post.title, "Updated")

    def test_anonymous_cannot_create_post(self):
        res = self.client.post(
            reverse("community-post-list"), {"title": "t", "content": "c"}, format="json"
        )
        self.assertEqual(res.status_code, 401)

    # ── Comment IDOR ─────────────────────────────────────────────────────

    def test_cannot_read_comments_on_another_users_private_module(self):
        """Regression: get_object_or_404(UserRoadmapItem, id=...) had no owner filter."""
        self.bob.profile_visibility = "private"
        self.bob.save()
        self.client.force_authenticate(self.alice)

        res = self.client.get(f"/api/community/comments/{self.bob_item.id}/")

        self.assertEqual(res.status_code, 404)

    def test_cannot_comment_on_another_users_locked_module(self):
        locked = UserRoadmapItem.objects.create(
            user=self.bob, label="Locked Module", step_order=1, status="locked"
        )
        self.client.force_authenticate(self.alice)

        res = self.client.post(
            f"/api/community/comments/{locked.id}/create/",
            {"text": "hello"},
            format="json",
        )

        self.assertEqual(res.status_code, 404)

    def test_can_comment_on_another_users_public_completed_module(self):
        self.client.force_authenticate(self.alice)

        res = self.client.post(
            f"/api/community/comments/{self.alice_item.id}/create/",
            {"text": "nice work"},
            format="json",
        )

        self.assertEqual(res.status_code, 201)

    def test_owner_can_always_comment_on_own_module(self):
        self.bob.profile_visibility = "private"
        self.bob.save()
        self.client.force_authenticate(self.bob)

        res = self.client.post(
            f"/api/community/comments/{self.bob_item.id}/create/",
            {"text": "self"},
            format="json",
        )

        self.assertEqual(res.status_code, 201)

    # ── verify_project scoping and reputation ────────────────────────────

    def test_cannot_verify_a_locked_module(self):
        """Regression: any UserRoadmapItem id was accepted, including locked ones."""
        locked = UserRoadmapItem.objects.create(
            user=self.bob, label="Locked", step_order=1, status="locked"
        )
        self.client.force_authenticate(self.alice)

        res = self.client.post(
            f"/api/community/verify/{locked.id}/", {"vote_type": "up"}, format="json"
        )

        self.assertEqual(res.status_code, 404)

    def test_cannot_verify_a_module_with_no_submission(self):
        unsubmitted = UserRoadmapItem.objects.create(
            user=self.bob, label="Done", step_order=1, status="completed"
        )
        self.client.force_authenticate(self.alice)

        res = self.client.post(
            f"/api/community/verify/{unsubmitted.id}/", {"vote_type": "up"}, format="json"
        )

        self.assertEqual(res.status_code, 404)

    def test_cannot_verify_own_work(self):
        self.client.force_authenticate(self.alice)
        res = self.client.post(
            f"/api/community/verify/{self.alice_item.id}/", {"vote_type": "up"}, format="json"
        )
        self.assertEqual(res.status_code, 400)

    def test_reputation_is_withdrawn_when_vote_is_removed(self):
        """
        Regression: +10 was granted on create and never taken back, so
        up -> toggle off -> up paid out forever.
        """
        url = f"/api/community/verify/{self.alice_item.id}/"
        self.client.force_authenticate(self.bob)

        self.client.post(url, {"vote_type": "up"}, format="json")
        self.alice.refresh_from_db()
        self.assertEqual(self.alice.reputation_score, 10)

        self.client.post(url, {"vote_type": "up"}, format="json")  # toggle off
        self.alice.refresh_from_db()
        self.assertEqual(
            self.alice.reputation_score, 0, "reputation survived the vote being removed"
        )

    def test_reputation_is_settled_when_vote_flips(self):
        """
        Flipping up -> down must withdraw the original +10.

        Net is 0, not -10: only upvotes pay out, so a downvote adds nothing.
        The point is that the +10 is reversed rather than left behind.
        """
        url = f"/api/community/verify/{self.alice_item.id}/"
        self.client.force_authenticate(self.bob)

        self.client.post(url, {"vote_type": "up"}, format="json")
        res = self.client.post(url, {"vote_type": "down"}, format="json")

        self.assertEqual(res.status_code, 200)
        self.alice.refresh_from_db()
        self.assertEqual(
            self.alice.reputation_score, 0, "the original +10 survived the flip"
        )

        # And flipping back up pays exactly once more, never compounding.
        self.client.post(url, {"vote_type": "up"}, format="json")
        self.alice.refresh_from_db()
        self.assertEqual(self.alice.reputation_score, 10)

    def test_verification_does_not_clobber_concurrent_module_state(self):
        """A vote must not rewrite status/github_score via a full-row save."""
        self.alice_item.github_score = 88
        self.alice_item.save()
        self.client.force_authenticate(self.bob)

        self.client.post(
            f"/api/community/verify/{self.alice_item.id}/", {"vote_type": "up"}, format="json"
        )

        self.alice_item.refresh_from_db()
        self.assertEqual(self.alice_item.github_score, 88)
        self.assertEqual(self.alice_item.status, "completed")
        self.assertEqual(self.alice_item.verification_count, 1)

    # ── Public profile must not leak subscription state ───────────────────

    def test_public_profile_does_not_expose_plan_tier(self):
        res = self.client.get(f"/api/profile/{self.alice.username}/")
        self.assertEqual(res.status_code, 200)
        self.assertNotIn("plan_tier", res.data)
        self.assertNotIn("premium_waitlist_status", res.data)