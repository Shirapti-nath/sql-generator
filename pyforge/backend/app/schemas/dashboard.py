from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SnippetCreate(BaseModel):
    code: str = Field(max_length=50000)
    title: str = "Untitled"
    is_public: bool = True


class SnippetResponse(BaseModel):
    id: UUID
    share_id: str
    code: str
    title: str
    is_public: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RunLogEntry(BaseModel):
    id: UUID
    execution_mode: str
    duration_ms: int
    ran_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    streak_days: int
    lessons_completed: int
    exercises_passed: int
    total_submissions: int
    recent_runs: list[RunLogEntry]
    recent_snippets: list[SnippetResponse]
    course_progress: list[dict]
