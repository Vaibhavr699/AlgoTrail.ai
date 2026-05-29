"""JWT issuance/validation — the core of the auth fix."""
from app.security import create_access_token, decode_access_token


def test_valid_token_round_trips():
    token = create_access_token("user-123", "a@b.com")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["email"] == "a@b.com"
    assert "exp" in payload


def test_tampered_token_is_rejected():
    token = create_access_token("user-123", "a@b.com")
    assert decode_access_token(token + "tampered") is None


def test_raw_email_is_not_a_valid_token():
    # The old bypass: a bare email used as a bearer token must now be rejected.
    assert decode_access_token("demo@trackmydsa.local") is None


def test_garbage_token_is_rejected():
    assert decode_access_token("not.a.jwt") is None
    assert decode_access_token("") is None
