"""Account-level settings: notification preferences and a digest preview."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.digest import build_digest, send_digest_to
from app.models import User

router = APIRouter()


class NotificationPrefs(BaseModel):
    weekly_digest: bool


@router.get("/notifications", response_model=NotificationPrefs)
def get_notifications(user: User = Depends(current_user)):
    return NotificationPrefs(weekly_digest=user.email_weekly_digest)


@router.patch("/notifications", response_model=NotificationPrefs)
def update_notifications(
    body: NotificationPrefs,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    user.email_weekly_digest = body.weekly_digest
    db.commit()
    return NotificationPrefs(weekly_digest=user.email_weekly_digest)


@router.post("/digest-preview")
def digest_preview(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    """Send this week's digest to the current user now (handy for testing) and
    return the computed numbers so the UI can preview them too."""
    data = send_digest_to(db, user)
    return {"sent_to": user.email, "digest": data}
