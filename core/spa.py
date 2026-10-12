"""
Single-page app fallback.

The front end routes in the browser: /roadmap, /case-study and /profile are
all the same index.html, which then reads the URL. Django resolves /api/*,
/admin/ and /accounts/ against the real patterns registered above this one,
so by the time a request reaches here it is not one of those.

Without this, a hard refresh or a shared link to /case-study returned a 404,
which is the single most common way a deployed SPA announces that it is
half-deployed.
"""

from django.conf import settings
from django.http import FileResponse, HttpResponse
from django.views.decorators.cache import never_cache

NOT_BUILT = """<!doctype html>
<html><head><meta charset="utf-8"><title>Front end not built</title>
<style>
  body { background:#0b0c0e; color:#edeef0; font:15px/1.6 ui-sans-serif,system-ui,sans-serif;
         display:grid; place-items:center; min-height:100vh; margin:0; }
  div { max-width:38rem; padding:2rem; }
  code { font-family:ui-monospace,Menlo,monospace; color:#ff8a3d; }
  h1 { font-size:1.25rem; margin:0 0 .75rem; }
  p  { color:#a8aeb8; margin:.5rem 0; }
</style></head>
<body><div>
  <h1>The front end has not been built</h1>
  <p>The API is running; there is no <code>frontend/dist</code> to serve.</p>
  <p>Run <code>npm ci &amp;&amp; npm run build</code> in <code>frontend/</code>,
     or use <code>./build.sh</code>, which does it before collectstatic.</p>
</div></body></html>
"""


@never_cache
def spa_index(request, path=""):
    index = settings.FRONTEND_DIST / "index.html"

    if not index.is_file():
        return HttpResponse(NOT_BUILT, status=503, content_type="text/html")

    # A missing file request (/favicon.ico, /robots.txt) is a 404, not the
    # app shell: serving index.html for those makes the browser try to parse
    # HTML as an image and reports a confusing error instead.
    if path and "." in path.rsplit("/", 1)[-1]:
        return HttpResponse("Not found", status=404)

    return FileResponse(index.open("rb"), content_type="text/html")