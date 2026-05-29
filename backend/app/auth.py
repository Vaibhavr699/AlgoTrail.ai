"""Auth dependency: resolves the current user from a signed JWT.

- The frontend sends ``Authorization: Bearer <jwt>`` where the JWT was issued by
  this backend at login/oauth and signed with ``JWT_SECRET``. The token's ``sub``
  claim is the user id; we validate the signature + expiry and load that user.
- In development only (``ENVIRONMENT=development``) and only when NO token is
  supplied, we fall back to a demo user so the UI works without OAuth configured.
  A present-but-invalid token is always rejected, even in development.
"""
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User
from app.security import decode_access_token

DEMO_USER_EMAIL = "demo@trackmydsa.local"
DEMO_USER_NAME = "Demo User"


def get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if user is None:
        user = User(email=DEMO_USER_EMAIL, name=DEMO_USER_NAME, provider="demo")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(None),
) -> User:
    settings = get_settings()

    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        payload = decode_access_token(token)
        user_id = payload.get("sub") if payload else None
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    if settings.environment == "development":
        return get_or_create_demo_user(db)

    raise HTTPException(status_code=401, detail="Not authenticated.")
