"""Auth dependency: resolves the current user.

- In development (no JWT_SECRET or ENVIRONMENT=development): falls back to
  a demo user so the UI works without OAuth configured.
- In production: expects an `Authorization: Bearer <email>` header that
  matches a registered user. A full JWT validation will replace this once
  NextAuth is deployed with a shared secret.
"""
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User

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
        email = authorization[7:].strip()
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return user
            raise HTTPException(status_code=401, detail="User not found.")

    if settings.environment == "development":
        return get_or_create_demo_user(db)

    raise HTTPException(status_code=401, detail="Not authenticated.")
