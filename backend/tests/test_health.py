"""Smoke tests that need no database."""


def test_health_reports_db_status(client):
    res = client.get("/health")
    body = res.json()
    if res.status_code == 200:
        assert body == {"status": "ok", "db": "ok"}
    else:
        assert res.status_code == 503
        assert body["db"] == "error"


def test_root_metadata(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["name"] == "AlgoTrail.ai API"


def test_protected_endpoint_rejects_invalid_token(client):
    # An invalid bearer token is rejected before any DB access (401, not 500).
    res = client.get("/api/ai/usage", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401
