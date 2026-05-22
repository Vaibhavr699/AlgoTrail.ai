from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import notes, progress, questions, stats, topics

settings = get_settings()

app = FastAPI(
    title="Track My DSA API",
    description="Backend for the Track My DSA tracker",
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
    return {"name": "Track My DSA API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
