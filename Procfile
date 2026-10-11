web: python manage.py migrate --noinput && gunicorn whats_next_backend.wsgi:application --timeout 120 --workers 2
worker: celery -A whats_next_backend worker -l info --concurrency 2
beat: celery -A whats_next_backend beat -l info --schedule .celerybeat-schedule