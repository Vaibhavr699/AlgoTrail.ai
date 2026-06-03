"""add users.email_weekly_digest (weekly digest opt-in, default on)

Idempotent per-column guard, same rationale as 0002/0003.

Revision ID: 0004_email_weekly_digest
Revises: 0003_billing_fields
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "0004_email_weekly_digest"
down_revision: Union[str, None] = "0003_billing_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table: str, column: str) -> bool:
    return column in {c["name"] for c in inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if not _has_column("users", "email_weekly_digest"):
        op.add_column(
            "users",
            sa.Column(
                "email_weekly_digest",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
        )


def downgrade() -> None:
    if _has_column("users", "email_weekly_digest"):
        op.drop_column("users", "email_weekly_digest")
