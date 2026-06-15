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
                 "code": "from concurrent.futures import ProcessPoolExecutor\n\ndef work(n):\n    return sum(i * i for i in range(n))\n\nwith ProcessPoolExecutor() as ex:\n    results = list(ex.map(work, [1_000_000] * 4))"},
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
