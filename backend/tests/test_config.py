"""Production config must fail fast on insecure values; CORS resolves from env."""
import pytest

from app.config import Settings


def test_dev_includes_localhost_origins():
    s = Settings(environment="development", frontend_origin="http://localhost:3000")
    assert "http://localhost:3000" in s.cors_origins
    assert "http://localhost:3001" in s.cors_origins  # convenience port


def test_prod_cors_is_exactly_what_is_configured():
    s = Settings(
        environment="production",
        jwt_secret="x" * 40,
        database_url="postgresql+psycopg://u:p@prod-host/db",
        frontend_origin="https://algotrail.ai,https://www.algotrail.ai",
    )
    assert s.cors_origins == ["https://algotrail.ai", "https://www.algotrail.ai"]
    assert "http://localhost:3000" not in s.cors_origins


def test_prod_rejects_weak_jwt_secret():
    with pytest.raises(ValueError):
        Settings(
            environment="production",
            jwt_secret="dev-only-not-secure",
            database_url="postgresql+psycopg://u:p@prod-host/db",
            frontend_origin="https://algotrail.ai",
        )


def test_prod_rejects_localhost_database():
    with pytest.raises(ValueError):
        Settings(
            environment="production",
            jwt_secret="x" * 40,
            database_url="postgresql+psycopg://u:p@localhost/db",
            frontend_origin="https://algotrail.ai",
        )
