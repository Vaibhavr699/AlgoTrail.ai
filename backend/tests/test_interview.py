import pytest

from app.interview_data import INTERVIEW_CATEGORIES, INTERVIEW_QUESTIONS_BY_CATEGORY
from tests.conftest import requires_db


def test_question_keys_match_category_slugs():
    """Every INTERVIEW_QUESTIONS_BY_CATEGORY key must be a real category slug."""
    slugs = {c["slug"] for c in INTERVIEW_CATEGORIES}
    for key in INTERVIEW_QUESTIONS_BY_CATEGORY:
        assert key in slugs, f"questions key {key!r} has no matching category"


def test_question_slugs_unique():
    seen = set()
    for qs in INTERVIEW_QUESTIONS_BY_CATEGORY.values():
        for q in qs:
            assert q["slug"] not in seen, f"duplicate question slug {q['slug']!r}"
            seen.add(q["slug"])


def _seed(db_client):
    from app.database import get_db
    from app.seed import upsert_interview_categories, upsert_interview_questions

    db = next(db_client.app.dependency_overrides[get_db]())
    cats = upsert_interview_categories(db)
    upsert_interview_questions(db, cats)
    db.commit()


@requires_db
def test_list_categories(db_client):
    _seed(db_client)
    res = db_client.get("/api/interview/categories")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == len(INTERVIEW_CATEGORIES)
    py = next(c for c in data if c["slug"] == "python")
    assert py["question_count"] >= 1


@requires_db
def test_get_category_with_questions(db_client):
    _seed(db_client)
    res = db_client.get("/api/interview/categories/python")
    assert res.status_code == 200
    body = res.json()
    assert body["slug"] == "python"
    assert len(body["questions"]) >= 1
    q = body["questions"][0]
    assert {"slug", "question", "tldr", "explanation", "code_examples"} <= q.keys()


@requires_db
def test_get_category_404(db_client):
    res = db_client.get("/api/interview/categories/does-not-exist")
    assert res.status_code == 404


@requires_db
def test_progress_endpoint_returns_list(db_client):
    # In the development test environment current_user falls back to a demo user,
    # so this resolves rather than 401. Assert it returns a (possibly empty) list.
    res = db_client.get("/api/interview/progress")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@requires_db
def test_toggle_progress_persists(db_client):
    _seed(db_client)
    cat = db_client.get("/api/interview/categories/python").json()
    qid = cat["questions"][0]["id"]

    res = db_client.post(f"/api/interview/progress/{qid}", json={"reviewed": True})
    assert res.status_code == 200
    body = res.json()
    assert body["reviewed"] is True
    assert body["interview_question_id"] == qid

    # Idempotent second toggle: bookmark on, reviewed unchanged.
    res2 = db_client.post(f"/api/interview/progress/{qid}", json={"bookmarked": True})
    assert res2.json()["reviewed"] is True
    assert res2.json()["bookmarked"] is True

    listed = db_client.get("/api/interview/progress").json()
    assert any(p["interview_question_id"] == qid and p["reviewed"] for p in listed)


@requires_db
def test_toggle_progress_unknown_question_404(db_client):
    res = db_client.post("/api/interview/progress/nonexistent", json={"reviewed": True})
    assert res.status_code == 404
