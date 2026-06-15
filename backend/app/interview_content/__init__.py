"""Per-category interview question content.

Each module exposes a module-level ``QUESTIONS: list[dict]``. The mapping below
is consumed by app.interview_data to build INTERVIEW_QUESTIONS_BY_CATEGORY.
"""
from . import (
    docker_devops,
    fastapi as fastapi_mod,
    javascript,
    nextjs,
    nodejs,
    python as python_mod,
    react,
    sql,
    system_design,
    typescript,
)

QUESTIONS_BY_CATEGORY: dict[str, list[dict]] = {
    "python": python_mod.QUESTIONS,
    "javascript": javascript.QUESTIONS,
    "typescript": typescript.QUESTIONS,
    "fastapi": fastapi_mod.QUESTIONS,
    "react": react.QUESTIONS,
    "nextjs": nextjs.QUESTIONS,
    "nodejs": nodejs.QUESTIONS,
    "sql": sql.QUESTIONS,
    "docker-devops": docker_devops.QUESTIONS,
    "system-design": system_design.QUESTIONS,
}
