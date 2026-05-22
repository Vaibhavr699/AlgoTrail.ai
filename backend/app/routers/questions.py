from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Question
from app.schemas import QuestionOut

router = APIRouter()


@router.get("", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    return db.query(Question).order_by(Question.topic_id, Question.order).all()


@router.get("/{slug}", response_model=QuestionOut)
def get_question(slug: str, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.slug == slug).first()
    if q is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
