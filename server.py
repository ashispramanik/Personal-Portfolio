"""Portfolio backend (Python standard library only: no pip install needed).
Run from the project folder:  python backend/server.py   ->  http://localhost:8000
"""
import json, mimetypes, os, re, sqlite3, sys, tempfile, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
PUBLIC, DATA = os.path.join(ROOT, 'frontend'), os.path.join(BASE, 'data')  # frontend = HTML/CSS/JS, backend = this Python server
DB = os.path.join(DATA, 'portfolio.db')
CV = os.path.join(PUBLIC, 'Ashis_Pramanik_Resume.pdf')
PORT = int(os.environ.get('PORT', 8000))
for ext, kind in (('.js', 'text/javascript'), ('.css', 'text/css'), ('.json', 'application/json')):
    mimetypes.add_type(kind, ext)  # Windows registry can return wrong types
hits = {}  # ip -> timestamps (5 messages / hour)

def load(name):
    with open(os.path.join(DATA, name), encoding='utf-8') as f:
        return json.load(f)

def init_db():
    global DB
    if '.zip' in BASE.lower():
        sys.exit('Please extract the zip first (right-click the zip > Extract All), '
                 'open the extracted folder in VS Code, then run: python server.py')
    try:
        os.makedirs(DATA, exist_ok=True)
        _create()
    except (sqlite3.OperationalError, OSError):  # folder not writable: use a temp location
        DB = os.path.join(tempfile.gettempdir(), 'portfolio.db')
        print('Data folder is read-only, saving messages to', DB)
        _create()

def _create():
    with sqlite3.connect(DB) as c:
        c.execute('CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, name TEXT, email TEXT, message TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=PUBLIC, **k)

    def reply(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == '/api/profile':
            return self.reply(load('profile.json'))
        if u.path == '/api/projects':
            cat = parse_qs(u.query).get('category', ['All'])[0]
            items = load('projects.json')
            return self.reply(items if cat == 'All' else [p for p in items if p['category'] == cat])
        if u.path == '/api/resume':
            with open(CV, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/pdf')
            self.send_header('Content-Disposition', 'attachment; filename="Ashis_Pramanik_Resume.pdf"')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            return self.wfile.write(data)
        if u.path == '/api/messages':  # only from your own computer
            if self.client_address[0] not in ('127.0.0.1', '::1'):
                return self.reply({'error': 'Not allowed.'}, 403)
            with sqlite3.connect(DB) as c:
                rows = c.execute('SELECT id,name,email,message,created FROM messages ORDER BY id DESC').fetchall()
            return self.reply([dict(zip(('id', 'name', 'email', 'message', 'created'), r)) for r in rows])
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != '/api/contact':
            return self.reply({'error': 'Not found.'}, 404)
        try:
            n = min(int(self.headers.get('Content-Length', 0)), 10_000)
            d = json.loads(self.rfile.read(n) or b'{}')
        except ValueError:
            return self.reply({'error': 'Invalid request.'}, 400)
        name, email, msg = (str(d.get(k, '')).strip() for k in ('name', 'email', 'message'))
        if len(name) < 2: return self.reply({'error': 'Enter your name.'}, 400)
        if not re.match(r'^\S+@\S+\.\S+$', email): return self.reply({'error': 'Enter a valid email address.'}, 400)
        if len(msg) < 10: return self.reply({'error': 'Message must be at least 10 characters.'}, 400)
        ip, now = self.client_address[0], time.time()
        recent = [t for t in hits.get(ip, []) if now - t < 3600]
        if len(recent) >= 5: return self.reply({'error': 'Too many messages. Try again later.'}, 429)
        hits[ip] = recent + [now]
        with sqlite3.connect(DB) as c:
            c.execute('INSERT INTO messages(name,email,message) VALUES(?,?,?)', (name, email, msg[:2000]))
        self.reply({'ok': True})

if __name__ == '__main__':
    init_db()
    print(f'Portfolio running at http://localhost:{PORT}  (Ctrl+C to stop)')
    ThreadingHTTPServer(('', PORT), Handler).serve_forever()
