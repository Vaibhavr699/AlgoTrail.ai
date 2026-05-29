"""Billing scaffold behaviour. Stripe is unconfigured in tests, so paid
endpoints must degrade to 503 rather than error, and new users start on free."""
from tests.conftest import requires_db

REGISTER = {"name": "Ada", "email": "ada@example.com", "password": "supersecret123"}


def _token(client) -> str:
    client.post("/api/auth/register", json=REGISTER)
    r = client.post("/api/auth/login", json={"email": REGISTER["email"], "password": REGISTER["password"]})
    return r.json()["access_token"]


@requires_db
def test_new_user_is_on_free_plan(db_client):
    token = _token(db_client)
    r = db_client.get("/api/billing/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["plan"] == "free"
    assert body["billing_configured"] is False
    assert body["daily_limit"] >= 1


@requires_db
def test_checkout_is_503_when_stripe_unconfigured(db_client):
    token = _token(db_client)
    r = db_client.post("/api/billing/checkout", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 503


@requires_db
def test_usage_reports_free_plan_limit(db_client):
    token = _token(db_client)
    r = db_client.get("/api/ai/usage", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["plan"] == "free"


def test_webhook_rejected_without_secret(client):
    # No STRIPE_WEBHOOK_SECRET configured -> 503 (never silently accept events).
    r = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "x"})
    assert r.status_code == 503
