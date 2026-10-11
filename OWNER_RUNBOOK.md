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

### 3.1 Create the services

1. <https://render.com> → **New** → **Web Service** → connect the repo.
2. **Environment:** `Python`, using `.python-version` or Render's default.
3. **Build command:**
   ```
   pip install -r requirements.txt && python manage.py collectstatic --no-input && npm install --prefix frontend && npm run build --prefix frontend
   ```
4. **Start command:**
   ```
   gunicorn whats_next_backend.wsgi:application --timeout 120
   ```
5. **Health check path:** `/api/health/`

> The old `build.sh` never built the frontend at all. If you use Render's
> static-site build instead, set the publish directory to `frontend/dist`.

### 3.2 Add the datastores

1. **Postgres:** *New* → *Postgres*. Copy `DATABASE_URL` from the connection
   string. **Use a paid instance** — the free one self-deletes.
2. **Key Value (Redis):** *New* → *Key Value*. Copy the `REDIS URL`.

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
curl https://<your-api>/api/health/
curl https://<your-api>/api/roles/
```

Then open the frontend, sign up, complete a module, and submit a project.
**Do this yourself before putting the link in your README** — a recruiter who
hits a 500 will not come back.

### 3.6 Pre-deploy check

```powershell
python manage.py check_ai_providers
```

Exits non-zero if a model ID has been removed from OpenRouter or a key has
been revoked. Worth adding to CI so a rotated catalogue fails at deploy time
rather than in production.

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