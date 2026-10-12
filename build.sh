#!/usr/bin/env bash
#
# Render build command. Two installs, then collect, then migrate.
#
# The previous version of this file installed Python dependencies and ran
# collectstatic, and nothing else -- so the deployment served the API with
# no front end behind it and every non-/api path 404'd. Vite has to run.
set -o errexit
set -o pipefail

echo "==> Python dependencies"
pip install --disable-pip-version-check -r requirements.txt

echo "==> Front end"
cd frontend
# `npm ci` rather than `npm install`: it installs exactly the lockfile and
# fails if package.json and the lockfile have drifted, which is what should
# happen in CI.
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  echo "    no package-lock.json; falling back to npm install"
  npm install --no-audit --no-fund
fi
npm run build
cd ..

# The AI credentials are checked here rather than at runtime. All three
# hard-coded model ids in the previous build were dead and a revoked Gemini
# key returned HTTP 400 for every model, so the product shipped looking fine
# and failing on first use. This exits the build instead.
echo "==> AI provider check"
python manage.py check_ai_providers

echo "==> Static files"
python manage.py collectstatic --no-input

echo "==> Migrations"
python manage.py migrate --noinput