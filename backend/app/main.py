from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import ai, auth_routes, leetcode, notes, progress, questions, stats, topics

settings = get_settings()

app = FastAPI(
    title="AlgoTrail.ai API",
    description="Backend for the AlgoTrail.ai tracker",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
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
