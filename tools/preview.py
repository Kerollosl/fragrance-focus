"""Serve only this extension directory, never the user's home directory."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
root = Path(__file__).resolve().parent.parent
print('Fragrance Focus preview: http://127.0.0.1:8794/tools/preview.html', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8794), partial(SimpleHTTPRequestHandler, directory=str(root))).serve_forever()
