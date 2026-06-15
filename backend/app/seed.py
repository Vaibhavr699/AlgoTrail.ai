"""Seed the database with topics and the NeetCode 150 question list.

Idempotent: safe to re-run. Topics and questions are upserted by slug.

Usage (from backend/ with venv activated and DATABASE_URL set):
    python -m app.seed
"""
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.interview_data import INTERVIEW_CATEGORIES, INTERVIEW_QUESTIONS_BY_CATEGORY
from app.models import (
    Difficulty,
    InterviewCategory,
    InterviewQuestion,
    Question,
    Topic,
)
from app.questions_data import QUESTIONS_BY_TOPIC
from app.topics_data import TOPICS


def upsert_topics(db: Session) -> dict[str, Topic]:
    topics_by_slug: dict[str, Topic] = {}
    for t in TOPICS:
        topic = db.query(Topic).filter(Topic.slug == t["slug"]).first()
        if topic is None:
            topic = Topic(**t)
            db.add(topic)
        else:
            for k, v in t.items():
                setattr(topic, k, v)
        topics_by_slug[t["slug"]] = topic
    db.flush()
    return topics_by_slug


def upsert_questions(db: Session, topics_by_slug: dict[str, Topic]) -> int:
    count = 0
    for topic_slug, questions in QUESTIONS_BY_TOPIC.items():
        topic = topics_by_slug.get(topic_slug)
        if topic is None:
            print(f"WARN: no topic with slug={topic_slug}, skipping {len(questions)} questions")
            continue
        for order, q in enumerate(questions, start=1):
            existing = db.query(Question).filter(Question.slug == q["slug"]).first()
            payload = dict(
                topic_id=topic.id,
                title=q["title"],
                slug=q["slug"],
                difficulty=Difficulty(q["difficulty"]),
                pattern=q["pattern"],
                leetcode_id=q.get("leetcode_id"),
                leetcode_slug=q.get("leetcode_slug"),
                order=order,
                hint=q.get("hint"),
                key_insight=q.get("key_insight"),
                companies=q.get("companies", []),
            )
            if existing is None:
                db.add(Question(**payload))
            else:
                for k, v in payload.items():
                    setattr(existing, k, v)
            count += 1
    return count


def upsert_interview_categories(db: Session) -> dict[str, InterviewCategory]:
    by_slug: dict[str, InterviewCategory] = {}
    for c in INTERVIEW_CATEGORIES:
        cat = db.query(InterviewCategory).filter(InterviewCategory.slug == c["slug"]).first()
        if cat is None:
            cat = InterviewCategory(**c)
            db.add(cat)
        else:
            for k, v in c.items():
                setattr(cat, k, v)
        by_slug[c["slug"]] = cat
    db.flush()
    return by_slug


def upsert_interview_questions(
    db: Session, cats_by_slug: dict[str, InterviewCategory]
) -> int:
    count = 0
    for cat_slug, questions in INTERVIEW_QUESTIONS_BY_CATEGORY.items():
        category = cats_by_slug.get(cat_slug)
        if category is None:
            print(f"WARN: no interview category slug={cat_slug}, skipping {len(questions)} questions")
            continue
        for order, q in enumerate(questions, start=1):
            existing = (
                db.query(InterviewQuestion)
                .filter(InterviewQuestion.slug == q["slug"])
                .first()
            )
            payload = dict(
                category_id=category.id,
                question=q["question"],
                slug=q["slug"],
                difficulty=Difficulty(q["difficulty"]),
                tldr=q["tldr"],
                explanation=q["explanation"],
                code_examples=q.get("code_examples", []),
                tags=q.get("tags", []),
                gotchas=q.get("gotchas", []),
                follow_ups=q.get("follow_ups", []),
                order=order,
            )
            if existing is None:
                db.add(InterviewQuestion(**payload))
            else:
                for k, v in payload.items():
                    setattr(existing, k, v)
            count += 1
    return count


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        topics_by_slug = upsert_topics(db)
        n_questions = upsert_questions(db, topics_by_slug)
        interview_cats = upsert_interview_categories(db)
        n_iq = upsert_interview_questions(db, interview_cats)
        db.commit()
        print(f"Seeded {len(topics_by_slug)} topics and {n_questions} questions.")
        print(f"Seeded {len(interview_cats)} interview categories and {n_iq} interview questions.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
