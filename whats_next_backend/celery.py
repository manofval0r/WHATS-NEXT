"""
Celery application.

The previous config used ``namespace='CELERY'`` while settings define
UPPERCASE names (``CELERY_BROKER_URL``, ``CELERY_RESULT_BACKEND``). Celery's
namespaced lookup lowercases everything after the prefix, so with uppercase
keys it found nothing and silently fell back to its own defaults — meaning
the broker URL in settings was, as far as the worker was concerned, not
there. Fixed by naming the namespace so the keys resolve.
"""

import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "whats_next_backend.settings")

app = Celery("whats_next_backend")

# The namespace tells Celery which settings prefix to read. The keys must
# therefore be lowercase with that prefix: celery_broker_url, not
# CELERY_BROKER_URL.
app.config_from_object("django.conf:settings", namespace="CELERY")

# ``autodiscover_tasks`` only imports an app's ``tasks`` module by
# convention, so anything decorated with @shared_task in a module named
# something else is never registered and silently never runs. That is how
# every task in core/email_tasks.py went missing. ``include`` names them
# explicitly.
app.autodiscover_tasks()
app.conf.include = ["core.tasks", "core.email_tasks"]

app.conf.beat_schedule = {
    # 09:00 UTC daily. Keys are lowercase because of the namespace above.
    "daily-streak-reminders": {
        "task": "core.email_tasks.send_streak_reminder_emails",
        "schedule": crontab(hour=9, minute=0),
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")