# Track My DSA — Local Setup

Two processes + one database. Run each in its own terminal.

## Prerequisites

- **Node 20+** with **npm**
- **Python 3.11+**
- **Docker** (for Postgres)

## 1 · Start Postgres

```bash
docker compose up -d
```

This launches Postgres 16 on `localhost:5432` with user/pass `trackmydsa` / `trackmydsa`. Data persists in a named volume (`trackmydsa_pgdata`).

## 2 · Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env             # one-time, no edits needed for local dev
alembic upgrade head             # creates / migrates the database schema
python -m app.seed               # seeds topics & questions
uvicorn app.main:app --reload --port 8000
```

The API is now at <http://localhost:8000> with auto-generated docs at <http://localhost:8000/docs>.

Re-running `python -m app.seed` is **idempotent** — safe to run after pulling new questions.

## 3 · Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Project layout

```
Track-My-DSA/
├── backend/          # FastAPI + SQLAlchemy (replaces Section 4/9 of the spec)
│   ├── app/
│   │   ├── main.py            # FastAPI app + routers
│   │   ├── models.py          # SQLAlchemy schema (mirrors Prisma schema in spec)
│   │   ├── schemas.py         # Pydantic request/response types
│   │   ├── database.py        # session + engine
│   │   ├── auth.py            # dev-mode: single demo user
│   │   ├── topics_data.py     # 17 topic definitions
│   │   ├── questions_data.py  # ~145 NeetCode questions
│   │   ├── seed.py            # idempotent seed runner
│   │   └── routers/           # topics, questions, progress, notes, stats
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/         # Next.js 14 App Router + Tailwind + shadcn-style UI
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx          # sidebar shell
│   │   │   │   ├── page.tsx            # Dashboard
│   │   │   │   ├── roadmap/page.tsx
│   │   │   │   └── topic/[slug]/page.tsx
│   │   │   ├── layout.tsx              # root (Inter + JetBrains Mono)
│   │   │   └── globals.css
│   │   ├── components/   # ui/, layout/, dashboard/, topic/
│   │   ├── hooks/use-dsa.ts      # React Query hooks
│   │   ├── lib/api.ts                  # typed fetch client → backend
│   │   ├── stores/ui.store.ts          # Zustand (sidebar/theme)
│   │   └── types/                      # shared TS types
│   ├── tailwind.config.ts              # design system from spec §3
│   └── .env.local.example
│
├── docker-compose.yml      # Postgres only
└── README.md               # original product spec
```

## What's built (Phase 1)

- ✅ Project scaffold (Next.js 14 + Tailwind + Python FastAPI)
- ✅ DB schema mirroring the Prisma spec (User, Topic, Question, Progress, Note, StudySession)
- ✅ Seed data: 17 topics, ~145 NeetCode questions
- ✅ Sidebar + top-nav layout shell
- ✅ Dashboard (stats cards, next-up card, topic progress grid, 12-week heatmap)
- ✅ Roadmap (vertical path, locked/in-progress/completed states, unlock threshold 30%)
- ✅ Topic detail (filters by status + difficulty, status cycler, progress ring)
- ✅ Mark solved/in-progress/needs-review/not-started — writes to DB, updates streak, awards XP

## What's stubbed for Phase 2

- **Auth**: NextAuth (Google/GitHub/credentials) issues a session carrying a backend-signed JWT, which the API validates per request (see [backend/app/auth.py](backend/app/auth.py) + [backend/app/security.py](backend/app/security.py)). In local dev only, requests with **no** token fall back to a seeded `demo@trackmydsa.local` user for convenience.
- **Question detail page** (notes editor with CodeMirror, timer): scaffolded routes but not built yet.
- **Stats page** (charts, MAANG readiness panel): API already returns the data; the page UI is not built.
- **Pattern Learning modals, ⌘K search, dark-mode toggle, spaced repetition**: pending Phase 2/3.

## Known gaps / things to revisit

- Question count is **145**, not 150. The per-topic counts in the spec actually sum to 145 (not 150 as the section header suggests). Add 5 more questions to your favorite topic if you want strict parity.
- `lucide-react` resolved to v1.16.0 during install — if any icons render blank, run `npm install lucide-react@latest` in `frontend/`.
- No tests yet. Add pytest for backend + Playwright/Vitest for frontend in Phase 2.
- Backend uses `Base.metadata.create_all()` instead of Alembic migrations. Fine for Phase 1, switch to Alembic before any schema change after launch.

## Common commands

```bash
# Reset the database
docker compose down -v && docker compose up -d
cd backend && python -m app.seed

# Run backend with debug logging
cd backend && uvicorn app.main:app --reload --log-level debug

# Type-check frontend without building
cd frontend && npx tsc --noEmit

# Lint frontend
cd frontend && npm run lint
```
