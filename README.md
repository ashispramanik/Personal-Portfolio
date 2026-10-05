# Ashis Pramanik | Personal Portfolio

A full-stack personal portfolio. **Python** is the backend and **HTML, CSS and JavaScript** are the frontend. The backend uses only Python's standard library, so there is nothing to install with `pip`.

> Built with AI assistance and customized by me.

## Features

- Animated hero section: letter-by-letter name reveal, typing role loop, floating photo
- Drifting network-node canvas background
- Ten projects with category filters and tilt-on-hover cards
- Separate sections for Experience, Education (B.Tech, Diploma, Class 10), Certifications and Activities
- One-click resume download
- Contact form with server-side validation and a rate limit, saved to SQLite
- Responsive layout, automatic dark and light theme, `prefers-reduced-motion` support
- All content lives in JSON files, so editing text never touches the code

## Architecture

```
 Browser (frontend)                    Python server (backend)
┌─────────────────────┐   HTTP/JSON   ┌──────────────────────────┐
│ index.html          │ ────────────► │ GET  /api/profile        │──► data/profile.json
│ style.css           │               │ GET  /api/projects       │──► data/projects.json
│ app.js (fetch API)  │ ◄──────────── │ GET  /api/resume         │──► frontend/*.pdf
│                     │               │ POST /api/contact        │──► data/portfolio.db (SQLite)
└─────────────────────┘               │ GET  /api/messages (local only)
                                      └──────────────────────────┘
```

The backend serves the static files in `frontend/` and exposes a small JSON API. On load, `app.js` requests `/api/profile` and `/api/projects`, then builds the page from the response.

## Project structure

```
portfolio-fullstack/
├── backend/
│   ├── server.py              # Python server + API (standard library only)
│   └── data/
│       ├── profile.json       # summary, skills, experience, education, certifications
│       ├── projects.json      # project list
│       └── portfolio.db       # created automatically on first run (git-ignored)
├── frontend/
│   ├── index.html             # page structure
│   ├── style.css              # design, themes, responsive rules
│   ├── app.js                 # animations, API calls, filters, contact form
│   ├── ashis.jpg              # profile photo
│   └── Ashis_Pramanik_Resume.pdf
├── .gitignore
└── README.md
```

## Requirements

- Python 3.8 or newer (`python --version` to check)
- A modern browser (Chrome, Edge, Firefox, Safari)

## Run it

From the project root (the folder that contains `backend/` and `frontend/`):

**Windows**
```powershell
python backend/server.py
# if "python" is not recognized:
py backend/server.py
```

**macOS / Linux**
```bash
python3 backend/server.py
```

Then open **http://localhost:8000**. Stop the server with `Ctrl + C`.

### Use a different port

**Windows (PowerShell)**
```powershell
$env:PORT=3000; python backend/server.py
```

**Windows (Command Prompt)**
```bat
set PORT=3000 && python backend/server.py
```

**macOS / Linux**
```bash
PORT=3000 python3 backend/server.py
```

### Optional: virtual environment

Not required, since there are no dependencies, but it keeps your setup tidy:

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
python backend/server.py
```

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Profile, skills, experience, education, certifications |
| GET | `/api/projects` | All projects |
| GET | `/api/projects?category=Security` | Projects filtered by category |
| GET | `/api/resume` | Downloads the resume PDF |
| POST | `/api/contact` | Saves a message (`name`, `email`, `message` as JSON) |
| GET | `/api/messages` | Lists saved messages (only from your own computer) |

Test from the terminal:

```bash
curl http://localhost:8000/api/profile
curl "http://localhost:8000/api/projects?category=Security"
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello, this is a test."}'
curl http://localhost:8000/api/messages
```

On Windows PowerShell, use `curl.exe` instead of `curl`, and put the JSON in a file if quoting causes trouble.

**Contact form rules:** name of at least 2 characters, a valid email, a message of at least 10 characters (cut to 2000), and at most 5 messages per hour per IP address.

## Customize

| To change | Edit |
|-----------|------|
| Summary, skills, experience, education, certifications, contact details | `backend/data/profile.json` |
| Projects | `backend/data/projects.json` |
| Colors and design | the `:root` variables at the top of `frontend/style.css` |
| Photo | replace `frontend/ashis.jpg` |
| Resume | replace `frontend/Ashis_Pramanik_Resume.pdf` (keep the file name) |

Save the file and refresh the browser. JSON changes need no server restart. Changes to `server.py` do: press `Ctrl + C` and run it again.

## Push to GitHub

Create an empty repository on github.com first, then from the project root:

```bash
git init
git add .
git commit -m "Add portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

The included `.gitignore` keeps the contact message database out of the repository. Check with `git status` before committing.

## Deploy

GitHub Pages hosts only static files, so it cannot run the Python backend. Use a host that runs Python, such as Render, Railway or PythonAnywhere:

- Start command: `python backend/server.py`
- The server reads the `PORT` environment variable
- Free tiers may not keep `portfolio.db` between restarts

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `python is not recognized` | Install Python from python.org and tick **Add Python to PATH**, or use `py` |
| `Address already in use` | Another program uses port 8000. Use a different `PORT` as shown above |
| Blank page or no content | Open it through `http://localhost:8000`, not by double-clicking `index.html`, because the page needs the API |
| Old version still showing | Hard refresh with `Ctrl + F5` |
| Told to extract the zip | Right-click the zip, choose **Extract All**, and run it from the extracted folder |

## Tech stack

Python 3 (`http.server`, `sqlite3`, `json`), HTML5, CSS3, vanilla JavaScript, Canvas API, Google Fonts.

## Author

**Ashis Pramanik** — B.Tech in Computer Science and Engineering
ashispramanik011@gmail.com
