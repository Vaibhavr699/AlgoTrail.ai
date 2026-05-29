"""JWT access-token issuance and validation.

Tokens are signed (HS256) with ``JWT_SECRET`` and carry the user id in ``sub``.
This backend both issues and verifies the token; NextAuth simply stores it as an
opaque string inside its session, so ``JWT_SECRET`` is independent of the
frontend's ``NEXTAUTH_SECRET`` and need not be shared. There is no encryption —
never put secrets in the payload, only identifiers.
"""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import get_settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


def create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Return the validated payload, or ``None`` if the token is invalid/expired."""
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        return None


# --- Single-purpose tokens (email verification, password reset) ---------------
#
# These embed a ``purpose`` claim so a verification link can't be replayed as a
# reset link (or vice versa). ``secret_salt`` is appended to the signing key:
# pass the user's password hash for reset tokens so the link self-invalidates the
# moment the password changes (i.e. after one successful use).


def create_purpose_token(
    user_id: str, purpose: str, expires_minutes: int, secret_salt: str = ""
) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "purpose": purpose,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret + secret_salt, algorithm=ALGORITHM)


def unverified_subject(token: str) -> str | None:
    """Peek at the ``sub`` claim without verifying — used to load the user whose
    password hash is needed to verify a reset token's signature."""
    try:
        return jwt.get_unverified_claims(token).get("sub")
    except JWTError:
        return None


def decode_purpose_token(token: str, purpose: str, secret_salt: str = "") -> dict | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret + secret_salt, algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("purpose") != purpose:
        return None
    return payload
