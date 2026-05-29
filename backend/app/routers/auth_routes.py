from datetime import datetime, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.email import send_password_reset_email, send_verification_email
from app.models import User
from app.security import (
    create_access_token,
    create_purpose_token,
    decode_purpose_token,
    unverified_subject,
)

router = APIRouter()

VERIFY_TOKEN_MINUTES = 60 * 24  # 24 hours
RESET_TOKEN_MINUTES = 60  # 1 hour


def _send_verification(user: User) -> None:
    token = create_purpose_token(user.id, "verify-email", VERIFY_TOKEN_MINUTES)
    link = f"{get_settings().public_base_url}/verify-email?token={token}"
    send_verification_email(user.email, link)


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


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str | None
    image: str | None


class AuthResponse(BaseModel):
    id: str
    email: str
    name: str | None
    image: str | None
    access_token: str


@router.post("/register", response_model=UserOut)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    email = body.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        email=email,
        name=body.name,
        hashed_password=hash_password(body.password),
        provider="credentials",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _send_verification(user)
    return UserOut(id=user.id, email=user.email, name=user.name, image=user.image)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user.id, user.email)
    return AuthResponse(
        id=user.id, email=user.email, name=user.name, image=user.image, access_token=token
    )


@router.post("/oauth", response_model=AuthResponse)
def oauth_sync(body: OAuthSyncRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            email=email,
            name=body.name,
            image=body.image,
            provider=body.provider,
            email_verified_at=datetime.now(timezone.utc),  # provider vouches for the email
        )
        db.add(user)
    else:
        if user.email_verified_at is None:
            user.email_verified_at = datetime.now(timezone.utc)
        if body.name and not user.name:
            user.name = body.name
        if body.image:
            user.image = body.image
        if not user.provider:
            user.provider = body.provider
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return AuthResponse(
        id=user.id, email=user.email, name=user.name, image=user.image, access_token=token
    )


@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    payload = decode_purpose_token(body.token, "verify-email")
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=400, detail="This verification link is invalid or expired.")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if user is None:
        raise HTTPException(status_code=400, detail="This verification link is invalid or expired.")
    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(timezone.utc)
        db.commit()
    return {"status": "verified"}


@router.post("/resend-verification")
def resend_verification(body: ResendVerificationRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    # Always 200 regardless, to avoid leaking which emails are registered.
    if user and user.email_verified_at is None:
        _send_verification(user)
    return {"status": "ok"}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    # Only credentials accounts have a password to reset; respond 200 either way.
    if user and user.hashed_password:
        token = create_purpose_token(
            user.id, "reset-password", RESET_TOKEN_MINUTES, secret_salt=user.hashed_password
        )
        link = f"{get_settings().public_base_url}/reset-password?token={token}"
        send_password_reset_email(user.email, link)
    return {"status": "ok"}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user_id = unverified_subject(body.token)
    user = db.query(User).filter(User.id == user_id).first() if user_id else None
    # The token is salted with the current password hash, so it stops working
    # after the first successful reset.
    if user is None or not user.hashed_password:
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired.")
    payload = decode_purpose_token(body.token, "reset-password", secret_salt=user.hashed_password)
    if not payload:
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired.")

    user.hashed_password = hash_password(body.password)
    db.commit()
    return {"status": "ok"}
