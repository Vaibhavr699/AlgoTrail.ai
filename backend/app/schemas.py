from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import Difficulty, Status


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    topic_id: str
    title: str
    slug: str
    difficulty: Difficulty
    pattern: str
    leetcode_id: int | None
    leetcode_slug: str | None
    order: int
    hint: str | None
    key_insight: str | None
    companies: list[str]


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    icon: str
    order: int
    estimated_days: int
    description: str
    patterns: list[str]
    color: str


class TopicWithQuestions(TopicOut):
    questions: list[QuestionOut] = []


class ProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    question_id: str
    status: Status
    solved_at: datetime | None
    attempts: int
    time_spent: int
    revisit_at: datetime | None


class ProgressUpdate(BaseModel):
    question_id: str
    status: Status
    time_spent: int | None = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    question_id: str
    content: str
    language: str
    code_snippet: str | None
    updated_at: datetime


class NoteUpsert(BaseModel):
    question_id: str
    content: str
    language: str = "python"
    code_snippet: str | None = None


class StatsOut(BaseModel):
    total_solved: int
    streak: int
    longest_streak: int
    by_difficulty: dict[str, int]
    by_topic: list[dict]
    activity: list[dict]
    readiness: dict[str, float]


class ProgressMutationResult(BaseModel):
    progress: ProgressOut
    new_streak: int
    xp_gained: int
