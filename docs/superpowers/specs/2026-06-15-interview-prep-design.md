# Interview Prep — Design Spec

**Date:** 2026-06-15
**Status:** Approved (pending spec review)

## Overview

A new **Interview Prep** section for AlgoTrail.ai: a sidebar entry → hub of
categories (Python, JavaScript, TypeScript, FastAPI, React, Next.js,
Node.js, SQL/Databases, Docker/DevOps, System Design) → per-category page of
in-depth interview questions rendered as searchable, difficulty/tag-filterable
expandable cards, with per-user "reviewed" + "bookmark" tracking.

Content is **curated and version-controlled**, authored as structured data files
in the backend and seeded into Postgres — mirroring the existing
Topics/Questions pipeline exactly. No AI dependency and no quota cost: content is
high-quality, reviewable, instant to load, and free to serve.

## Goals

- Provide a substantial, genuinely useful interview question bank on day one.
- Reuse existing architectural patterns (static data → seed → router → React
  Query hooks → pages) so the feature is consistent and low-risk.
- Make growing the content trivial: append to one data file + re-seed, with no
  schema or code changes.

## Non-Goals (YAGNI)

- No AI "quiz me / follow-up" layer in this iteration (clean follow-up feature
  later using the existing OpenAI service).
- No per-question dedicated detail pages/routes (hub + category pages only).
- No interview-prep analytics in the global Stats page (progress is shown
  inline on the hub/category pages only).

## Architecture

Mirrors the existing content pipeline used for DSA Topics and Questions.

### Backend — content as code, seeded to DB

**New static data file:** `backend/app/interview_data.py` (source of truth,
shaped like `topics_data.py`):

- `INTERVIEW_CATEGORIES`: list of dicts
  `{slug, title, icon, order, description, color, language}`
  — Python, JavaScript, TypeScript, FastAPI, React, Next.js, Node.js,
  SQL/Databases, Docker/DevOps, System Design.
- `INTERVIEW_QUESTIONS_BY_CATEGORY`: dict keyed by category slug → list of
  richly-structured question dicts.

**New ORM models** (`backend/app/models.py`):

- `InterviewCategory`
  - `id` (str PK), `slug` (unique, indexed), `title`, `icon`, `order` (int),
    `description`, `color`, `language`
  - `questions`: relationship → `InterviewQuestion`
    (`cascade="all, delete-orphan"`)
- `InterviewQuestion`
  - `id` (str PK), `category_id` (FK → interview_categories.id, indexed),
    `slug` (unique, indexed), `question` (text), `difficulty`
    (reuses existing `Difficulty` enum), `tldr` (text),
    `explanation` (text, markdown), `code_examples`
    (JSON: `[{language, code, label}]`), `tags` (JSON array of str),
    `gotchas` (JSON array of str), `follow_ups` (JSON array of str),
    `order` (int)
  - `category`: relationship → `InterviewCategory`
  - `progress`: relationship → `InterviewProgress`
    (`cascade="all, delete-orphan"`)
- `InterviewProgress` (kept separate from DSA `Progress` so it does not pollute
  DSA progress/stats)
  - `id` (str PK), `user_id` (FK → users.id, indexed),
    `interview_question_id` (FK → interview_questions.id, indexed),
    `reviewed` (bool, default False), `bookmarked` (bool, default False),
    `updated_at` (datetime)
  - relationships → `User` and `InterviewQuestion`
  - `User` gains an `interview_progress` relationship
    (`cascade="all, delete-orphan"`).

**Seed** (`backend/app/seed.py`): add idempotent `upsert_interview_categories`
and `upsert_interview_questions` (upsert-by-slug, identical pattern to existing
topic/question upserts), invoked from the existing seed entrypoint. Re-running
`python -m app.seed` must not duplicate rows.

**Migration:** one Alembic migration in `backend/migrations/versions/` creating
`interview_categories`, `interview_questions`, and `interview_progress` tables.

### Backend — routers

New `backend/app/routers/interview.py`, mounted in `main.py` at
`/api/interview` (tag `interview`):

- `GET /categories` → all categories ordered by `order`, each with a question
  count.
- `GET /categories/{slug}` → category + its questions (uses `selectinload` like
  `topics.get_topic`); 404 on unknown slug.
- `GET /progress` → current user's reviewed/bookmarked map (auth required via
  `current_user`).
- `POST /progress/{question_id}` → toggle/set reviewed and/or bookmarked
  (auth required; idempotent upsert of the `InterviewProgress` row).

**Schemas** (`backend/app/schemas.py`): `InterviewCategoryOut` (incl.
`question_count`), `InterviewQuestionOut`, `InterviewCategoryWithQuestions`,
`InterviewProgressOut`, and a small request model for the progress toggle.

### Frontend (Next.js App Router)

Matches the existing `/patterns` hub + `/topic/[slug]` detail flow.

- **Sidebar:** add `{ href: "/interview-prep", label: "Interview Prep",
  icon: MessageSquareCode }` to `NAV` in `components/layout/sidebar.tsx` and the
  mobile sidebar.
- **Hub page** `app/(dashboard)/interview-prep/page.tsx`: category cards (icon,
  title, description, "x/y reviewed" progress), styled like `patterns/page.tsx`.
- **Category page** `app/(dashboard)/interview-prep/[category]/page.tsx`: a
  search box, difficulty filter, tag filter, and a list of `<QuestionCard>`
  expandable accordions showing TL;DR → explanation (markdown) → code examples
  (syntax-highlighted) → gotchas → follow-ups, plus "Mark reviewed" and
  "Bookmark" toggles.
- **New components** under `components/interview/`: `category-card.tsx`,
  `question-card.tsx`, `interview-filters.tsx`.
- **Data hooks** `hooks/use-interview.ts` (React Query, mirroring
  `hooks/use-dsa.ts`): `useInterviewCategories`, `useInterviewCategory(slug)`,
  `useInterviewProgress`, `useToggleInterviewProgress` (optimistic update).
- **API client + types:** add fetch functions in `lib/` and TS types in
  `types/`, matching existing conventions.

## Data Flow

`interview_data.py` → `seed.py` → Postgres → `/api/interview/*` router → API
client → React Query hooks → pages/components.

Progress writes: user toggles → toggle hook (optimistic) → `POST /progress` →
`InterviewProgress` row upserted.

## Error Handling

- Unknown category slug → 404 (same as `get_topic`).
- Progress endpoints require auth (`current_user`). Unauthenticated UI shows
  content read-only and surfaces a sign-in nudge when a toggle is attempted.
- Empty category renders an empty-state card.

## Testing

Backend (pytest, `backend/tests/`):

- `GET /categories` returns seeded categories with counts.
- `GET /categories/{slug}`: 200 for known slug, 404 for unknown.
- `POST /progress/{question_id}`: requires auth; toggling is idempotent and
  persists reviewed/bookmarked.
- **Seed-integrity test:** every key in `INTERVIEW_QUESTIONS_BY_CATEGORY`
  matches a category slug in `INTERVIEW_CATEGORIES` (the same data contract
  guarantee used for topics/questions).
- **Seed idempotency:** running the seed twice does not duplicate rows.

## Initial Content Scope

Seed **10 categories: Python, JavaScript, TypeScript, FastAPI, React, Next.js,
Node.js, SQL/Databases, Docker/DevOps, System Design**, with **~20–25 questions
each (~200–250 total)**, every question fully rich-structured (question, TL;DR,
in-depth explanation, one or more real code examples, difficulty, tags,
gotchas, follow-ups).

This is a large content batch. The architecture is unchanged — categories are
pure data — but the implementation plan must treat content authoring as a
distinct, sizable workstream, authored per-category and parallelizable (one
category's question set is independent of every other's). The plumbing (models,
migration, seed functions, router, schemas, frontend pages/components/hooks) is
built and tested once against a small slice, then content is filled in
category-by-category.

Adding more categories or questions later requires only appending to
`interview_data.py` and re-seeding — no schema or code changes.
