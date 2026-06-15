from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.auth import current_user
from app.database import get_db
from app.models import InterviewCategory, InterviewProgress, InterviewQuestion, User
from app.schemas import (
    InterviewCategoryOut,
    InterviewCategoryWithQuestions,
    InterviewProgressOut,
    InterviewProgressUpdate,
)

router = APIRouter()


@router.get("/categories", response_model=list[InterviewCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = (
        db.query(InterviewCategory)
        .options(selectinload(InterviewCategory.questions))
        .order_by(InterviewCategory.order)
        .all()
    )
    out = []
    for c in cats:
        item = InterviewCategoryOut.model_validate(c)
        item.question_count = len(c.questions)
        out.append(item)
    return out


@router.get("/categories/{slug}", response_model=InterviewCategoryWithQuestions)
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = (
        db.query(InterviewCategory)
        .options(selectinload(InterviewCategory.questions))
        .filter(InterviewCategory.slug == slug)
        .first()
    )
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    out = InterviewCategoryWithQuestions.model_validate(cat)
    out.question_count = len(cat.questions)
    return out


@router.get("/progress", response_model=list[InterviewProgressOut])
def list_progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(InterviewProgress).filter(InterviewProgress.user_id == user.id).all()


@router.post("/progress/{question_id}", response_model=InterviewProgressOut)
def upsert_progress(
    question_id: str,
    payload: InterviewProgressUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    question = (
        db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    )
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    row = (
        db.query(InterviewProgress)
        .filter(
            InterviewProgress.user_id == user.id,
            InterviewProgress.interview_question_id == question_id,
        )
        .first()
    )
    if row is None:
        row = InterviewProgress(user_id=user.id, interview_question_id=question_id)
        db.add(row)
    if payload.reviewed is not None:
        row.reviewed = payload.reviewed
    if payload.bookmarked is not None:
        row.bookmarked = payload.bookmarked
    db.commit()
    db.refresh(row)
    return row
