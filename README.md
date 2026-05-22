# Track My DSA — Track My DSA

> **Learn the pattern, not the problem.**

A guided, opinionated DSA roadmap tracker that tells you *exactly* what to do next — removing the paralysis of choice that makes learners drop off. Most DSA tools (NeetCode, Striver) give you a list. **Track My DSA gives you a path.**

---

## Table of Contents

1. [Why Track My DSA](#why-trackmydsa)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Pages & Screens](#pages--screens)
7. [Design System](#design-system)
8. [API Routes](#api-routes)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)
11. [Seed Data](#seed-data)
12. [Build Roadmap](#build-roadmap)
13. [Contributing](#contributing)
14. [License](#license)

---

## Why Track My DSA

You don't need *another* problem list. You need a system that answers one question every day:

> "What should I work on next?"

Track My DSA answers that for you. It explains the underlying pattern behind every problem, tracks **mastery** (not just completion), and nudges you back when you fall off.

**Built for:**
- Engineers preparing for MAANG/FAANG interviews
- Students learning DSA for the first time and overwhelmed by choice
- Self-taught developers who want structure without being lectured at

---

## Core Features

### Guided "Next Step" Engine
Every login surfaces ONE primary action: the topic you're on, the next unsolved question, and an estimated time. No more decision fatigue.

### Pattern Learning Mode
Each topic ships with a "Learn the Pattern" walkthrough — plain-English explanation, pseudocode template, trigger words to look for, and an example transformation.

### Streak System
- Increments when you solve ≥1 question per calendar day
- Resets if you miss a day (timezone-aware, midnight to midnight)
- **Freeze option:** one free skip per week — life happens
- Weekly digest email summarizing progress

### Spaced Repetition (Revisit Queue)
Hard problems get scheduled for review using the **SM-2 algorithm**. A "Review Queue" badge appears on the dashboard when revisits are due.

### Topic Lock / Unlock
- Topic N+1 unlocks at 30% completion of Topic N
- Full unlock at 100%
- "I know this, skip" override button for experienced users

### Per-Question Notes with Code
- Markdown rendering
- Language-tagged code blocks with syntax highlighting (Python / JS / Java / C++)
- Time/space complexity tags
- Free-text "My Approach" field

### Company Tag Filter
Filter questions by companies that ask them: *"Show only Google questions."* Dedicated prep packs for **Meta, Amazon, Google, Apple, Netflix**.

### Study Timer
Per-question timer that auto-stops on navigation. Aggregate time-studied stats. Nudges you after 45 mins ("real interviews are 45 mins — submit!").

### Stats & MAANG Readiness
GitHub-style heatmap calendar, donut chart by difficulty, bar chart per topic, line chart of cumulative progress, and an Interview Readiness panel that scores you across **Arrays/Strings, Data Structures, Search/Optimization, and Advanced Algorithms**.

---

## Tech Stack

### Frontend
| Layer            | Choice                                    |
|------------------|-------------------------------------------|
| Framework        | **Next.js 14** (App Router)               |
| Language         | TypeScript                                |
| Styling          | Tailwind CSS + **shadcn/ui**              |
| Local State      | Zustand                                   |
| Server State     | React Query (TanStack Query)              |
| Icons            | Lucide React                              |
| Charts           | Recharts                                  |
| Code Editor      | CodeMirror 6 (or Monaco)                  |
| Animations       | Framer Motion                             |

### Backend
| Layer        | Choice                                |
|--------------|---------------------------------------|
| Runtime      | Node.js (Next.js API Routes)          |
| Database     | PostgreSQL 15 (Supabase for hosted)   |
| ORM          | Prisma                                |
| Auth         | NextAuth.js (Google + GitHub + Magic link) |
| Caching      | Redis (Upstash hosted, local for dev) |

### Infrastructure
| Layer       | Choice                              |
|-------------|-------------------------------------|
| Hosting     | Vercel (frontend) + Supabase (DB)   |
| Storage     | Supabase Storage (user avatars)     |
| Email       | Resend (streak nudges, digests)     |

### Local Dev Requirements
- **Node 20+**
- **PostgreSQL 15** (Docker recommended)
- **Redis** (Docker recommended, optional)
- **pnpm** as the package manager

---

## Project Structure

```
track-my-dsa/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + top nav shell
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── roadmap/page.tsx
│   │   ├── topic/[slug]/page.tsx
│   │   ├── question/[slug]/page.tsx
│   │   ├── stats/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── progress/route.ts
│   │   ├── notes/route.ts
│   │   └── stats/route.ts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   ├── layout/                       # Sidebar, TopNav, MobileNav
│   ├── dashboard/                    # StreakCard, TodaySuggestion, etc.
│   ├── roadmap/                      # TopicCard, RoadmapPath, TopicBadge
│   ├── topic/                        # QuestionRow, PatternTag, DifficultyBadge
│   ├── question/                     # NotesEditor, HintReveal, CompanyTags
│   └── stats/                        # HeatmapCalendar, TopicDonut, ReadinessScore
│
├── lib/
│   ├── db.ts                         # Prisma client singleton
│   ├── auth.ts                       # NextAuth config
│   ├── utils.ts
│   ├── roadmap-data.ts               # Static seed data
│   └── spaced-repetition.ts          # SM-2 algorithm
│
├── hooks/                            # useProgress, useStreak, useStats
├── stores/                           # ui.store.ts (Zustand)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                       # Seeds all 150 questions
├── types/
├── public/
├── .env.local.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Database Schema

The DB is modeled around **Users**, **Topics**, **Questions**, and per-user **Progress** / **Notes**. See [`prisma/schema.prisma`](prisma/schema.prisma) for the full source of truth.

### Models

- **`User`** — id, email, name, image, **streak**, lastSolvedAt, longestStreak, xp
- **`Topic`** — slug, title, icon, order, estimatedDays, patterns[], color
- **`Question`** — title, slug, difficulty, pattern, leetcodeId, hint, keyInsight, companies[]
- **`Progress`** — userId × questionId, status, solvedAt, attempts, timeSpent, **revisitAt** (for SM-2)
- **`Note`** — content (markdown), language, codeSnippet, per (user, question)
- **`StudySession`** — startedAt, endedAt, duration, solved
- **`Account`** — OAuth provider links

### Enums

```prisma
enum Difficulty { EASY  MEDIUM  HARD }
enum Status     { NOT_STARTED  IN_PROGRESS  SOLVED  NEEDS_REVIEW }
```

---

## Pages & Screens

### Dashboard (`/`)
Three zones: **Hero stats row** (Solved / Streak / Topics / This Week), the **"What to do today" card** (blue gradient, full-width, with the next-up problem), and a **two-column footer** (topic progress cards + activity heatmap).

### Roadmap (`/roadmap`)
Vertical quest-chain layout. Each topic is a card connected by a vertical line, with **locked / in-progress / completed / not-started** states. Includes a "Recommended daily schedule" callout: *"At 3 problems/day you'll finish in ~7 weeks. MAANG-ready by [date]."*

### Topic Detail (`/topic/[slug]`)
Header with progress ring, tabs (`All` / `Not Started` / `In Progress` / `Solved` / `Needs Review`), filter bar (difficulty / pattern / company), question table, and a collapsible **Pattern Insight** box at the bottom.

### Question Detail (`/question/[slug]`)
Split layout. **Left pane (55%)**: problem info, hints (progressive reveal), key insight, status toggles, study timer. **Right pane (45%)**: notes editor with language tabs, code editor, complexity tags, "My Approach" markdown field.

### Stats (`/stats`)
Four rows: KPI cards → heatmap + difficulty donut → topic bar chart + cumulative line chart → **MAANG Readiness Panel** with per-category progress bars and a personalized recommendation.

### Settings (`/settings`)
Profile, OAuth-connected accounts, theme, timezone (for streak calculations), email notification preferences.

---

## Design System

### Philosophy
LeetCode-inspired layout, but cleaner. Blue-primary, light/dark mode, zero marketing clutter. Every screen should feel like a **focused tool**, not a landing page.

### Color Palette

**Primary Blue Scale**
```
--blue-50:  #EFF6FF   --blue-500: #3B82F6  ← Primary action
--blue-100: #DBEAFE   --blue-600: #2563EB  ← Hover
--blue-200: #BFDBFE   --blue-700: #1D4ED8  ← Active
--blue-300: #93C5FD   --blue-900: #1E3A8A  ← Dark accents
--blue-400: #60A5FA
```

**Neutrals**
```
--gray-950: #0A0F1E   (dark mode page bg)
--gray-900: #111827   (dark mode card bg)
--gray-50:  #F9FAFB   (light mode page bg)
--white:    #FFFFFF   (light mode card bg)
```

**Difficulty Colors**
```
--easy:    #10B981  (green)
--medium:  #F59E0B  (amber)
--hard:    #EF4444  (red)
```

### Typography
- **Body:** Inter, system-ui, sans-serif
- **Code / numbers / stats:** JetBrains Mono

### Spacing & Radius
- Cards: `rounded-lg` (8px), padding `p-5` or `p-6`
- Badges / pills: `rounded-full`
- Section gaps: `gap-4` / `gap-6`
- Container: `max-w-7xl mx-auto px-4 sm:px-6`

### Inspiration
**LeetCode** (question layout) · **Linear** (sidebar, transitions) · **GitHub** (heatmap) · **Vercel dashboard** (stats cards) · **Raycast** (`⌘K` command palette)

---

## API Routes

### Progress
```http
PATCH /api/progress
Body:     { questionId, status, timeSpent? }
Response: { progress, newStreak, xpGained }

GET /api/progress?userId=...
Response: { progress[] }
```

### Notes
```http
POST /api/notes
Body:     { questionId, content, codeSnippet?, language? }

GET /api/notes/:questionId
```

### Stats
```http
GET /api/stats
Response: {
  totalSolved, streak, longestStreak,
  byDifficulty: { easy, medium, hard },
  byTopic:      [{ topicId, solved, total }],
  activity:     [{ date, count }],
  readiness:    { arrays, dataStructures, search, advanced }
}
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Docker (for local Postgres + Redis)

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/Track-My-DSA.git
cd Track-My-DSA

# 2. Install dependencies
pnpm install

# 3. Spin up Postgres (Docker)
docker run --name trackmydsa-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trackmydsa \
  -p 5432:5432 \
  -d postgres:15

# 4. Copy env template and fill in secrets
cp .env.local.example .env.local

# 5. Run migrations + seed the 150 questions
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma db seed

# 6. Start the dev server
pnpm dev
```

The app will be live at **http://localhost:3000**.

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trackmydsa"

# Auth
NEXTAUTH_SECRET="<generate: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Redis (optional for dev)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Email (optional for dev)
RESEND_API_KEY=""
```

---

## Seed Data

The seed file ([`prisma/seed.ts`](prisma/seed.ts)) loads the full **NeetCode 150** curriculum, organized into 17 topics:

| #  | Topic                       | Questions |
|----|-----------------------------|-----------|
| 1  | Arrays & Hashing            | 9         |
| 2  | Two Pointers                | 5         |
| 3  | Sliding Window              | 6         |
| 4  | Stack                       | 7         |
| 5  | Binary Search               | 7         |
| 6  | Linked List                 | 11        |
| 7  | Trees                       | 15        |
| 8  | Heap / Priority Queue       | 7         |
| 9  | Backtracking                | 9         |
| 10 | Graphs                      | 13        |
| 11 | Advanced Graphs             | 6         |
| 12 | Dynamic Programming 1D      | 10        |
| 13 | Dynamic Programming 2D      | 11        |
| 14 | Greedy                      | 8         |
| 15 | Intervals                   | 6         |
| 16 | Math & Geometry             | 8         |
| 17 | Bit Manipulation            | 7         |
|    | **Total**                   | **150**   |

Each question is tagged with: pattern, difficulty, LeetCode ID/slug, hint, key insight, and companies.

---

## Build Roadmap

### Phase 1 — Core (Week 1–2)
- [ ] Project scaffold (Next.js + Tailwind + shadcn + Prisma)
- [ ] Auth (Google + GitHub OAuth)
- [ ] DB schema + seed (all 150 questions)
- [ ] Sidebar + layout shell
- [ ] Dashboard page (stats cards + next-up card)
- [ ] Roadmap page (topic cards, locked/unlocked states)
- [ ] Topic detail page (question table, filters)
- [ ] Mark solved / not started / needs review

### Phase 2 — Engagement (Week 3)
- [ ] Question detail page (notes editor + timer)
- [ ] Streak system
- [ ] Stats page (charts + heatmap)
- [ ] Pattern Learning modals
- [ ] Company tag filter

### Phase 3 — Polish (Week 4)
- [ ] Spaced repetition / review queue
- [ ] Global search (⌘K)
- [ ] Mobile responsive layout
- [ ] Dark/light mode toggle
- [ ] Email reminders (streak nudge)
- [ ] Landing page
- [ ] SEO + OG images

### Phase 4 — Growth (Future)
- [ ] AI hint system (Claude API — nudges without spoilers)
- [ ] Mock interview timer mode (45 min, one question)
- [ ] Public profile / shareable progress card
- [ ] Company-specific prep packs
- [ ] Discussion / community notes per question

---

## Contributing

This is a solo-built project right now, but PRs and issues are welcome once the Phase 1 scaffold is live. If you spot a missing question, a broken pattern explanation, or a UX rough edge — open an issue.

**Local dev workflow:**
1. Fork & branch off `main`
2. Run `pnpm dev` and verify your change
3. Run `pnpm lint && pnpm typecheck`
4. Open a PR with a clear description and screenshots for UI changes

---

## License

MIT — see [LICENSE](LICENSE).

---

**Built with 🩵 to help people actually finish DSA prep, not just start it.**
