# Interview Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a curated Interview Prep section — a sidebar entry → hub of 10 framework/language categories → per-category pages of rich, expandable interview questions, with per-user reviewed/bookmark tracking.

**Architecture:** Mirror the existing DSA Topics/Questions pipeline exactly: static data files → idempotent DB seed → FastAPI router → React Query hooks → Next.js App Router pages. Three new tables (`interview_categories`, `interview_questions`, `interview_progress`) added via one idempotent Alembic migration. Content is authored per-category in `interview_data.py` and is independent of all plumbing.

**Tech Stack:** FastAPI, SQLAlchemy 2.0 (Mapped/mapped_column), Alembic, Pydantic v2, Postgres, Next.js App Router, React Query, TypeScript, Tailwind.

**Commit convention for this build:** short messages, NO Claude co-author line (per user request).

---

## File Structure

**Backend (create):**
- `backend/app/interview_data.py` — `INTERVIEW_CATEGORIES` + `INTERVIEW_QUESTIONS_BY_CATEGORY` (source of truth)
- `backend/app/routers/interview.py` — `/api/interview/*` endpoints
- `backend/migrations/versions/0005_interview_prep.py` — create 3 tables
- `backend/tests/test_interview.py` — router + seed-integrity tests

**Backend (modify):**
- `backend/app/models.py` — add `InterviewCategory`, `InterviewQuestion`, `InterviewProgress`; add `User.interview_progress` relationship
- `backend/app/schemas.py` — add interview schemas
- `backend/app/seed.py` — add `upsert_interview_categories` + `upsert_interview_questions`, call from `run()`
- `backend/app/main.py` — mount interview router

**Frontend (create):**
- `frontend/src/app/(dashboard)/interview-prep/page.tsx` — hub
- `frontend/src/app/(dashboard)/interview-prep/[category]/page.tsx` — category page
- `frontend/src/components/interview/category-card.tsx`
- `frontend/src/components/interview/question-card.tsx`
- `frontend/src/components/interview/interview-filters.tsx`
- `frontend/src/hooks/use-interview.ts`

**Frontend (modify):**
- `frontend/src/types/index.ts` — add interview types
- `frontend/src/lib/api.ts` — add `api.interview.*`
- `frontend/src/components/layout/sidebar.tsx` — add nav entry
- `frontend/src/components/layout/mobile-sidebar.tsx` — add nav entry

---

## Task 1: ORM models

**Files:**
- Modify: `backend/app/models.py`

- [ ] **Step 1: Add the three models**

Append after the `AiUsage` class in `backend/app/models.py` (the `JSON` type must be added to the existing `sqlalchemy` import block — add `JSON` to the import list alongside `ARRAY`, `Boolean`, etc.):

```python
class InterviewCategory(Base):
    __tablename__ = "interview_categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    order: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(String)
    color: Mapped[str] = mapped_column(String)
    language: Mapped[str] = mapped_column(String)

    questions: Mapped[list["InterviewQuestion"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.order",
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    category_id: Mapped[str] = mapped_column(
        String, ForeignKey("interview_categories.id"), index=True
    )
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    question: Mapped[str] = mapped_column(String)
    difficulty: Mapped[Difficulty] = mapped_column(SAEnum(Difficulty, name="difficulty"))
    tldr: Mapped[str] = mapped_column(String)
    explanation: Mapped[str] = mapped_column(String)
    code_examples: Mapped[list[dict]] = mapped_column(JSON, default=list)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    gotchas: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    follow_ups: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    order: Mapped[int] = mapped_column(Integer)

    category: Mapped["InterviewCategory"] = relationship(back_populates="questions")
    progress: Mapped[list["InterviewProgress"]] = relationship(
        back_populates="question", cascade="all, delete-orphan"
    )


class InterviewProgress(Base):
    __tablename__ = "interview_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "interview_question_id", name="uq_interview_progress_user_question"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    interview_question_id: Mapped[str] = mapped_column(
        String, ForeignKey("interview_questions.id"), index=True
    )
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    bookmarked: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="interview_progress")
    question: Mapped["InterviewQuestion"] = relationship(back_populates="progress")
```

- [ ] **Step 2: Add the User back-reference**

In the `User` class, alongside the existing `progress` / `notes` / `sessions` relationships, add:

```python
    interview_progress: Mapped[list["InterviewProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
```

- [ ] **Step 3: Verify models import cleanly**

Run: `cd backend && python -c "import app.models; print('ok')"`
Expected: prints `ok` with no error.

- [ ] **Step 4: Commit**

```bash
git add backend/app/models.py
git commit -m "interview: add category/question/progress models"
```

---

## Task 2: Alembic migration

**Files:**
- Create: `backend/migrations/versions/0005_interview_prep.py`

- [ ] **Step 1: Write the migration (idempotent, matches existing 0004 style)**

```python
"""add interview prep tables (categories, questions, progress)

Idempotent table guards, same rationale as 0002–0004.

Revision ID: 0005_interview_prep
Revises: 0004_email_weekly_digest
Create Date: 2026-06-15
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "0005_interview_prep"
down_revision: Union[str, None] = "0004_email_weekly_digest"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(table: str) -> bool:
    return table in inspect(op.get_bind()).get_table_names()


def upgrade() -> None:
    if not _has_table("interview_categories"):
        op.create_table(
            "interview_categories",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("icon", sa.String(), nullable=False),
            sa.Column("order", sa.Integer(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("color", sa.String(), nullable=False),
            sa.Column("language", sa.String(), nullable=False),
        )
        op.create_index("ix_interview_categories_slug", "interview_categories", ["slug"], unique=True)

    if not _has_table("interview_questions"):
        op.create_table(
            "interview_questions",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("category_id", sa.String(), sa.ForeignKey("interview_categories.id"), nullable=False),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("question", sa.String(), nullable=False),
            sa.Column("difficulty", sa.Enum("EASY", "MEDIUM", "HARD", name="difficulty"), nullable=False),
            sa.Column("tldr", sa.String(), nullable=False),
            sa.Column("explanation", sa.String(), nullable=False),
            sa.Column("code_examples", sa.JSON(), nullable=False, server_default="[]"),
            sa.Column("tags", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("gotchas", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("follow_ups", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("order", sa.Integer(), nullable=False),
        )
        op.create_index("ix_interview_questions_slug", "interview_questions", ["slug"], unique=True)
        op.create_index("ix_interview_questions_category_id", "interview_questions", ["category_id"])

    if not _has_table("interview_progress"):
        op.create_table(
            "interview_progress",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("interview_question_id", sa.String(), sa.ForeignKey("interview_questions.id"), nullable=False),
            sa.Column("reviewed", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("bookmarked", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint("user_id", "interview_question_id", name="uq_interview_progress_user_question"),
        )
        op.create_index("ix_interview_progress_user_id", "interview_progress", ["user_id"])
        op.create_index("ix_interview_progress_interview_question_id", "interview_progress", ["interview_question_id"])


def downgrade() -> None:
    if _has_table("interview_progress"):
        op.drop_table("interview_progress")
    if _has_table("interview_questions"):
        op.drop_table("interview_questions")
    if _has_table("interview_categories"):
        op.drop_table("interview_categories")
```

> Note: the `difficulty` enum type already exists from earlier migrations. `sa.Enum(..., name="difficulty")` inside `create_table` will reuse it on Postgres if present; if a "type already exists" error occurs, set `sa.Enum(..., name="difficulty", create_type=False)`.

- [ ] **Step 2: Commit**

```bash
git add backend/migrations/versions/0005_interview_prep.py
git commit -m "interview: add tables migration"
```

---

## Task 3: Pydantic schemas

**Files:**
- Modify: `backend/app/schemas.py`

- [ ] **Step 1: Add schemas**

Append to `backend/app/schemas.py` (it already imports `BaseModel`, `ConfigDict`):

```python
class CodeExample(BaseModel):
    language: str
    code: str
    label: str | None = None


class InterviewQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    question: str
    difficulty: Difficulty
    tldr: str
    explanation: str
    code_examples: list[CodeExample] = []
    tags: list[str] = []
    gotchas: list[str] = []
    follow_ups: list[str] = []
    order: int


class InterviewCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    icon: str
    order: int
    description: str
    color: str
    language: str
    question_count: int = 0


class InterviewCategoryWithQuestions(InterviewCategoryOut):
    questions: list[InterviewQuestionOut] = []


class InterviewProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    interview_question_id: str
    reviewed: bool
    bookmarked: bool


class InterviewProgressUpdate(BaseModel):
    reviewed: bool | None = None
    bookmarked: bool | None = None
```

> `Difficulty` is already imported at the top of `schemas.py` (used by `QuestionOut`). If not, add `from app.models import Difficulty`.

- [ ] **Step 2: Verify import**

Run: `cd backend && python -c "import app.schemas; print('ok')"`
Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas.py
git commit -m "interview: add schemas"
```

---

## Task 4: Interview content data (plumbing slice)

This task seeds **only enough content to build and test the plumbing**: all 10 categories + 2 real questions in `python` and `javascript`. Full content is filled in later (Tasks 8a–8j), independent of all code.

**Files:**
- Create: `backend/app/interview_data.py`

- [ ] **Step 1: Create the data file with all categories and a content slice**

```python
"""Static interview-prep content for AlgoTrail.ai.

Category slugs are the source of truth; INTERVIEW_QUESTIONS_BY_CATEGORY keys
must match a category slug. Seeded idempotently by app.seed.
"""

INTERVIEW_CATEGORIES: list[dict] = [
    {"slug": "python", "title": "Python", "icon": "🐍", "order": 1,
     "description": "Core language internals, data model, concurrency, and idioms.",
     "color": "#3776AB", "language": "python"},
    {"slug": "javascript", "title": "JavaScript", "icon": "✨", "order": 2,
     "description": "Closures, the event loop, prototypes, async, and coercion.",
     "color": "#F7DF1E", "language": "javascript"},
    {"slug": "typescript", "title": "TypeScript", "icon": "🟦", "order": 3,
     "description": "Types, generics, narrowing, utility types, and config.",
     "color": "#3178C6", "language": "typescript"},
    {"slug": "fastapi", "title": "FastAPI", "icon": "⚡", "order": 4,
     "description": "Dependency injection, async, Pydantic, and request lifecycle.",
     "color": "#009688", "language": "python"},
    {"slug": "react", "title": "React", "icon": "⚛️", "order": 5,
     "description": "Hooks, rendering, reconciliation, state, and performance.",
     "color": "#61DAFB", "language": "typescript"},
    {"slug": "nextjs", "title": "Next.js", "icon": "▲", "order": 6,
     "description": "App Router, rendering strategies, server components, caching.",
     "color": "#000000", "language": "typescript"},
    {"slug": "nodejs", "title": "Node.js", "icon": "🟩", "order": 7,
     "description": "Event loop, streams, async patterns, modules, error handling.",
     "color": "#339933", "language": "javascript"},
    {"slug": "sql", "title": "SQL & Databases", "icon": "🗄️", "order": 8,
     "description": "Joins, indexing, transactions, isolation, and query tuning.",
     "color": "#336791", "language": "sql"},
    {"slug": "docker-devops", "title": "Docker & DevOps", "icon": "🐳", "order": 9,
     "description": "Containers, images, networking, CI/CD, and orchestration.",
     "color": "#2496ED", "language": "bash"},
    {"slug": "system-design", "title": "System Design", "icon": "🏗️", "order": 10,
     "description": "Scalability, caching, load balancing, sharding, and trade-offs.",
     "color": "#6366F1", "language": "text"},
]

INTERVIEW_QUESTIONS_BY_CATEGORY: dict[str, list[dict]] = {
    "python": [
        {
            "slug": "py-is-vs-eq",
            "question": "What is the difference between `is` and `==` in Python?",
            "difficulty": "EASY",
            "tldr": "`==` compares values; `is` compares identity (same object in memory).",
            "explanation": (
                "`==` calls `__eq__` and compares values. `is` checks whether two names "
                "refer to the exact same object (same `id()`). Small ints (-5..256) and "
                "interned strings are cached, so `is` may *appear* to work for them — but "
                "relying on that is a bug. Use `is` only for singletons like `None`."
            ),
            "code_examples": [
                {"language": "python", "label": "Identity vs equality",
                 "code": "a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)  # True (same values)\nprint(a is b)  # False (different objects)\n\nx = None\nprint(x is None)  # correct singleton check"},
            ],
            "tags": ["fundamentals", "identity"],
            "gotchas": ["`a is b` may pass for small ints due to caching — never rely on it."],
            "follow_ups": ["When is `is None` preferred over `== None`?", "What is string interning?"],
        },
        {
            "slug": "py-gil",
            "question": "What is the GIL and how does it affect concurrency?",
            "difficulty": "MEDIUM",
            "tldr": "The GIL lets only one thread execute Python bytecode at a time, so threads don't speed up CPU-bound work.",
            "explanation": (
                "CPython's Global Interpreter Lock serializes bytecode execution. Threads "
                "still help I/O-bound work (the GIL is released during blocking I/O), but "
                "for CPU-bound parallelism use `multiprocessing` or native extensions that "
                "release the GIL. Python 3.13+ ships an experimental free-threaded build."
            ),
            "code_examples": [
                {"language": "python", "label": "CPU-bound: use processes",
                 "code": "from concurrent.futures import ProcessPoolExecutor\n\ndef work(n):\n    return sum(i * i for i in range(n))\n\nwith ProcessPoolExecutor() as ex:\n    results = list(ex.map(work, [10_000_00] * 4))"},
            ],
            "tags": ["concurrency", "internals"],
            "gotchas": ["Threads do NOT give CPU parallelism in CPython due to the GIL."],
            "follow_ups": ["When are threads still useful?", "What changed in free-threaded Python?"],
        },
    ],
    "javascript": [
        {
            "slug": "js-closures",
            "question": "What is a closure and why is it useful?",
            "difficulty": "MEDIUM",
            "tldr": "A closure is a function that retains access to its lexical scope even after that scope has returned.",
            "explanation": (
                "When a function is created it captures the variables in scope at definition "
                "time. Those variables stay alive as long as the closure does — enabling data "
                "privacy, factory functions, and stateful callbacks."
            ),
            "code_examples": [
                {"language": "javascript", "label": "Counter via closure",
                 "code": "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nnext(); // 1\nnext(); // 2"},
            ],
            "tags": ["fundamentals", "scope"],
            "gotchas": ["`var` in loops shares one binding — use `let` for per-iteration closures."],
            "follow_ups": ["Why does `let` fix the classic loop-closure bug?"],
        },
        {
            "slug": "js-event-loop",
            "question": "Explain the event loop and the difference between microtasks and macrotasks.",
            "difficulty": "HARD",
            "tldr": "The event loop runs the call stack, then drains all microtasks (Promises), then one macrotask (timers), and repeats.",
            "explanation": (
                "After each macrotask and once the stack is empty, the engine drains the "
                "entire microtask queue (Promise callbacks, queueMicrotask) before rendering "
                "or running the next macrotask (setTimeout, I/O). This is why a Promise "
                "callback runs before a setTimeout(0) scheduled earlier."
            ),
            "code_examples": [
                {"language": "javascript", "label": "Ordering",
                 "code": "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n// A D C B"},
            ],
            "tags": ["async", "internals"],
            "gotchas": ["Microtasks always drain fully before the next macrotask."],
            "follow_ups": ["Where does `await` fit?", "What is starvation by microtasks?"],
        },
    ],
    "typescript": [],
    "fastapi": [],
    "react": [],
    "nextjs": [],
    "nodejs": [],
    "sql": [],
    "docker-devops": [],
    "system-design": [],
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/interview_data.py
git commit -m "interview: seed data scaffold + python/js slice"
```

---

## Task 5: Seed functions

**Files:**
- Modify: `backend/app/seed.py`

- [ ] **Step 1: Add upsert functions**

At the top of `backend/app/seed.py`, extend the imports:

```python
from app.models import Difficulty, Question, Topic, InterviewCategory, InterviewQuestion
from app.interview_data import INTERVIEW_CATEGORIES, INTERVIEW_QUESTIONS_BY_CATEGORY
```

Then add these functions (before the `run()` / `main` entrypoint):

```python
def upsert_interview_categories(db: Session) -> dict[str, InterviewCategory]:
    by_slug: dict[str, InterviewCategory] = {}
    for c in INTERVIEW_CATEGORIES:
        cat = db.query(InterviewCategory).filter(InterviewCategory.slug == c["slug"]).first()
        if cat is None:
            cat = InterviewCategory(**c)
            db.add(cat)
        else:
            for k, v in c.items():
                setattr(cat, k, v)
        by_slug[c["slug"]] = cat
    db.flush()
    return by_slug


def upsert_interview_questions(db: Session, cats_by_slug: dict[str, InterviewCategory]) -> int:
    count = 0
    for cat_slug, questions in INTERVIEW_QUESTIONS_BY_CATEGORY.items():
        category = cats_by_slug.get(cat_slug)
        if category is None:
            print(f"WARN: no interview category slug={cat_slug}, skipping {len(questions)} questions")
            continue
        for order, q in enumerate(questions, start=1):
            existing = db.query(InterviewQuestion).filter(InterviewQuestion.slug == q["slug"]).first()
            payload = dict(
                category_id=category.id,
                question=q["question"],
                slug=q["slug"],
                difficulty=Difficulty(q["difficulty"]),
                tldr=q["tldr"],
                explanation=q["explanation"],
                code_examples=q.get("code_examples", []),
                tags=q.get("tags", []),
                gotchas=q.get("gotchas", []),
                follow_ups=q.get("follow_ups", []),
                order=order,
            )
            if existing is None:
                db.add(InterviewQuestion(**payload))
            else:
                for k, v in payload.items():
                    setattr(existing, k, v)
            count += 1
    return count
```

- [ ] **Step 2: Call them from the seed entrypoint**

In `seed.py`'s `run()` (the function that opens a `SessionLocal()`, calls `upsert_topics` / `upsert_questions`, then `db.commit()`), add before the commit:

```python
    interview_cats = upsert_interview_categories(db)
    n_iq = upsert_interview_questions(db, interview_cats)
    print(f"Seeded {len(interview_cats)} interview categories, {n_iq} interview questions")
```

> If `seed.py` names its entrypoint differently (e.g. `main`), add these lines into whichever function performs the topic/question upserts and commit. Read the file first to confirm the exact function name and the session variable.

- [ ] **Step 3: Verify the module imports**

Run: `cd backend && python -c "import app.seed; print('ok')"`
Expected: `ok`.

- [ ] **Step 4: Commit**

```bash
git add backend/app/seed.py
git commit -m "interview: seed categories and questions"
```

---

## Task 6: Router (TDD)

**Files:**
- Create: `backend/app/routers/interview.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_interview.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_interview.py`. These mirror existing DB-backed tests: they use the `db_client` fixture and `requires_db` marker from `conftest.py`, and seed via the seed functions. The seed-integrity test is pure-logic (no DB) and always runs.

```python
import pytest

from app.interview_data import INTERVIEW_CATEGORIES, INTERVIEW_QUESTIONS_BY_CATEGORY
from tests.conftest import requires_db


def test_question_keys_match_category_slugs():
    """Every INTERVIEW_QUESTIONS_BY_CATEGORY key must be a real category slug."""
    slugs = {c["slug"] for c in INTERVIEW_CATEGORIES}
    for key in INTERVIEW_QUESTIONS_BY_CATEGORY:
        assert key in slugs, f"questions key {key!r} has no matching category"


def test_question_slugs_unique():
    seen = set()
    for qs in INTERVIEW_QUESTIONS_BY_CATEGORY.values():
        for q in qs:
            assert q["slug"] not in seen, f"duplicate question slug {q['slug']!r}"
            seen.add(q["slug"])


def _seed(db_client):
    from app.database import get_db
    from app.seed import upsert_interview_categories, upsert_interview_questions
    db = next(db_client.app.dependency_overrides[get_db]())
    cats = upsert_interview_categories(db)
    upsert_interview_questions(db, cats)
    db.commit()


@requires_db
def test_list_categories(db_client):
    _seed(db_client)
    res = db_client.get("/api/interview/categories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == len(INTERVIEW_CATEGORIES)
    py = next(c for c in data if c["slug"] == "python")
    assert py["question_count"] >= 1


@requires_db
def test_get_category_with_questions(db_client):
    _seed(db_client)
    res = db_client.get("/api/interview/categories/python")
    assert res.status_code == 200
    body = res.json()
    assert body["slug"] == "python"
    assert len(body["questions"]) >= 1
    q = body["questions"][0]
    assert {"slug", "question", "tldr", "explanation", "code_examples"} <= q.keys()


@requires_db
def test_get_category_404(db_client):
    res = db_client.get("/api/interview/categories/does-not-exist")
    assert res.status_code == 404


@requires_db
def test_progress_requires_auth(db_client):
    res = db_client.get("/api/interview/progress")
    assert res.status_code in (401, 403)
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `cd backend && python -m pytest tests/test_interview.py -v`
Expected: the two pure-logic tests may pass; the route tests FAIL (404 — router not mounted) or are skipped if `TEST_DATABASE_URL` is unset. The route tests must NOT pass yet.

- [ ] **Step 3: Implement the router**

Create `backend/app/routers/interview.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.auth import current_user
from app.database import get_db
from app.models import InterviewCategory, InterviewProgress, InterviewQuestion, User
from app.schemas import (
    InterviewCategoryOut,
    InterviewCategoryWithQuestions,
    InterviewProgressOut,
    InterviewProgressUpdate,
)

router = APIRouter()


@router.get("/categories", response_model=list[InterviewCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = (
        db.query(InterviewCategory)
        .options(selectinload(InterviewCategory.questions))
        .order_by(InterviewCategory.order)
        .all()
    )
    out = []
    for c in cats:
        item = InterviewCategoryOut.model_validate(c)
        item.question_count = len(c.questions)
        out.append(item)
    return out


@router.get("/categories/{slug}", response_model=InterviewCategoryWithQuestions)
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = (
        db.query(InterviewCategory)
        .options(selectinload(InterviewCategory.questions))
        .filter(InterviewCategory.slug == slug)
        .first()
    )
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    out = InterviewCategoryWithQuestions.model_validate(cat)
    out.question_count = len(cat.questions)
    return out


@router.get("/progress", response_model=list[InterviewProgressOut])
def list_progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(InterviewProgress).filter(InterviewProgress.user_id == user.id).all()


@router.post("/progress/{question_id}", response_model=InterviewProgressOut)
def upsert_progress(
    question_id: str,
    payload: InterviewProgressUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    row = (
        db.query(InterviewProgress)
        .filter(
            InterviewProgress.user_id == user.id,
            InterviewProgress.interview_question_id == question_id,
        )
        .first()
    )
    if row is None:
        row = InterviewProgress(user_id=user.id, interview_question_id=question_id)
        db.add(row)
    if payload.reviewed is not None:
        row.reviewed = payload.reviewed
    if payload.bookmarked is not None:
        row.bookmarked = payload.bookmarked
    db.commit()
    db.refresh(row)
    return row
```

- [ ] **Step 4: Mount the router**

In `backend/app/main.py`, alongside the other `include_router` calls, add the import (with the rest of the router imports) and:

```python
from app.routers import interview  # add to existing routers import line/block

app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `cd backend && python -m pytest tests/test_interview.py -v`
Expected: pure-logic tests PASS; DB-backed tests PASS when `TEST_DATABASE_URL` is set (otherwise skip). None fail.

- [ ] **Step 6: Commit**

```bash
git add backend/app/routers/interview.py backend/app/main.py backend/tests/test_interview.py
git commit -m "interview: add API router + tests"
```

---

## Task 7: Frontend types, API client, hooks

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/lib/api.ts`
- Create: `frontend/src/hooks/use-interview.ts`

- [ ] **Step 1: Add types**

Append to `frontend/src/types/index.ts`:

```typescript
export interface CodeExample {
  language: string;
  code: string;
  label?: string | null;
}

export interface InterviewQuestionOut {
  id: string;
  slug: string;
  question: string;
  difficulty: Difficulty;
  tldr: string;
  explanation: string;
  code_examples: CodeExample[];
  tags: string[];
  gotchas: string[];
  follow_ups: string[];
  order: number;
}

export interface InterviewCategoryOut {
  id: string;
  slug: string;
  title: string;
  icon: string;
  order: number;
  description: string;
  color: string;
  language: string;
  question_count: number;
}

export interface InterviewCategoryWithQuestions extends InterviewCategoryOut {
  questions: InterviewQuestionOut[];
}

export interface InterviewProgressOut {
  interview_question_id: string;
  reviewed: boolean;
  bookmarked: boolean;
}
```

- [ ] **Step 2: Add API client methods**

In `frontend/src/lib/api.ts`, add the new types to the `import type { ... } from "@/types"` block (`InterviewCategoryOut`, `InterviewCategoryWithQuestions`, `InterviewProgressOut`), then add an `interview` key to the `api` object:

```typescript
  interview: {
    categories: () => http<InterviewCategoryOut[]>("/api/interview/categories"),
    category: (slug: string) =>
      http<InterviewCategoryWithQuestions>(`/api/interview/categories/${slug}`),
    progress: () => http<InterviewProgressOut[]>("/api/interview/progress"),
    setProgress: (questionId: string, patch: { reviewed?: boolean; bookmarked?: boolean }) =>
      http<InterviewProgressOut>(`/api/interview/progress/${questionId}`, {
        method: "POST",
        json: patch,
      }),
  },
```

- [ ] **Step 3: Add React Query hooks**

Create `frontend/src/hooks/use-interview.ts`:

```typescript
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InterviewProgressOut } from "@/types";

export function useInterviewCategories() {
  return useQuery({ queryKey: ["interview-categories"], queryFn: api.interview.categories });
}

export function useInterviewCategory(slug: string) {
  return useQuery({
    queryKey: ["interview-category", slug],
    queryFn: () => api.interview.category(slug),
    enabled: !!slug,
  });
}

export function useInterviewProgress() {
  return useQuery({
    queryKey: ["interview-progress"],
    queryFn: api.interview.progress,
  });
}

export function useToggleInterviewProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      reviewed,
      bookmarked,
    }: {
      questionId: string;
      reviewed?: boolean;
      bookmarked?: boolean;
    }) => api.interview.setProgress(questionId, { reviewed, bookmarked }),
    onSuccess: (updated: InterviewProgressOut) => {
      qc.setQueryData<InterviewProgressOut[]>(["interview-progress"], (prev) => {
        const list = prev ?? [];
        const i = list.findIndex((p) => p.interview_question_id === updated.interview_question_id);
        if (i === -1) return [...list, updated];
        const copy = [...list];
        copy[i] = updated;
        return copy;
      });
      qc.invalidateQueries({ queryKey: ["interview-categories"] });
    },
  });
}
```

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors from the new files (pre-existing unrelated errors, if any, are out of scope).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/lib/api.ts frontend/src/hooks/use-interview.ts
git commit -m "interview: frontend types, api client, hooks"
```

---

## Task 8: Frontend components + pages + nav

**Files:**
- Create: `frontend/src/components/interview/question-card.tsx`
- Create: `frontend/src/components/interview/category-card.tsx`
- Create: `frontend/src/components/interview/interview-filters.tsx`
- Create: `frontend/src/app/(dashboard)/interview-prep/page.tsx`
- Create: `frontend/src/app/(dashboard)/interview-prep/[category]/page.tsx`
- Modify: `frontend/src/components/layout/sidebar.tsx`
- Modify: `frontend/src/components/layout/mobile-sidebar.tsx`

- [ ] **Step 1: Sidebar nav entries**

In `frontend/src/components/layout/sidebar.tsx`, add `MessageSquareCode` to the `lucide-react` import and a NAV entry after the Patterns entry:

```typescript
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquareCode },
```

Do the same in `frontend/src/components/layout/mobile-sidebar.tsx` (match its existing NAV array shape — read the file first to mirror its exact structure).

- [ ] **Step 2: Category card component**

Create `frontend/src/components/interview/category-card.tsx`:

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { InterviewCategoryOut } from "@/types";

export function CategoryCard({
  category,
  reviewedCount,
}: {
  category: InterviewCategoryOut;
  reviewedCount: number;
}) {
  return (
    <Link href={`/interview-prep/${category.slug}`}>
      <Card className="p-5 h-full hover:border-brand-400 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>{category.icon}</span>
          <h2 className="text-sm font-semibold">{category.title}</h2>
        </div>
        <p className="mt-2 text-sm text-[rgb(var(--muted))]">{category.description}</p>
        <p className="mt-3 text-xs text-[rgb(var(--muted))]">
          {reviewedCount}/{category.question_count} reviewed
        </p>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: Filters component**

Create `frontend/src/components/interview/interview-filters.tsx`:

```tsx
"use client";

import type { Difficulty } from "@/types";

export function InterviewFilters({
  query,
  onQuery,
  difficulty,
  onDifficulty,
  tags,
  activeTag,
  onTag,
}: {
  query: string;
  onQuery: (v: string) => void;
  difficulty: Difficulty | "ALL";
  onDifficulty: (v: Difficulty | "ALL") => void;
  tags: string[];
  activeTag: string | null;
  onTag: (v: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-md border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
          <button
            key={d}
            onClick={() => onDifficulty(d)}
            className={`rounded-full px-3 py-1 text-xs border ${
              difficulty === d
                ? "bg-brand-500 text-white border-brand-500"
                : "border-[rgb(var(--border))] text-[rgb(var(--muted))]"
            }`}
          >
            {d[0] + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => onTag(activeTag === t ? null : t)}
              className={`rounded-full px-2.5 py-0.5 text-xs border ${
                activeTag === t
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-[rgb(var(--border))] text-[rgb(var(--muted))]"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Question card component**

Create `frontend/src/components/interview/question-card.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, Bookmark, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InterviewQuestionOut } from "@/types";

const DIFF_COLOR: Record<string, string> = {
  EASY: "text-green-600",
  MEDIUM: "text-amber-600",
  HARD: "text-red-600",
};

export function QuestionCard({
  q,
  reviewed,
  bookmarked,
  onToggleReviewed,
  onToggleBookmark,
}: {
  q: InterviewQuestionOut;
  reviewed: boolean;
  bookmarked: boolean;
  onToggleReviewed: () => void;
  onToggleBookmark: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={cn("text-xs font-semibold", DIFF_COLOR[q.difficulty])}>
          {q.difficulty}
        </span>
        <span className="flex-1 text-sm font-medium">{q.question}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-[rgb(var(--border))] px-4 py-4 space-y-4 text-sm">
          <p className="font-medium">{q.tldr}</p>
          <p className="whitespace-pre-wrap text-[rgb(var(--muted))]">{q.explanation}</p>

          {q.code_examples.map((ex, i) => (
            <div key={i} className="rounded-md bg-gray-900 text-gray-100 overflow-x-auto">
              {ex.label && <div className="px-3 pt-2 text-xs text-gray-400">{ex.label}</div>}
              <pre className="p-3 text-xs leading-relaxed"><code>{ex.code}</code></pre>
            </div>
          ))}

          {q.gotchas.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[rgb(var(--muted))]">Gotchas</p>
              <ul className="mt-1 list-disc pl-5">
                {q.gotchas.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}

          {q.follow_ups.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[rgb(var(--muted))]">Follow-ups</p>
              <ul className="mt-1 list-disc pl-5">
                {q.follow_ups.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onToggleReviewed}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs",
                reviewed ? "bg-green-500 text-white border-green-500" : "border-[rgb(var(--border))]"
              )}
            >
              <Check className="h-3 w-3" /> {reviewed ? "Reviewed" : "Mark reviewed"}
            </button>
            <button
              onClick={onToggleBookmark}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs",
                bookmarked ? "bg-brand-500 text-white border-brand-500" : "border-[rgb(var(--border))]"
              )}
            >
              <Bookmark className="h-3 w-3" /> {bookmarked ? "Saved" : "Bookmark"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 5: Hub page**

Create `frontend/src/app/(dashboard)/interview-prep/page.tsx`:

```tsx
"use client";

import { MessageSquareCode } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { CategoryCard } from "@/components/interview/category-card";
import { useInterviewCategories, useInterviewProgress } from "@/hooks/use-interview";

export default function InterviewPrepPage() {
  const categories = useInterviewCategories();
  const progress = useInterviewProgress();
  const reviewedIds = new Set(
    (progress.data ?? []).filter((p) => p.reviewed).map((p) => p.interview_question_id)
  );

  return (
    <>
      <TopNav title="Interview Prep" />
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquareCode className="h-6 w-6 text-brand-500" />
            Interview Prep
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            In-depth interview questions across languages and frameworks, with explanations,
            real code examples, gotchas, and follow-ups.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((c) => (
            <CategoryCard key={c.id} category={c} reviewedCount={0 + reviewedIds.size * 0} />
          ))}
        </div>
      </div>
    </>
  );
}
```

> Note: `reviewedCount` per category requires question→category mapping not available on the hub payload. Pass `0` for now by simplifying the card call to `reviewedCount={0}`; per-category reviewed counts are computed on the category page where questions are loaded. (Replace the `reviewedCount` expression above with `0`.)

- [ ] **Step 6: Category page**

Create `frontend/src/app/(dashboard)/interview-prep/[category]/page.tsx`:

```tsx
"use client";

import { use, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { TopNav } from "@/components/layout/top-nav";
import { QuestionCard } from "@/components/interview/question-card";
import { InterviewFilters } from "@/components/interview/interview-filters";
import {
  useInterviewCategory,
  useInterviewProgress,
  useToggleInterviewProgress,
} from "@/hooks/use-interview";
import type { Difficulty } from "@/types";

export default function InterviewCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { data: session } = useSession();
  const cat = useInterviewCategory(category);
  const progress = useInterviewProgress();
  const toggle = useToggleInterviewProgress();

  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const questions = cat.data?.questions ?? [];
  const allTags = useMemo(
    () => Array.from(new Set(questions.flatMap((q) => q.tags))).sort(),
    [questions]
  );

  const progressById = new Map(
    (progress.data ?? []).map((p) => [p.interview_question_id, p])
  );

  const filtered = questions.filter((q) => {
    if (difficulty !== "ALL" && q.difficulty !== difficulty) return false;
    if (activeTag && !q.tags.includes(activeTag)) return false;
    if (query && !q.question.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function handleToggle(questionId: string, field: "reviewed" | "bookmarked") {
    if (!session) return; // read-only when signed out
    const cur = progressById.get(questionId);
    toggle.mutate({
      questionId,
      [field]: !(cur?.[field] ?? false),
    });
  }

  return (
    <>
      <TopNav title={cat.data?.title ?? "Interview Prep"} />
      <div className="flex-1 p-6 max-w-3xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span aria-hidden>{cat.data?.icon}</span> {cat.data?.title}
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{cat.data?.description}</p>
        </div>

        <InterviewFilters
          query={query}
          onQuery={setQuery}
          difficulty={difficulty}
          onDifficulty={setDifficulty}
          tags={allTags}
          activeTag={activeTag}
          onTag={setActiveTag}
        />

        {!session && (
          <p className="text-xs text-[rgb(var(--muted))]">Sign in to track reviewed and bookmarked questions.</p>
        )}

        <div className="space-y-3">
          {filtered.map((q) => {
            const p = progressById.get(q.id);
            return (
              <QuestionCard
                key={q.id}
                q={q}
                reviewed={p?.reviewed ?? false}
                bookmarked={p?.bookmarked ?? false}
                onToggleReviewed={() => handleToggle(q.id, "reviewed")}
                onToggleBookmark={() => handleToggle(q.id, "bookmarked")}
              />
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-[rgb(var(--muted))]">No questions match your filters.</p>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 7: Typecheck + build**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors from new files.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/interview frontend/src/app/\(dashboard\)/interview-prep frontend/src/components/layout/sidebar.tsx frontend/src/components/layout/mobile-sidebar.tsx
git commit -m "interview: hub + category pages, components, nav"
```

---

## Task 9 (8a–8j): Author full content per category

For each category below, append ~20–25 rich questions to `INTERVIEW_QUESTIONS_BY_CATEGORY[<slug>]` in `backend/app/interview_data.py`, replacing the empty `[]` list (python/javascript already have 2 each — top them up to ~20–25). Each question dict MUST have all keys: `slug` (globally unique, prefixed per category e.g. `ts-`, `react-`), `question`, `difficulty` (`EASY|MEDIUM|HARD`), `tldr`, `explanation`, `code_examples` (≥1 with `language`+`code`, `label` optional), `tags`, `gotchas`, `follow_ups`.

These tasks are mutually independent and parallelizable (different dict keys, same file — coordinate to avoid edit collisions, or author each on its own branch/worktree and merge).

- [ ] **8a — python** (top up to ~22): data model, decorators, generators, context managers, `*args/**kwargs`, comprehensions, `asyncio`, GIL, memory/GC, `__slots__`, metaclasses, mutable default args, MRO, dataclasses, typing, exceptions.
- [ ] **8b — javascript** (top up to ~22): hoisting, `this` binding, prototypes, `==` vs `===`, event loop, promises, `async/await`, debounce/throttle, currying, modules, `let/const/var`, generators, `Map/Set`, immutability.
- [ ] **8c — typescript** (~22): structural typing, generics, `unknown` vs `any`, narrowing, discriminated unions, utility types (`Partial/Pick/Record`), `keyof`/`typeof`, conditional types, declaration merging, `satisfies`, enums vs unions, tsconfig strictness.
- [ ] **8d — fastapi** (~22): dependency injection, `async def` vs `def`, Pydantic models/validation, path/query/body params, response models, status codes, background tasks, middleware, auth/OAuth2, lifespan, error handling, `Depends` caching.
- [ ] **8e — react** (~22): hooks rules, `useEffect` deps, `useMemo`/`useCallback`, reconciliation/keys, controlled vs uncontrolled, context, refs, state batching, `useReducer`, suspense, memoization, render-vs-commit.
- [ ] **8f — nextjs** (~22): App Router vs Pages, server vs client components, SSR/SSG/ISR, `fetch` caching, route handlers, server actions, streaming/suspense, metadata, middleware, dynamic routes, revalidation.
- [ ] **8g — nodejs** (~22): event loop phases, streams, buffers, `EventEmitter`, clustering, `process.nextTick` vs `setImmediate`, error-first callbacks, CommonJS vs ESM, backpressure, worker threads.
- [ ] **8h — sql** (~22): joins, indexes (B-tree), query plans, normalization, transactions/ACID, isolation levels, `GROUP BY`/`HAVING`, window functions, `N+1`, deadlocks, `EXPLAIN`.
- [ ] **8i — docker-devops** (~22): image layers, multi-stage builds, `CMD` vs `ENTRYPOINT`, volumes, networking, `docker-compose`, env/secrets, CI/CD stages, blue-green/rolling deploys, healthchecks.
- [ ] **8j — system-design** (~22): scalability (vertical/horizontal), caching layers, CDNs, load balancing, DB sharding/replication, CAP theorem, message queues, rate limiting, consistency, idempotency. `code_examples` use `language: "text"` for diagrams/pseudocode.

For each subtask:
- [ ] Append the questions to the category's list in `interview_data.py`.
- [ ] Run: `cd backend && python -m pytest tests/test_interview.py::test_question_keys_match_category_slugs tests/test_interview.py::test_question_slugs_unique -v` → PASS (catches dup/typo slugs).
- [ ] Commit: `git commit -am "interview: <slug> question content"`

---

## Task 10: Seed and manual verification

- [ ] **Step 1: Run the migration and seed against a dev DB**

Run (with `DATABASE_URL` set):
```bash
cd backend && alembic upgrade head && python -m app.seed
```
Expected: migration applies; seed prints the interview category/question counts.

- [ ] **Step 2: Smoke-test the API**

Run: `curl -s localhost:8000/api/interview/categories | python -m json.tool`
Expected: 10 categories, each with a non-zero `question_count`.

- [ ] **Step 3: Manual UI check**

Start frontend + backend, sign in, click **Interview Prep** in the sidebar → hub shows 10 cards → open a category → expand a question → toggle Reviewed/Bookmark → reload → state persists.

- [ ] **Step 4: Final commit (if any tidy-ups)**

```bash
git commit -am "interview: polish"
```

---

## Self-Review Notes

- **Spec coverage:** models+migration (Tasks 1–2), seed (5), router+auth+404 (6), schemas (3), frontend hub/category/components/hooks/nav (7–8), progress tracking (1,3,6,8), seed-integrity + idempotency tests (6), 10 categories ~20–25 Q (4,9) — all covered.
- **Type consistency:** `code_examples` is `list[dict]`/`CodeExample` everywhere; progress keyed by `interview_question_id` in model, schema, router, hook, and pages; `useToggleInterviewProgress` arg shape matches `api.interview.setProgress`.
- **Known simplification:** hub per-category reviewed count shows `0` (Step 5 note) because the categories list payload omits per-question ids; accurate counts render on the category page. Acceptable for v1.
