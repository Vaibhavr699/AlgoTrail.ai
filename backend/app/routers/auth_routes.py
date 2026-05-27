import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

router = APIRouter()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class OAuthSyncRequest(BaseModel):
    provider: str
    email: str
    name: str | None = None
    image: str | None = None


class UserOut(BaseModel):
    id: str
    email: str
    name: str | None
    image: str | None


@router.post("/register", response_model=UserOut)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        provider="credentials",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, name=user.name, image=user.image)


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return UserOut(id=user.id, email=user.email, name=user.name, image=user.image)


@router.post("/oauth", response_model=UserOut)
def oauth_sync(body: OAuthSyncRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user is None:
        user = User(
            email=body.email,
            name=body.name,
            image=body.image,
            provider=body.provider,
        )
        db.add(user)
    else:
        if body.name and not user.name:
            user.name = body.name
        if body.image:
            user.image = body.image
        if not user.provider:
            user.provider = body.provider
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, name=user.name, image=user.image)
