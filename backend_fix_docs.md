# Backend Configuration Updates

## Summary of Changes
To resolve the "Server is offline or unreachable" error, we have updated the backend configuration to dynamically handle different environments (Local vs. Render).

## New Environment Variables
No new *required* variables, but you can now control CORS via:
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://myapp.com,http://localhost:3000`).

## Automatic Render Configuration
The application now detects if it's running on Render and automatically adds the `RENDER_EXTERNAL_URL` to:
1. `ALLOWED_HOSTS`
2. `CORS_ALLOWED_ORIGINS`
3. `CSRF_TRUSTED_ORIGINS`

This ensures that your deployed app will always trust itself and allow connections to/from its own domain.
