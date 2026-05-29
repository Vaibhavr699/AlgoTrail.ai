"""End-to-end auth + AI-quota behaviour against a real (test) database."""
from tests.conftest import requires_db

REGISTER = {"name": "Ada", "email": "ada@example.com", "password": "supersecret123"}


def _register_and_login(client) -> str:
    r = client.post("/api/auth/register", json=REGISTER)
    assert r.status_code == 200, r.text

    r = client.post("/api/auth/login", json={"email": REGISTER["email"], "password": REGISTER["password"]})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["access_token"]
    return body["access_token"]


@requires_db
def test_register_then_login_issues_token(db_client):
    token = _register_and_login(db_client)
    assert isinstance(token, str) and len(token) > 20


@requires_db
def test_login_with_wrong_password_is_401(db_client):
    db_client.post("/api/auth/register", json=REGISTER)
    r = db_client.post("/api/auth/login", json={"email": REGISTER["email"], "password": "wrong"})
    assert r.status_code == 401


@requires_db
def test_email_is_normalized_case_insensitively(db_client):
    db_client.post("/api/auth/register", json=REGISTER)
    r = db_client.post("/api/auth/login", json={"email": "ADA@example.com", "password": REGISTER["password"]})
    assert r.status_code == 200


@requires_db
def test_protected_endpoint_requires_valid_token(db_client):
    token = _register_and_login(db_client)

    ok = db_client.get("/api/ai/usage", headers={"Authorization": f"Bearer {token}"})
    assert ok.status_code == 200
    assert ok.json()["used"] == 0

    bad = db_client.get("/api/ai/usage", headers={"Authorization": "Bearer forged"})
    assert bad.status_code == 401


@requires_db
def test_ai_call_meters_usage(db_client):
    token = _register_and_login(db_client)
    headers = {"Authorization": f"Bearer {token}"}

    # No OpenAI key in tests -> 503, but the quota dependency runs first and counts.
    r = db_client.post("/api/ai/teach-pattern", json={"pattern_name": "Two Pointers"}, headers=headers)
    assert r.status_code == 503

    usage = db_client.get("/api/ai/usage", headers=headers).json()
    assert usage["used"] == 1
    assert usage["remaining"] == usage["limit"] - 1


@requires_db
def test_oauth_sync_creates_user_and_issues_token(db_client):
    r = db_client.post(
        "/api/auth/oauth",
        json={"provider": "google", "email": "g@example.com", "name": "G"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["access_token"]


@requires_db
def test_email_verification_flow(db_client, monkeypatch):
    import app.routers.auth_routes as ar

    captured = {}
    monkeypatch.setattr(ar, "send_verification_email", lambda to, link: captured.update(link=link))

    db_client.post("/api/auth/register", json=REGISTER)
    assert "link" in captured, "registration should trigger a verification email"
    token = captured["link"].split("token=")[1]

    ok = db_client.post("/api/auth/verify-email", json={"token": token})
    assert ok.status_code == 200 and ok.json()["status"] == "verified"

    bad = db_client.post("/api/auth/verify-email", json={"token": "garbage"})
    assert bad.status_code == 400


@requires_db
def test_password_reset_flow_and_single_use(db_client, monkeypatch):
    import app.routers.auth_routes as ar

    captured = {}
    monkeypatch.setattr(ar, "send_password_reset_email", lambda to, link: captured.update(link=link))

    db_client.post("/api/auth/register", json=REGISTER)
    assert db_client.post("/api/auth/forgot-password", json={"email": REGISTER["email"]}).status_code == 200
    token = captured["link"].split("token=")[1]

    r = db_client.post("/api/auth/reset-password", json={"token": token, "password": "brandnewpass1"})
    assert r.status_code == 200

    # Old password no longer works; new one does.
    old = db_client.post("/api/auth/login", json={"email": REGISTER["email"], "password": REGISTER["password"]})
    assert old.status_code == 401
    new = db_client.post("/api/auth/login", json={"email": REGISTER["email"], "password": "brandnewpass1"})
    assert new.status_code == 200

    # The reset token is single-use: reusing it after the password changed fails.
    reuse = db_client.post("/api/auth/reset-password", json={"token": token, "password": "yetanother12"})
    assert reuse.status_code == 400


@requires_db
def test_forgot_password_unknown_email_is_silent_200(db_client):
    # No account enumeration: unknown emails get the same 200 response.
    r = db_client.post("/api/auth/forgot-password", json={"email": "nobody@nowhere.com"})
    assert r.status_code == 200
