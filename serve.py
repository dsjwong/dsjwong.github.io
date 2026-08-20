#!/usr/bin/env python3
"""
Local preview server.

    python3 serve.py          then open http://localhost:8000

Use this instead of `python3 -m http.server`. The only difference is that it
tells the browser never to cache anything, so a plain refresh always shows
your latest edit. Without that, the browser happily keeps serving you an old
copy of styles.css and it looks like your changes did nothing.

This file is only for local previewing. GitHub Pages does not use it.
"""
import http.server, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCache) as httpd:
    print(f"Serving on http://localhost:{PORT}  (Ctrl-C to stop)")
    httpd.serve_forever()
