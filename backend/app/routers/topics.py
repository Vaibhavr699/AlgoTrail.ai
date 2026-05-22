from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Topic
from app.schemas import TopicOut, TopicWithQuestions

router = APIRouter()


@router.get("", response_model=list[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).order_by(Topic.order).all()


@router.get("/{slug}", response_model=TopicWithQuestions)
def get_topic(slug: str, db: Session = Depends(get_db)):
    topic = (
        db.query(Topic)
        .options(selectinload(Topic.questions))
        .filter(Topic.slug == slug)
        .first()
    )
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic
