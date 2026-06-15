import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    ARRAY,
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Difficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class Status(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    SOLVED = "SOLVED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


def _cuid() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    provider: Mapped[str | None] = mapped_column(String, nullable=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    email_weekly_digest: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    streak: Mapped[int] = mapped_column(Integer, default=0)
    last_solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    xp: Mapped[int] = mapped_column(Integer, default=0)

    # Billing / subscription
    plan: Mapped[str] = mapped_column(String, default="free")
    plan_status: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_customer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String, nullable=True)

    progress: Mapped[list["Progress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["StudySession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    interview_progress: Mapped[list["InterviewProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    order: Mapped[int] = mapped_column(Integer)
    estimated_days: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(String)
    patterns: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    color: Mapped[str] = mapped_column(String)

    questions: Mapped[list["Question"]] = relationship(
        back_populates="topic", cascade="all, delete-orphan", order_by="Question.order"
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    topic_id: Mapped[str] = mapped_column(String, ForeignKey("topics.id"), index=True)
    title: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    difficulty: Mapped[Difficulty] = mapped_column(SAEnum(Difficulty, name="difficulty"))
    pattern: Mapped[str] = mapped_column(String)
    leetcode_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    leetcode_slug: Mapped[str | None] = mapped_column(String, nullable=True)
    order: Mapped[int] = mapped_column(Integer)
    hint: Mapped[str | None] = mapped_column(String, nullable=True)
    key_insight: Mapped[str | None] = mapped_column(String, nullable=True)
    companies: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    topic: Mapped["Topic"] = relationship(back_populates="questions")
    progress: Mapped[list["Progress"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_progress_user_question"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), index=True)
    status: Mapped[Status] = mapped_column(SAEnum(Status, name="status"), default=Status.NOT_STARTED)
    solved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    time_spent: Mapped[int] = mapped_column(Integer, default=0)
    revisit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="progress")
    question: Mapped["Question"] = relationship(back_populates="progress")


class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_notes_user_question"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), index=True)
    content: Mapped[str] = mapped_column(String, default="")
    language: Mapped[str] = mapped_column(String, default="python")
    code_snippet: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="notes")
    question: Mapped["Question"] = relationship(back_populates="notes")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    solved: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="sessions")


class AiUsage(Base):
    """Per-user, per-day count of AI requests.

    Backs the daily quota (cost control / abuse prevention) and is the metering
    foundation for plan-based limits once billing lands.
    """

    __tablename__ = "ai_usage"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_ai_usage_user_day"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_cuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    count: Mapped[int] = mapped_column(Integer, default=0)


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
        UniqueConstraint(
            "user_id", "interview_question_id", name="uq_interview_progress_user_question"
        ),
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
