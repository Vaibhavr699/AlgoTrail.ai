"""initial schema (users, topics, questions, progress, notes, study_sessions, ai_usage)

Baseline migration. It builds the schema directly from the SQLAlchemy models'
metadata, so it exactly matches the models and is safe to run against an existing
database created earlier via ``create_all`` (table creation skips what exists).
Subsequent migrations use ``alembic revision --autogenerate`` as normal.

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-29
"""
from typing import Sequence, Union

from alembic import op

from app.database import Base
import app.models  # noqa: F401 — registers all tables on Base.metadata

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
