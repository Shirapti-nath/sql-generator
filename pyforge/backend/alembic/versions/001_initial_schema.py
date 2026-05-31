"""Initial schema

Revision ID: 001
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, server_default=""),
        sa.Column("order_index", sa.Integer, server_default="0"),
        sa.Column("metadata", postgresql.JSONB, server_default="{}"),
    )
    op.create_index("ix_courses_slug", "courses", ["slug"])

    op.create_table(
        "modules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("courses.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("order_index", sa.Integer, server_default="0"),
    )

    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("module_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("modules.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("markdown_content", sa.Text, server_default=""),
        sa.Column("code_cells", postgresql.JSONB, server_default="[]"),
        sa.Column("order_index", sa.Integer, server_default="0"),
    )

    op.create_table(
        "exercises",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("module_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("modules.id"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("problem_statement", sa.Text, server_default=""),
        sa.Column("starter_code", sa.Text, server_default=""),
        sa.Column("test_cases", postgresql.JSONB, server_default="[]"),
        sa.Column("hints", postgresql.JSONB, server_default="[]"),
        sa.Column("order_index", sa.Integer, server_default="0"),
    )

    op.create_table(
        "user_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("exercise_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("exercises.id"), nullable=True),
        sa.Column("status", sa.String(20), server_default="completed"),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )

    op.create_table(
        "submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("exercise_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("exercises.id"), nullable=False),
        sa.Column("code", sa.Text, nullable=False),
        sa.Column("score", sa.Integer, server_default="0"),
        sa.Column("test_results", postgresql.JSONB, server_default="[]"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "snippets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("share_id", sa.String(12), unique=True, nullable=False),
        sa.Column("code", sa.Text, nullable=False),
        sa.Column("title", sa.String(200), server_default="Untitled"),
        sa.Column("is_public", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_snippets_share_id", "snippets", ["share_id"])

    op.create_table(
        "run_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("code_hash", sa.String(64), nullable=False),
        sa.Column("execution_mode", sa.String(20), server_default="browser"),
        sa.Column("duration_ms", sa.Integer, server_default="0"),
        sa.Column("ran_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("run_logs")
    op.drop_table("snippets")
    op.drop_table("submissions")
    op.drop_table("user_progress")
    op.drop_table("exercises")
    op.drop_table("lessons")
    op.drop_table("modules")
    op.drop_table("courses")
    op.drop_table("users")
