"""initial baseline migration

Revision ID: 001
Revises:
Create Date: 2026-05-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("display_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("google_refresh_token", sa.String(512), nullable=True),
        sa.Column("contacts_permission_granted", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "groups",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_by", mysql.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "group_members",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("group_id", mysql.CHAR(36), sa.ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("user_id", mysql.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.Enum("admin", "member"), default="member", nullable=False),
    )

    op.create_table(
        "goals",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("user_id", mysql.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("group_id", mysql.CHAR(36), sa.ForeignKey("groups.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.String(50), default="active", nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "milestones",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("goal_id", mysql.CHAR(36), sa.ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("due_date", sa.Date, nullable=True),
        sa.Column("status", sa.String(50), default="active", nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "tasks",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("milestone_id", mysql.CHAR(36), sa.ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("assigned_to", mysql.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("priority", sa.Integer, default=0, nullable=False),
        sa.Column("status", sa.String(50), default="active", nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "todo_items",
        sa.Column("id", mysql.CHAR(36), primary_key=True),
        sa.Column("task_id", mysql.CHAR(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("content", sa.String(512), nullable=False),
        sa.Column("is_completed", sa.Boolean, default=False, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("todo_items")
    op.drop_table("tasks")
    op.drop_table("milestones")
    op.drop_table("goals")
    op.drop_table("group_members")
    op.drop_table("groups")
    op.drop_table("users")
