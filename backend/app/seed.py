"""Seed the database with topics and the NeetCode 150 question list.

Idempotent: safe to re-run. Topics and questions are upserted by slug.

Usage (from backend/ with venv activated and DATABASE_URL set):
    python -m app.seed
"""
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Difficulty, Question, Topic
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


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        topics_by_slug = upsert_topics(db)
        n_questions = upsert_questions(db, topics_by_slug)
        db.commit()
        print(f"Seeded {len(topics_by_slug)} topics and {n_questions} questions.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
