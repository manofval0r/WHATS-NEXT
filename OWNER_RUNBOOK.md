# Owner Runbook

Everything in this file is something **you** have to do — I can't reach your
accounts. In rough priority order, because the first item is a live exposure
and the rest are prerequisites for going live.

---

## 1. Rotate every leaked credential — do this first

These were published to a **public** GitHub repo for three days (commits
`93ac7aa`, `95f9b62`, `03eb5b6`, removed in `f4d52d4`). Rotation is the only
real fix; scrubbing history does not un-leak them.

### 1.1 Gemini — **already revoked, needs replacing**

`AIzaSyCZBfPZ2IeoJO8xAl_xpP57VoTZiijxIxM`

Verified dead: every Gemini model and the `list-models` endpoint return HTTP 400.

1. Go to <https://aistudio.google.com/apikey>
2. Delete the key with that prefix.
3. Create a new key.
4. Put it in `.env` as `GEMINI_API_KEY=...` and in the Render dashboard.

> You don't strictly need this. The app runs entirely on OpenRouter's free
> tier right now — verified: quiz generation returns 5 well-formed questions
> in 6.4s at $0 cost. Add Gemini only when you want a paid second opinion or
> headroom.

### 1.2 Redis Cloud — **do this one today**

`redis://default:<password>@redis-10106.crce262.us-east-1-1.ec2.cloud.redislabs.com:10106/0`

This is a **password-authenticated endpoint**. Anyone who read the repo has
full access to it.

1. <https://app.redislabs.com> → sign in.
2. Find the database (`redis-10106`).
3. **Delete it.** Don't rotate the password — delete the instance. It was
   only ever used as a Django cache and Celery broker, and it held no
   durable data worth keeping.
4. Create a new instance, or use Render's Key Value instead (step 3.2).
5. Copy the new URL into `CELERY_BROKER_URL`.

> Render's free Key Value tier still exists and now serves Valkey. For a
> portfolio piece that's plenty. **Do not** use Render's *free Postgres* —
> it expires 30 days after creation and is permanently deleted after a
> 14-day grace period.

### 1.3 YouTube Data API key

`AIzaSyAMibMSoC09sV4l9lJWirNyFDAh1PZk68w`

1. <https://console.cloud.google.com/apis/credentials>
2. Delete the key.
3. Create a new one, restricted to the **YouTube Data API v3**.
4. Put it in `YOUTUBE_API_KEY`.

> Watch the quota. Each cold cache fill spends ~100 units **per roadmap
> module** (one `search.list` call per module label), against a 10,000/day
> project quota. A 14-module roadmap is 1,400 units, so ~7 cold users
> exhaust the daily allowance.

### 1.4 OAuth secrets

**Google:**

1. <https://console.cloud.google.com/apis/credentials>
2. Edit the OAuth client → *Delete client secret* → create a new one.
3. Set the redirect URI to `https://<your-api-host>/accounts/google/login/callback/`.

**GitHub:**

1. <https://github.com/settings/developers> → OAuth Apps → your app.
2. *Generate a new client secret* (GitHub shows it exactly once).
3. Set the callback URL to `https://<your-api-host>/accounts/github/login/callback/`.

### 1.5 PostHog

Not urgent — it's a public ingest key by design, and there's no personal data
behind it. Delete the old project if you want a clean slate.

---

## 2. Purge the secrets from git history

The credentials above are still retrievable from history. Rotation (step 1)
is what actually protects you; this reduces future risk and removes 22 real
people's email addresses from a public repo.

```powershell
pip install git-filter-repo

# Back up first — this is irreversible
git branch backup-before-filter

git filter-repo --force `
  --path db.sqlite3 `
  --path node_modules `
  --path .env `
  --path .env.development `
  --invert-paths

git push --force origin main
git push --force origin feat/portfolio-v2
```

Then confirm nothing survived:

```powershell
git log --all --oneline -- .env db.sqlite3
# should print nothing
```

> **Keep the 91 commits.** They show the build journey, which is worth more
> to a reviewer than a tidy single commit. Only the files are being removed.

---

## 3. Render deployment

> **Read this first.** There is now a `render.yaml` in the repository root
> that declares all three services, the database and the Redis instance, with
> the environment variables marked `sync: false` left for you to fill in.
> The fastest path is:
>
> 1. Push the branch, then in Render choose **New → Blueprint**.
> 2. Point it at the repository. Render reads `render.yaml` and creates the
>    web service, the Celery worker, the Celery beat, Postgres and Redis.
> 3. Fill in every `sync: false` variable it lists — `SECRET_KEY`, the SMTP
>    trio, `OPENROUTER_API_KEY`, `FRONTEND_URL`, `POSTHOG_API_KEY`.
> 4. Deploy. `build.sh` installs Python, installs Node, runs `npm ci`,
>    builds the front end, **fails the build if the AI credentials are
>    dead**, collects static files and migrates.
> 5. Set `FRONTEND_URL` to the resulting URL and deploy again, so CORS and
>    `ALLOWED_HOSTS` match. Both are also derived from `RENDER_EXTERNAL_URL`,
>    which Render sets automatically on the web service.
>
> The manual steps below describe the same thing, and are worth reading once
> even if you use the blueprint, because they explain what each setting is
> for.

### 3.1 Create the services

You need **three**, not one. The previous deployment ran only the web
service, so the scheduled jobs and the slow exports had nowhere to run.

| Service | Type | Start command |
| --- | --- | --- |
| `whatsnext-web` | Web Service | `gunicorn whats_next_backend.wsgi:application --timeout 120 --workers 2` |
| `whatsnext-worker` | Background Worker | `celery -A whats_next_backend worker -l info --concurrency 2` |
| `whatsnext-beat` | Background Worker | `celery -A whats_next_backend beat -l info --schedule .celerybeat-schedule` |

For the web service:

1. **Environment:** `Python`, `PYTHON_VERSION` `3.12.11`.
2. **Build command:** `./build.sh`
3. **Health check path:** `/api/health/`

> `build.sh` now builds the front end. The previous version only installed
> Python dependencies and ran `collectstatic`, so every deployment served a
> working API in front of no website at all. The build also runs
> `manage.py check_ai_providers`, which exits non-zero if the OpenRouter key
> is dead or a model id has gone stale — three of them were, and the product
> shipped silently broken because of it.

The front end is served **by Django**, not by a separate static site: the
built `frontend/dist` is mounted at `/` through WhiteNoise's `WHITENOISE_ROOT`,
because Vite emits root-absolute URLs (`/assets/…`, `/figure-locks.html`)
that running through `collectstatic` would rewrite under `/static/` and
break. `core/spa.py` returns `index.html` for any path that is not an API
route, so `/case-study` survives a hard refresh and a shared link. If you
ever deploy the front end separately instead, set `FRONTEND_URL` and add its
origin to `CORS_ALLOWED_ORIGINS` — it is in `.env.example`.

### 3.2 Add the datastores

1. **Postgres:** *New* → *Postgres*. Copy `DATABASE_URL` from the connection
   string. **Use a paid instance** — the free one self-deletes.
2. **Key Value (Redis):** *New* → *Key Value*. Copy the `REDIS URL`.

Both are declared in `render.yaml`. Redis is not optional: with
`CELERY_BROKER_URL` unset, the cache falls back to a per-process local one,
which means the worker and the web service do not share cache state, and the
job-match ranking is recomputed independently on each.

### 3.3 Set the environment variables

Use the values from `.env.example`, plus:

| Variable | Value |
|---|---|
| `DJANGO_SECRET_KEY` | `python -c "from django.core.management.utils import get_random_secret_key as k; print(k()"` |
| `DEBUG` | `false` |
| `FRONTEND_URL` | your deployed frontend URL, no trailing slash |
| `ALLOWED_HOSTS` | your API hostname |
| `CORS_ALLOWED_ORIGINS` | your frontend URL |
| `CSRF_TRUSTED_ORIGINS` | your frontend URL |
| `DATABASE_URL` | from 3.2 |
| `CELERY_BROKER_URL` | from 3.2 |
| `FRONTEND_URL` | **must be set** — share links and emails use it |

`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` and the old hardcoded hostnames are
now all driven by env vars. There is no hostname baked into the code any more.

#### Email and signup — read this before sharing the URL

Two variables, and they interact:

| Variable | Meaning |
| --- | --- |
| `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD` | Real mail transport. Unset means Django's console backend, which prints to stdout. |
| `ACCOUNT_EMAIL_VERIFICATION` | `mandatory` / `optional` / `none`. Leave unset to let it follow `SMTP_HOST`. |

The mail backend is **derived** from `SMTP_HOST`; there is no `EMAIL_BACKEND`
variable to set, and setting one does nothing.

Leave `ACCOUNT_EMAIL_VERIFICATION` unset and it is `mandatory` when `SMTP_HOST`
is set and `optional` when it is not. That is deliberate: the setting was
hardcoded to `mandatory`, and with the console backend allauth blocks sign-in
until the address is confirmed — the confirmation link is printed to stdout,
so **nobody could complete signup at all**. It read as a strict security
setting and behaved as an outage.

Setting it explicitly to `mandatory` while `SMTP_HOST` is unset is **refused at
startup** rather than quietly downgraded. If you turn on SMTP and want
verification, set both together.

So: **a deployed demo with no SMTP is usable** — every visitor can sign up and
click through. Configure SMTP (Resend, Postmark, SES, or Gmail app password)
and verification switches itself on.

### 3.4 Add the worker

The `Procfile` currently starts only `web:`. Add a second Render service
from the same repo:

```
celery -A whats_next_backend worker -l info --concurrency 2
```

and a beat service if you want the streak-reminder email:

```
celery -A whats_next_backend beat -l info
```

### 3.5 Verify before you share the URL

```powershell
curl https://<your-app>/api/health/
curl https://<your-app>/api/roles/
curl -s -o /dev/null -w "%{http_code}" https://<your-app>/case-study
```

The third one must return `200`, not `404`. If it returns 404 the front end
was never built — check that the build command is `./build.sh` and not the
old one-liner. Also open `https://<your-app>/figure-locks.html` directly: it
should draw the lock figure. If that 404s, the build ran but the directory
mount is wrong.

Then open the frontend, sign up, complete a module, and submit a project.
**Do this yourself before putting the link in your README** — a recruiter who
hits a 500 will not come back.

### 3.6 Pre-deploy check

```powershell
python manage.py check_ai_providers
```

Exits non-zero if a model ID has been removed from OpenRouter or a key has
been revoked. `build.sh` runs this, so it is already wired into the deploy;
worth adding to CI as well so a rotated catalogue fails at deploy time rather
than in production.

---

## 4. Decide what to do with the 22 existing accounts

`db.sqlite3` contained 22 real Gmail addresses, 2 Google OAuth identities,
and 120 roadmap items. It's no longer tracked, but the **Render Postgres**
you create will be empty — so the question is whether you want to carry that
data across at all.

**Recommendation: don't.** It's demo data from people who never consented to
being a demo, it's someone's real email address, and a clean database makes
the portfolio piece cleaner to demo.

If you *do* want it, and only if every one of those people agrees:
```
python manage.py loaddata <your-fixture>.json
```
Otherwise leave it. The migration in `0024` already repaired the data
problems in the copy on disk, but that copy is gitignored and local only.

---

## 5. Optional, once the above is green

- **Custom domain** — point a CNAME at Render, add the hostname to
  `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
- **Reset the OAuth app callback URLs** if you changed hostnames (step 1.4).
- **Delete the dead Render services.** The old frontend
  (`whats-next-ate2`) and the dead backend (`whats-next-oxdf`, which no longer
  responds) are still in your account. Clean them up so there's no confusing
  second deployment.

---

## Quick reference — where things are

| Thing | Location |
|---|---|
| All env vars, documented | `.env.example` |
| Local dev | `python manage.py runserver` + `npm run dev --prefix frontend` |
| Tests | `python manage.py test core` — 59 tests, no network required |
| Health check | `curl /api/health/` |
| AI provider check | `python manage.py check_ai_providers` |