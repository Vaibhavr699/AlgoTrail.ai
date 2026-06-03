"""Weekly progress digest.

``build_digest`` computes a user's weekly summary (reusing the same notions of
solved / streak / readiness / review-due that the app already tracks).
``send_weekly_digests`` is the entry point for the scheduled job:

    python -m app.digest

It emails every opted-in user who has solved at least one problem (so we never
spam dormant sign-ups), using the SMTP layer (console fallback in dev).
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.email import send_weekly_digest_email
from app.models import Progress, Question, Status, User
from app.observability import logger


def build_digest(db: Session, user: User) -> dict:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    solved_q = db.query(Progress).filter(
        Progress.user_id == user.id, Progress.status == Status.SOLVED
    )
    total_solved = solved_q.count()
    solved_this_week = solved_q.filter(Progress.solved_at >= week_ago).count()

    total_questions = db.query(Question).count()
    readiness = round(total_solved / total_questions * 100, 1) if total_questions else 0.0

    due_for_review = (
        db.query(Progress)
        .filter(Progress.user_id == user.id)
        .filter(
            or_(
                and_(Progress.revisit_at.isnot(None), Progress.revisit_at <= now),
                Progress.status == Status.NEEDS_REVIEW,
            )
        )
        .count()
    )

    return {
        "solved_this_week": solved_this_week,
        "total_solved": total_solved,
        "streak": user.streak,
        "readiness": readiness,
        "due_for_review": due_for_review,
    }


def send_digest_to(db: Session, user: User) -> dict:
    """Build and send a digest to one user; returns the digest data."""
    data = build_digest(db, user)
    base = get_settings().public_base_url
    send_weekly_digest_email(user.email, user.name, data, base)
    return data


def send_weekly_digests() -> int:
    db = SessionLocal()
    sent = 0
    try:
        users = (
            db.query(User)
            .filter(User.email_weekly_digest.is_(True))
            .filter(~User.email.like("%trackmydsa.local"))  # skip the demo user
            .all()
        )
        for user in users:
            data = build_digest(db, user)
            if data["total_solved"] == 0:
                continue  # never engaged — don't email
            send_weekly_digest_email(user.email, user.name, data, get_settings().public_base_url)
            sent += 1
    finally:
        db.close()
    logger.info("weekly digest run complete: sent=%d", sent)
    return sent


if __name__ == "__main__":
    send_weekly_digests()
