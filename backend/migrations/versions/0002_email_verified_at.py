"""add users.email_verified_at

Idempotent: the baseline (0001) builds the schema from current model metadata,
so on a fresh database this column already exists; on a pre-existing database it
does not. Guard on the live schema so ``upgrade head`` works in both cases.

Revision ID: 0002_email_verified_at
Revises: 0001_initial
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "0002_email_verified_at"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table: str, column: str) -> bool:
    cols = [c["name"] for c in inspect(op.get_bind()).get_columns(table)]
    return column in cols


def upgrade() -> None:
    if not _has_column("users", "email_verified_at"):
        op.add_column(
            "users",
            sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    if _has_column("users", "email_verified_at"):
        op.drop_column("users", "email_verified_at")
