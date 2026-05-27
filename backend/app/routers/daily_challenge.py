import hashlib
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Question
from app.schemas import DailyChallengeOut

router = APIRouter()


def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


def _pick_question_index(day: date, total: int) -> int:
    """Deterministic index based on the date string."""
    seed = hashlib.sha256(day.isoformat().encode()).hexdigest()
    return int(seed, 16) % total


@router.get("", response_model=DailyChallengeOut)
def get_daily_challenge(db: Session = Depends(get_db)):
    total = db.query(Question).count()
    if total == 0:
        raise HTTPException(status_code=404, detail="No questions available")

    today = _today_utc()
    idx = _pick_question_index(today, total)

    question = (
        db.query(Question)
        .options(joinedload(Question.topic))
        .order_by(Question.topic_id, Question.order)
        .offset(idx)
        .limit(1)
        .first()
    )
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    return DailyChallengeOut(
        question_id=question.id,
        title=question.title,
        slug=question.slug,
        difficulty=question.difficulty,
        pattern=question.pattern,
        leetcode_id=question.leetcode_id,
        leetcode_slug=question.leetcode_slug,
        topic_title=question.topic.title,
        topic_slug=question.topic.slug,
        topic_icon=question.topic.icon,
        topic_color=question.topic.color,
        date=today.isoformat(),
    )
