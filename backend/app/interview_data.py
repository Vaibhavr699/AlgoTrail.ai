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

from app.interview_content import QUESTIONS_BY_CATEGORY as INTERVIEW_QUESTIONS_BY_CATEGORY  # noqa: E402
