from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import current_user
from app.config import get_settings
from app.database import get_db
from app.models import Question, Topic, User
from app.schemas import ExplainRequest, GeneratePathRequest, HintRequest, PatternTeachRequest, PatternTemplateRequest, PatternChatRequest
from app.services.openai_service import explain_solution, generate_hint, generate_study_path, teach_pattern, regenerate_template, chat_about_pattern
from app.usage import daily_limit_for, enforce_ai_quota, get_usage_today

router = APIRouter()


def _require_openai_key() -> None:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY in your .env file.",
        )


@router.get("/usage")
def usage(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    limit = daily_limit_for(user)
    used = get_usage_today(db, user.id)
    return {"used": used, "limit": limit, "remaining": max(0, limit - used), "plan": user.plan}


@router.post("/generate-path")
async def generate_path(
    body: GeneratePathRequest,
    db: Session = Depends(get_db),
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()

    topics = db.query(Topic).order_by(Topic.order).all()
    topics_data = [
        {
            "title": t.title,
            "slug": t.slug,
            "estimated_days": t.estimated_days,
            "patterns": t.patterns,
            "questions": [{"id": q.id, "difficulty": q.difficulty.value} for q in t.questions],
        }
        for t in topics
    ]

    progress_records = []
    for t in topics:
        for q in t.questions:
            for p in q.progress:
                if p.user_id == user.id:
                    progress_records.append(
                        {
                            "question_id": p.question_id,
                            "topic_id": q.topic_id,
                            "status": p.status.value,
                        }
                    )

    result = await generate_study_path(
        topics=topics_data,
        progress=progress_records,
        goal=body.goal,
        weeks=body.weeks,
    )
    return result


@router.post("/hint")
async def get_hint(
    body: HintRequest,
    db: Session = Depends(get_db),
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()

    question = db.query(Question).filter(Question.slug == body.question_slug).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    if body.level < 1 or body.level > 3:
        raise HTTPException(status_code=400, detail="Hint level must be 1, 2, or 3")

    result = await generate_hint(
        question_title=question.title,
        question_difficulty=question.difficulty.value,
        question_pattern=question.pattern,
        hint_level=body.level,
        existing_hint=question.hint,
    )
    return result


@router.post("/explain")
async def explain(
    body: ExplainRequest,
    db: Session = Depends(get_db),
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()

    question = db.query(Question).filter(Question.slug == body.question_slug).first()
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    result = await explain_solution(
        question_title=question.title,
        question_difficulty=question.difficulty.value,
        question_pattern=question.pattern,
        language=body.language,
    )
    return result


@router.post("/teach-pattern")
async def teach_pattern_endpoint(
    body: PatternTeachRequest,
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()
    result = await teach_pattern(
        pattern_name=body.pattern_name,
        topic_context=body.topic_context,
    )
    return result


@router.post("/pattern-template")
async def pattern_template_endpoint(
    body: PatternTemplateRequest,
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()
    result = await regenerate_template(
        pattern_name=body.pattern_name,
        language=body.language,
    )
    return result


@router.post("/chat")
async def chat_endpoint(
    body: PatternChatRequest,
    user: User = Depends(enforce_ai_quota),
):
    _require_openai_key()
    reply = await chat_about_pattern(
        pattern_name=body.pattern_name,
        conversation=body.messages,
    )
    return {"reply": reply}
