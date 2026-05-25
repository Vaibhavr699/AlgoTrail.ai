from fastapi import APIRouter, HTTPException, Query

from app.schemas import LeetCodeProblem, LeetCodeSearchItem, LeetCodeSearchResult, LeetCodeTag
from app.services.leetcode import fetch_problem_detail, search_problems

router = APIRouter()


def _normalize_problem(raw: dict) -> dict:
    return {
        "question_id": raw.get("questionId"),
        "title": raw.get("title", ""),
        "title_slug": raw.get("titleSlug", ""),
        "difficulty": raw.get("difficulty", ""),
        "content": raw.get("content"),
        "topic_tags": [
            LeetCodeTag(name=t["name"], slug=t["slug"])
            for t in (raw.get("topicTags") or [])
        ],
        "hints": raw.get("hints") or [],
        "sample_test_case": raw.get("sampleTestCase"),
        "is_paid_only": raw.get("isPaidOnly", False),
    }


def _normalize_search_item(raw: dict) -> dict:
    return {
        "question_id": raw.get("questionId"),
        "frontend_question_id": raw.get("frontendQuestionId"),
        "title": raw.get("title", ""),
        "title_slug": raw.get("titleSlug", ""),
        "difficulty": raw.get("difficulty", ""),
        "topic_tags": [
            LeetCodeTag(name=t["name"], slug=t["slug"])
            for t in (raw.get("topicTags") or [])
        ],
        "is_paid_only": raw.get("isPaidOnly", False),
        "ac_rate": raw.get("acRate"),
    }


@router.get("/problems/{slug}", response_model=LeetCodeProblem)
async def get_problem(slug: str):
    raw = await fetch_problem_detail(slug)
    if raw is None:
        raise HTTPException(status_code=404, detail="Problem not found on LeetCode")
    return _normalize_problem(raw)


@router.get("/search", response_model=LeetCodeSearchResult)
async def search(
    q: str | None = Query(None, description="Search keywords"),
    difficulty: str | None = Query(None, description="EASY, MEDIUM, or HARD"),
    tags: str | None = Query(None, description="Comma-separated topic tag slugs"),
    limit: int = Query(20, ge=1, le=50),
    skip: int = Query(0, ge=0),
):
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    raw = await search_problems(
        query=q, difficulty=difficulty, tags=tag_list, limit=limit, skip=skip
    )
    return LeetCodeSearchResult(
        total=raw.get("total", 0),
        questions=[
            LeetCodeSearchItem(**_normalize_search_item(item))
            for item in (raw.get("questions") or [])
        ],
    )
