"""Notification preference + weekly-digest preview."""
from tests.conftest import requires_db

REGISTER = {"name": "Ada", "email": "ada@example.com", "password": "supersecret123"}


def _token(client) -> str:
    client.post("/api/auth/register", json=REGISTER)
    return client.post(
        "/api/auth/login", json={"email": REGISTER["email"], "password": REGISTER["password"]}
    ).json()["access_token"]


@requires_db
def test_weekly_digest_defaults_on_and_can_toggle(db_client):
    headers = {"Authorization": f"Bearer {_token(db_client)}"}

    got = db_client.get("/api/account/notifications", headers=headers)
    assert got.status_code == 200
    assert got.json()["weekly_digest"] is True

    db_client.patch("/api/account/notifications", json={"weekly_digest": False}, headers=headers)
    assert db_client.get("/api/account/notifications", headers=headers).json()["weekly_digest"] is False


@requires_db
def test_digest_preview_sends_and_returns_numbers(db_client, monkeypatch):
    import app.digest as digest

    captured = {}
    monkeypatch.setattr(
        digest, "send_weekly_digest_email", lambda to, name, data, base: captured.update(to=to, data=data)
    )

    headers = {"Authorization": f"Bearer {_token(db_client)}"}
    r = db_client.post("/api/account/digest-preview", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body["sent_to"] == REGISTER["email"]
    # All expected metrics present (zeros are fine for a brand-new account).
    for key in ("solved_this_week", "total_solved", "streak", "readiness", "due_for_review"):
        assert key in body["digest"]
    assert captured["to"] == REGISTER["email"]
