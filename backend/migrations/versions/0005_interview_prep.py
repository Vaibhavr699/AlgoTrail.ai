"""add interview prep tables (categories, questions, progress)

Idempotent table guards, same rationale as 0002–0004.

Revision ID: 0005_interview_prep
Revises: 0004_email_weekly_digest
Create Date: 2026-06-15
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql

revision: str = "0005_interview_prep"
down_revision: Union[str, None] = "0004_email_weekly_digest"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# The `difficulty` enum type is owned by migration 0001 (for the questions
# table). Reference it here with create_type=False so create_table never tries
# to re-issue CREATE TYPE — that would fail on any DB where 0001 already ran.
difficulty_enum = postgresql.ENUM(
    "EASY", "MEDIUM", "HARD", name="difficulty", create_type=False
)


def _has_table(table: str) -> bool:
    return table in inspect(op.get_bind()).get_table_names()


def upgrade() -> None:
    if not _has_table("interview_categories"):
        op.create_table(
            "interview_categories",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("icon", sa.String(), nullable=False),
            sa.Column("order", sa.Integer(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("color", sa.String(), nullable=False),
            sa.Column("language", sa.String(), nullable=False),
        )
        op.create_index(
            "ix_interview_categories_slug", "interview_categories", ["slug"], unique=True
        )

    if not _has_table("interview_questions"):
        op.create_table(
            "interview_questions",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column(
                "category_id",
                sa.String(),
                sa.ForeignKey("interview_categories.id"),
                nullable=False,
            ),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("question", sa.String(), nullable=False),
            sa.Column("difficulty", difficulty_enum, nullable=False),
            sa.Column("tldr", sa.String(), nullable=False),
            sa.Column("explanation", sa.String(), nullable=False),
            sa.Column("code_examples", sa.JSON(), nullable=False, server_default="[]"),
            sa.Column("tags", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("gotchas", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("follow_ups", sa.ARRAY(sa.String()), nullable=False, server_default="{}"),
            sa.Column("order", sa.Integer(), nullable=False),
        )
        op.create_index(
            "ix_interview_questions_slug", "interview_questions", ["slug"], unique=True
        )
        op.create_index(
            "ix_interview_questions_category_id", "interview_questions", ["category_id"]
        )

    if not _has_table("interview_progress"):
        op.create_table(
            "interview_progress",
            sa.Column("id", sa.String(), primary_key=True),
            sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column(
                "interview_question_id",
                sa.String(),
                sa.ForeignKey("interview_questions.id"),
                nullable=False,
            ),
            sa.Column("reviewed", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("bookmarked", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint(
                "user_id",
                "interview_question_id",
                name="uq_interview_progress_user_question",
            ),
        )
        op.create_index(
            "ix_interview_progress_user_id", "interview_progress", ["user_id"]
        )
        op.create_index(
            "ix_interview_progress_interview_question_id",
            "interview_progress",
            ["interview_question_id"],
        )


def downgrade() -> None:
    if _has_table("interview_progress"):
        op.drop_table("interview_progress")
    if _has_table("interview_questions"):
        op.drop_table("interview_questions")
    if _has_table("interview_categories"):
        op.drop_table("interview_categories")
