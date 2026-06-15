from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import get_settings
from app.database import SessionLocal
from app.observability import RequestLoggingMiddleware, init_sentry, logger, setup_logging
from app.routers import account, ai, auth_routes, billing, daily_challenge, interview, leetcode, notes, progress, questions, stats, topics

settings = get_settings()

setup_logging()
init_sentry()


# Schema is managed by Alembic migrations (`alembic upgrade head`) and data by
# the seed script (`python -m app.seed`), both run at deploy time — not on boot.
app = FastAPI(
    title="AlgoTrail.ai API",
    description="Backend for the AlgoTrail.ai tracker",
    version="0.1.0",
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "AlgoTrail.ai API", "version": "0.1.0"}


@app.get("/health")
def health():
    """Readiness probe: confirms the process is up AND the database is reachable."""
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception:
        logger.exception("health check: database unreachable")
        return JSONResponse(status_code=503, content={"status": "degraded", "db": "error"})
    return {"status": "ok", "db": "ok"}


app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(leetcode.router, prefix="/api/leetcode", tags=["leetcode"])
app.include_router(daily_challenge.router, prefix="/api/daily-challenge", tags=["daily-challenge"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
app.include_router(account.router, prefix="/api/account", tags=["account"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
