from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.models import Progress, Question, Status, User
from app.schemas import ProgressMutationResult, ProgressOut, ProgressUpdate

router = APIRouter()


def _update_streak(user: User, now: datetime) -> int:
    last = user.last_solved_at
    if last is None:
        user.streak = 1
    else:
        delta = (now.date() - last.date()).days
        if delta == 0:
            pass  # already solved today, streak unchanged
        elif delta == 1:
            user.streak += 1
        else:
            user.streak = 1
    user.last_solved_at = now
    if user.streak > user.longest_streak:
        user.longest_streak = user.streak
    return user.streak


@router.get("", response_model=list[ProgressOut])
def list_progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Progress).filter(Progress.user_id == user.id).all()


@router.patch("", response_model=ProgressMutationResult)
def upsert_progress(
    payload: ProgressUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == payload.question_id).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    progress = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.question_id == question.id)
        .first()
    )
    is_new_solve = False
    if progress is None:
        progress = Progress(user_id=user.id, question_id=question.id, status=payload.status)
        db.add(progress)
    else:
        if progress.status != Status.SOLVED and payload.status == Status.SOLVED:
            is_new_solve = True
        progress.status = payload.status

    if payload.time_spent is not None:
        progress.time_spent = (progress.time_spent or 0) + payload.time_spent

    xp_gained = 0
    new_streak = user.streak
    now = datetime.now(timezone.utc)

    if payload.status == Status.SOLVED:
        if progress.solved_at is None:
            progress.solved_at = now
            is_new_solve = True
        if is_new_solve:
            xp_per_difficulty = {"EASY": 10, "MEDIUM": 25, "HARD": 50}
            xp_gained = xp_per_difficulty.get(question.difficulty.value, 10)
            user.xp += xp_gained
            new_streak = _update_streak(user, now)
        if question.difficulty.value == "HARD" and progress.revisit_at is None:
            progress.revisit_at = now + timedelta(days=3)

    progress.attempts = (progress.attempts or 0) + 1

    db.commit()
    db.refresh(progress)
    db.refresh(user)
    return ProgressMutationResult(progress=progress, new_streak=new_streak, xp_gained=xp_gained)
