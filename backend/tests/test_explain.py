"""LeetCode-link → slug parsing and the explain-problem endpoint's guards."""
from app.services.leetcode import extract_slug


def test_extract_slug_from_urls():
    assert extract_slug("https://leetcode.com/problems/two-sum/") == "two-sum"
    assert extract_slug("https://leetcode.com/problems/two-sum/description/") == "two-sum"
    assert extract_slug("https://leetcode.com/problems/lru-cache/?envType=daily") == "lru-cache"
    assert extract_slug("  https://leetcode.com/problems/3sum  ") == "3sum"
    assert extract_slug("two-sum") == "two-sum"


def test_extract_slug_rejects_junk():
    assert extract_slug("hello world") is None
    assert extract_slug("https://example.com/foo") is None
    assert extract_slug("") is None
    assert extract_slug("https://leetcode.com/problemset/all/") is None


def test_explain_problem_requires_auth(client):
    r = client.post(
        "/api/ai/explain-problem",
        json={"url": "https://leetcode.com/problems/two-sum/"},
        headers={"Authorization": "Bearer not-a-real-token"},
    )
    assert r.status_code == 401
