"""Dev-mode auth: returns a single seeded demo user.

Phase 2 will replace this with NextAuth-signed JWT validation. For now, every
request resolves to the same user so the UI can be exercised end-to-end without
a real OAuth provider configured.
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

DEMO_USER_EMAIL = "demo@trackmydsa.local"
DEMO_USER_NAME = "Demo User"


def get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if user is None:
        user = User(email=DEMO_USER_EMAIL, name=DEMO_USER_NAME)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def current_user(db: Session = Depends(get_db)) -> User:
    return get_or_create_demo_user(db)
