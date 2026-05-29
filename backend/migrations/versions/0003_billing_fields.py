"""add billing fields to users (plan, plan_status, stripe ids)

Idempotent per-column guards, same rationale as 0002.

Revision ID: 0003_billing_fields
Revises: 0002_email_verified_at
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "0003_billing_fields"
down_revision: Union[str, None] = "0002_email_verified_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_COLUMNS = {
    "plan": sa.Column("plan", sa.String(), nullable=False, server_default="free"),
    "plan_status": sa.Column("plan_status", sa.String(), nullable=True),
    "stripe_customer_id": sa.Column("stripe_customer_id", sa.String(), nullable=True),
    "stripe_subscription_id": sa.Column("stripe_subscription_id", sa.String(), nullable=True),
}


def _existing_columns(table: str) -> set[str]:
    return {c["name"] for c in inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    present = _existing_columns("users")
    for name, column in _COLUMNS.items():
        if name not in present:
            op.add_column("users", column)
    if "stripe_customer_id" not in present:
        op.create_index("ix_users_stripe_customer_id", "users", ["stripe_customer_id"])


def downgrade() -> None:
    present = _existing_columns("users")
    if "stripe_customer_id" in present:
        op.drop_index("ix_users_stripe_customer_id", table_name="users")
    for name in _COLUMNS:
        if name in present:
            op.drop_column("users", name)
