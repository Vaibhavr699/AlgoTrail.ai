from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import ai, auth_routes, daily_challenge, leetcode, notes, progress, questions, stats, topics

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.seed import main as run_seed

    run_seed()
    yield


app = FastAPI(
    title="AlgoTrail.ai API",
    description="Backend for the AlgoTrail.ai tracker",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "AlgoTrail.ai API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(leetcode.router, prefix="/api/leetcode", tags=["leetcode"])
app.include_router(daily_challenge.router, prefix="/api/daily-challenge", tags=["daily-challenge"])
