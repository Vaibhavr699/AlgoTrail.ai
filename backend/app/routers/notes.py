from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.models import Note, Question, User
from app.schemas import NoteOut, NoteUpsert

router = APIRouter()


@router.get("/{question_slug}", response_model=NoteOut | None)
def get_note(
    question_slug: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Question).filter(Question.slug == question_slug).first()
    if q is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db.query(Note).filter(Note.user_id == user.id, Note.question_id == q.id).first()


@router.post("", response_model=NoteOut)
def upsert_note(
    payload: NoteUpsert,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Question).filter(Question.id == payload.question_id).first()
    if q is None:
        raise HTTPException(status_code=404, detail="Question not found")

    note = db.query(Note).filter(Note.user_id == user.id, Note.question_id == q.id).first()
    if note is None:
        note = Note(
            user_id=user.id,
            question_id=q.id,
            content=payload.content,
            language=payload.language,
            code_snippet=payload.code_snippet,
        )
        db.add(note)
    else:
        note.content = payload.content
        note.language = payload.language
        note.code_snippet = payload.code_snippet

    db.commit()
    db.refresh(note)
    return note
