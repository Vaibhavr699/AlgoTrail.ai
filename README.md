# AlgoTrail.ai

> **Learn the pattern, not the problem.**

An AI-powered DSA roadmap tracker that tells you *exactly* what to do next — with personalized study paths, progressive AI hints, LeetCode integration, and a pattern-first learning approach. Most DSA tools give you a list. **AlgoTrail.ai gives you a path.**

---

## Core Features

### Guided "Next Step" Engine
Every login surfaces ONE primary action: the topic you're on, the next unsolved question, and an estimated time. No more decision fatigue.

### AI-Powered Pattern Teaching
Click any pattern to get a full AI-generated lesson — when to use it, how it works, reusable code templates (Python/JS/Java/C++), classic examples, and common mistakes. Built-in chatbot (Aria) answers your doubts in real time.

### Progressive AI Hints
Stuck on a problem? Get 3 levels of hints — from a gentle nudge to pseudocode — without spoilers. Full solution explanations with complexity analysis available when you're ready.

### LeetCode Integration
Read problem descriptions, examples, and constraints directly in the app via LeetCode's public GraphQL API. No context switching.

### Streak System & XP
- Increments when you solve 1+ question per day
- XP rewards: 10 (Easy), 25 (Medium), 50 (Hard)
- Longest streak tracking

### Interview Readiness Score
Scored across 4 categories: Arrays & Strings, Core Data Structures, Search & Optimization, and Advanced Algorithms. Track your progress toward MAANG readiness.

### Onboarding with Aria
A female AI study guide that walks new users through the app with a guided tooltip tour, welcome modal, and floating tips bubble.

---

## Tech Stack

### Frontend
| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives |
| State | Zustand (UI) + React Query (server) |
| Auth | NextAuth.js (Google + GitHub + Credentials) |
| Icons | Lucide React |
| Charts | Recharts |
| Animations | Framer Motion |

### Backend
| Layer | Choice |
|---|---|
| Framework | **FastAPI** (Python) |
| ORM | SQLAlchemy 2.0 |
| Database | **Neon PostgreSQL** (cloud) |
| Auth | NextAuth JWT + backend validation |
| AI | OpenAI GPT-4o-mini |
| External API | LeetCode GraphQL (free, no key needed) |

---

## Project Structure

```
algotrail/
├── backend/                          # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py                   # App entry, CORS, router registration
│   │   ├── models.py                 # User, Topic, Question, Progress, Note
│   │   ├── schemas.py                # Pydantic request/response models
│   │   ├── auth.py                   # Auth dependency (demo + Bearer)
│   │   ├── config.py                 # Settings from .env
│   │   ├── database.py               # Engine + session
│   │   ├── seed.py                   # Idempotent topic/question seeder
│   │   ├── routers/
│   │   │   ├── topics.py             # GET /api/topics
│   │   │   ├── questions.py          # GET /api/questions
│   │   │   ├── progress.py           # GET/PATCH /api/progress
│   │   │   ├── notes.py              # GET/POST /api/notes
│   │   │   ├── stats.py              # GET /api/stats
│   │   │   ├── auth_routes.py        # POST register/login/oauth
│   │   │   ├── ai.py                 # POST hint/explain/teach-pattern/chat
│   │   │   └── leetcode.py           # GET problems/search (LeetCode proxy)
│   │   └── services/
│   │       ├── openai_service.py     # OpenAI completions
│   │       └── leetcode.py           # LeetCode GraphQL client
│   └── requirements.txt
│
├── frontend/                         # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/               # Login + Signup pages
│   │   │   ├── (dashboard)/          # Protected app pages
│   │   │   │   ├── dashboard/        # Stats, next-up, readiness, heatmap
│   │   │   │   ├── roadmap/          # Topic progression path
│   │   │   │   ├── topic/[slug]/     # Question table with filters
│   │   │   │   ├── question/[slug]/  # Problem detail, AI hints, notes, timer
│   │   │   │   ├── patterns/         # Pattern library + AI lessons + chatbot
│   │   │   │   ├── stats/            # Charts, readiness, difficulty breakdown
│   │   │   │   └── settings/         # Profile, theme, sign out
│   │   │   ├── (marketing)/          # Landing page
│   │   │   └── api/auth/             # NextAuth route handler
│   │   ├── components/
│   │   │   ├── ui/                   # Card, Badge, Button, Tabs, Progress
│   │   │   ├── layout/              # Sidebar, TopNav
│   │   │   ├── dashboard/           # StatCard, Heatmap, TopicProgressCard
│   │   │   ├── topic/               # QuestionRow, DifficultyBadge, PatternTag
│   │   │   ├── onboarding/          # Aria avatar, tour, welcome modal, bubble
│   │   │   └── marketing/           # Nav, Footer, Hero, Preview
│   │   ├── hooks/use-dsa.ts         # React Query hooks for all endpoints
│   │   ├── lib/
│   │   │   ├── api.ts               # Typed fetch client
│   │   │   └── auth.ts              # NextAuth config
│   │   ├── stores/ui.store.ts       # Zustand (sidebar, theme, onboarding)
│   │   └── types/index.ts           # TypeScript interfaces
│   └── public/                       # Logo assets
└── docker-compose.yml
```

---

## API Endpoints

> All `/api/*` data routes require a `Bearer <jwt>` access token (issued at login/oauth). AI routes additionally enforce a per-plan daily quota.

| Method | Path | Description |
|---|---|---|
| GET | `/api/topics` | List all topics |
| GET | `/api/topics/{slug}` | Topic with questions |
| GET | `/api/questions` | All questions |
| GET | `/api/questions/{slug}` | Single question |
| GET | `/api/progress` | User's progress |
| PATCH | `/api/progress` | Update status/time |
| GET | `/api/notes/{slug}` | Get user's note |
| POST | `/api/notes` | Create/update note |
| GET | `/api/stats` | Aggregated stats + readiness |
| POST | `/api/auth/register` | Create account (sends verification email) |
| POST | `/api/auth/login` | Credentials login → returns JWT |
| POST | `/api/auth/oauth` | Sync OAuth user → returns JWT |
| POST | `/api/auth/verify-email` | Confirm email from link token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request a password-reset link |
| POST | `/api/auth/reset-password` | Set a new password from link token |
| GET | `/api/ai/usage` | Today's AI usage + plan limit |
| POST | `/api/ai/generate-path` | AI study path generator |
| POST | `/api/ai/hint` | Progressive hints (1-3) |
| POST | `/api/ai/explain` | Full solution explanation |
| POST | `/api/ai/teach-pattern` | AI pattern lesson |
| POST | `/api/ai/pattern-template` | Code template in any language |
| POST | `/api/ai/chat` | Chatbot (Aria) |
| GET | `/api/leetcode/problems/{slug}` | LeetCode problem details |
| GET | `/api/leetcode/search` | Search LeetCode problems |
| GET | `/api/billing/me` | Current plan, status, daily limit |
| POST | `/api/billing/checkout` | Start Stripe Pro checkout |
| POST | `/api/billing/portal` | Open Stripe customer portal |
| POST | `/api/billing/webhook` | Stripe subscription webhooks |

---

## Getting Started

### Prerequisites
- Node.js 20+, npm
- Python 3.11+
- A Neon DB account (or local PostgreSQL)

### Quick Start

```bash
# 1. Clone
git clone https://github.com/Vaibhavr699/Track-My-DSA.git
cd Track-My-DSA

# 2. Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Fill in DATABASE_URL + OPENAI_API_KEY
alembic upgrade head           # Create / migrate the database schema
python -m app.seed             # Seeds 17 topics, 145 questions
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local   # Fill in OAuth + NextAuth secrets
npm run dev
```

App: **http://localhost:3000** | API: **http://localhost:8000** | Docs: **http://localhost:8000/docs**

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+psycopg://user:pass@host/neondb?sslmode=require
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=<openssl rand -base64 32>
ENVIRONMENT=development
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## Seed Data

17 topics, 145 NeetCode questions. Each tagged with: pattern, difficulty, LeetCode ID/slug, hint, key insight, and companies.

| # | Topic | Questions |
|---|---|---|
| 1 | Arrays & Hashing | 9 |
| 2 | Two Pointers | 5 |
| 3 | Sliding Window | 6 |
| 4 | Stack | 7 |
| 5 | Binary Search | 7 |
| 6 | Linked List | 11 |
| 7 | Trees | 15 |
| 8 | Heap / Priority Queue | 7 |
| 9 | Backtracking | 9 |
| 10 | Graphs | 13 |
| 11 | Advanced Graphs | 6 |
| 12 | 1D Dynamic Programming | 10 |
| 13 | 2D Dynamic Programming | 11 |
| 14 | Greedy | 8 |
| 15 | Intervals | 6 |
| 16 | Math & Geometry | 8 |
| 17 | Bit Manipulation | 7 |
| | **Total** | **145** |

---

## License

MIT

---

**Built to help people actually finish DSA prep, not just start it.**
