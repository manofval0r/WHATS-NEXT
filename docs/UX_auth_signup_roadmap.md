# Auth & Roadmap UX Audit — Summary

## Context
I attempted to start the dev servers locally but hit PowerShell/npm invocation issues in this environment, so I completed a static code audit and implemented targeted frontend UX fixes in `AuthPage.jsx` to make signup/login validation and messaging clearer.

## What I tested / inspected
- Reviewed `frontend/src/AuthPage.jsx` and related onboarding flows (`Onboarding.jsx`, `AuthCallback.jsx`).
- Reviewed backend roadmap generation endpoints in `core/views.py` (`complete_onboarding`, `/api/my-roadmap/`) and AI logic (`core/ai_logic.py`).

## Key findings ✅
- Password mismatch: the signup submit button was disabled when passwords didn't match, but no field-level message was shown telling the user *why* the button was disabled. Users could be confused why "Launch Roadmap" is unclickable.
- Error messaging: server-side validation (e.g., username/email already exists) was shown in a top banner only. Field-level errors (e.g., username taken) would be more actionable if shown under the relevant input.
- Accessibility: banners lacked `role`/`aria-live` attributes so screen-readers may not announce them reliably.
- Roadmap generation flow: after signup the frontend navigates to `/dashboard` and the dashboard calls `/api/my-roadmap/` which will generate a roadmap if none exists. Generation is synchronous and falls back to a safe fallback if the AI or API fails.

## Changes I implemented 🔧
(Committed to `frontend/src/AuthPage.jsx`)
- Added `fieldErrors` state to store field-level errors.
- Clear field-specific errors on user input.
- Added real-time `passwordMismatch` detection and an inline error message under the Confirm Password field.
- Added `getDisabledReason()` to compute specific disabled tooltip text for the submit button (e.g., "Passwords do not match" or "Please fill in all required fields") and displayed that message under the button when disabled.
- Map backend username/email validation responses into `fieldErrors` so messages appear under the corresponding inputs.
- Made `ErrorBanner` and `SuccessBanner` accessible by adding `role` and `aria-live` attributes.

Files updated:
- `frontend/src/AuthPage.jsx` (UX + accessibility improvements)

## Recommended follow-up / tests 🧪
1. Manual browser tests (high priority):
   - Sign up with mismatched passwords: confirm the inline message appears immediately and button is disabled with a clear helper text.
   - Sign up with an already-used username/email: confirm the error appears under the relevant input (not just a banner).
   - Complete a successful signup: ensure redirect to `/dashboard` and that the dashboard triggers `/api/my-roadmap/` (roadmap generation); validate nodes appear.
   - Simulate AI failures (e.g., set `GEMINI_API_KEY` empty) and confirm the fallback roadmap is returned and the user gets a friendly message if generation fails.

2. Automated tests to add (medium priority):
   - Frontend unit tests (Jest/React Testing Library or Vitest):
     - `AuthPage` shows password mismatch inline error and disables submit with appropriate helper text.
     - `AuthPage` maps backend field errors to field-level messages.
   - Backend tests (Django tests):
     - `complete_onboarding` returns 200 and creates `UserRoadmapItem` objects when AI returns valid modules (mock the AI call).
     - `complete_onboarding` returns friendly error messages when AI or DB errors occur (mock timeouts / exceptions).
   - Integration test: sign up -> login -> call `/api/my-roadmap/` and assert nodes returned (mock AI endpoint to deterministic response).

3. UX suggestions (nice to have):
   - Consider showing a small inline helper tooltip when hovering a disabled button (or a small callout below) as implemented.
   - Keep top banner for server/server-side errors and use field-level messages for input validation.
   - Add `aria-invalid` for invalid inputs and ensure keyboard focus moves to the first invalid field on submit attempt.

## How you can reproduce locally
1. Backend
   - Activate project venv: `venv\Scripts\activate` (Windows)
   - Install: `pip install -r requirements.txt` (if not already installed)
   - Run migrations: `python manage.py migrate`
   - Start server: `python manage.py runserver`

2. Frontend
   - cd into `frontend`
   - `npm ci` (or `npm install`)
   - `npm run dev`

3. Run tests (if added)
   - Frontend: add test runner (Vitest/Jest) and run `npm test`.
   - Backend: `python manage.py test`.

---
If you'd like, I can:
- Add a small React test (Vitest + React Testing Library) for the `AuthPage` inline password validation, or
- Add Django unit tests for `complete_onboarding` and `get_my_roadmap` with mocked AI responses, or
- Continue debugging and get the dev servers running locally in your environment.

Tell me which follow-up you prefer and I'll proceed. 🚀
