# PyForge

Online Python learning platform for engineering students.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
cd pyforge
docker compose up -d postgres redis
```

### 2. Build sandbox image (optional, for NumPy/Matplotlib)

```bash
docker build -t pyforge-runner -f backend/sandbox/Dockerfile.runner backend/sandbox/
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

### 4. Celery worker (separate terminal)

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## Deploy to Vercel (global, frontend only)

See **[frontend/DEPLOY.md](frontend/DEPLOY.md)** for step-by-step instructions (Vercel + Upstash Redis + Pyodide in the browser).

## Features

- **Playground** — Monaco editor with instant Pyodide runs + Docker sandbox for NumPy/Pandas/ML
- **Pre-run analysis** — Predicts common mistakes (e.g. missing quotes in `print()`) before execution
- **Error Guide** — Error type, concepts, suggestions, fixes, and read-aloud explanations
- **Learn tab** — Career path XP, mistake memory, spaced-repetition drills, execution storyboard
- **Notebook cells** — Split scripts with `# %%` markers (Jupyter-style)
- **Plot diagnostics** — Matplotlib/Seaborn tips when plots don't render
- **Courses** — Structured lessons with runnable code cells
- **Exercises** — Auto-graded with hidden test cases
- **Dashboard** — Streaks, learning path, top mistakes to practice
- **AI Copilot** — Claude-powered help (set `ANTHROPIC_API_KEY` in `.env.local`)
- **Share snippets** — Public shareable code URLs
