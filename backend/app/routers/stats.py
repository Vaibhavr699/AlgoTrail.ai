from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import current_user
from app.database import get_db
from app.models import Progress, Question, Status, Topic, User
from app.schemas import StatsOut

router = APIRouter()


READINESS_BUCKETS: dict[str, list[str]] = {
    "arrays_and_strings": ["arrays-hashing", "two-pointers", "sliding-window"],
    "core_data_structures": ["stack", "linked-list", "trees", "heap"],
    "search_and_optimization": ["binary-search", "backtracking", "greedy", "intervals"],
    "advanced": ["graphs", "advanced-graphs", "dp-1d", "dp-2d", "math-geometry", "bit-manipulation"],
}


@router.get("", response_model=StatsOut)
def get_stats(user: User = Depends(current_user), db: Session = Depends(get_db)):
    progress_rows = (
        db.query(Progress, Question, Topic)
        .join(Question, Question.id == Progress.question_id)
        .join(Topic, Topic.id == Question.topic_id)
        .filter(Progress.user_id == user.id)
        .all()
    )

    total_solved = 0
    by_difficulty: dict[str, int] = {"EASY": 0, "MEDIUM": 0, "HARD": 0}
    solved_by_topic: dict[str, int] = defaultdict(int)
    solved_by_topic_slug: dict[str, int] = defaultdict(int)
    activity_counter: dict[str, int] = defaultdict(int)

    for p, q, t in progress_rows:
        if p.status == Status.SOLVED:
            total_solved += 1
            by_difficulty[q.difficulty.value] += 1
            solved_by_topic[t.id] += 1
            solved_by_topic_slug[t.slug] += 1
            if p.solved_at is not None:
                activity_counter[p.solved_at.date().isoformat()] += 1

    topic_totals = (
        db.query(Topic.id, Topic.slug, Topic.title, Topic.order)
        .order_by(Topic.order)
        .all()
    )
    topic_question_counts = dict(
        db.query(Question.topic_id, Question.id).all()
    )  # placeholder; recount below
    counts: dict[str, int] = defaultdict(int)
    for tid, _ in db.query(Question.topic_id, Question.id).all():
        counts[tid] += 1

    by_topic = [
        {
            "topic_id": tid,
            "slug": slug,
            "title": title,
            "solved": solved_by_topic.get(tid, 0),
            "total": counts.get(tid, 0),
        }
        for tid, slug, title, _ in topic_totals
    ]

    # Build last-365-day activity array
    today = date.today()
    activity = []
    for i in range(364, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        activity.append({"date": d, "count": activity_counter.get(d, 0)})

    readiness: dict[str, float] = {}
    for bucket, slugs in READINESS_BUCKETS.items():
        total_q = sum(counts.get(t.id, 0) for t in db.query(Topic).filter(Topic.slug.in_(slugs)).all())
        solved_q = sum(solved_by_topic_slug.get(s, 0) for s in slugs)
        readiness[bucket] = round((solved_q / total_q) * 100, 1) if total_q else 0.0

    return StatsOut(
        total_solved=total_solved,
        streak=user.streak,
        longest_streak=user.longest_streak,
        by_difficulty=by_difficulty,
        by_topic=by_topic,
        activity=activity,
        readiness=readiness,
    )
