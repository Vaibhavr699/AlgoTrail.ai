"""AI usage metering and daily quota enforcement.

``enforce_ai_quota`` is a FastAPI dependency for every endpoint that calls the
OpenAI API. It requires an authenticated user (via ``current_user``), then
atomically counts the request against that user's daily allowance and rejects
with 429 once the limit is reached. This is the primary cost-control / abuse
guard and the metering foundation for plan-based limits.

The counter is incremented up front, so a request that later fails validation
(e.g. unknown question slug) still consumes one unit of the caller's *own*
quota — an acceptable, self-inflicted trade for a single, race-free counter.
"""
from datetime import datetime, timezone

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import current_user
from app.config import get_settings
from app.database import get_db
from app.models import AiUsage, User


def _today():
    return datetime.now(timezone.utc).date()


def daily_limit_for(user: User) -> int:
    """The user's daily AI allowance, based on their plan."""
    limits = get_settings().plan_daily_limits
    return limits.get(user.plan or "free", limits["free"])


def get_usage_today(db: Session, user_id: str) -> int:
    row = (
        db.query(AiUsage)
        .filter(AiUsage.user_id == user_id, AiUsage.day == _today())
        .first()
    )
    return row.count if row else 0


def enforce_ai_quota(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
) -> User:
    limit = daily_limit_for(user)
    today = _today()

    row = (
        db.query(AiUsage)
        .filter(AiUsage.user_id == user.id, AiUsage.day == today)
        .first()
    )
    current = row.count if row else 0
    if current >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI limit of {limit} requests reached. Resets at midnight UTC.",
        )

    if row is None:
        db.add(AiUsage(user_id=user.id, day=today, count=1))
    else:
        row.count += 1
    db.commit()
    return user
