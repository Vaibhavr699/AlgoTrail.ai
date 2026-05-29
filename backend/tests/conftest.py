"""Shared test fixtures.

Pure-logic tests (security, config, health) run anywhere. DB-backed tests run
only when ``TEST_DATABASE_URL`` points at a disposable Postgres (the GitHub
Actions workflow provides one); otherwise they skip rather than touch a real DB.
"""
import os

# Must be set before importing the app, since settings are cached at import.
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("JWT_SECRET", "test-secret-key-with-at-least-32-characters")
# Force the OpenAI key empty so tests never make (paid, flaky) real API calls —
# AI endpoints then return 503 after auth/quota, which is what we assert.
os.environ["OPENAI_API_KEY"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

TEST_DB_URL = os.environ.get("TEST_DATABASE_URL")

requires_db = pytest.mark.skipif(
    not TEST_DB_URL, reason="TEST_DATABASE_URL not set (DB-backed test)"
)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db_client():
    """TestClient wired to a fresh, isolated schema on the test database."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(TEST_DB_URL)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(engine)
        engine.dispose()
