from uuid import UUID

from pydantic import BaseModel


class CodeCell(BaseModel):
    id: str
    code: str
    label: str = ""


class LessonResponse(BaseModel):
    id: UUID
    title: str
    markdown_content: str
    code_cells: list[CodeCell]
    order_index: int
    module_id: UUID

    model_config = {"from_attributes": True}


class ExerciseSummary(BaseModel):
    id: UUID
    title: str
    order_index: int

    model_config = {"from_attributes": True}


class ExerciseResponse(BaseModel):
    id: UUID
    title: str
    problem_statement: str
    starter_code: str
    order_index: int
    module_id: UUID

    model_config = {"from_attributes": True}


class ModuleResponse(BaseModel):
    id: UUID
    title: str
    order_index: int
    lessons: list[LessonResponse] = []
    exercises: list[ExerciseSummary] = []

    model_config = {"from_attributes": True}


class CourseSummary(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str
    order_index: int
    progress_percent: int = 0
    total_lessons: int = 0
    completed_lessons: int = 0

    model_config = {"from_attributes": True}


class CourseDetail(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str
    modules: list[ModuleResponse] = []

    model_config = {"from_attributes": True}


class ProgressUpdate(BaseModel):
    lesson_id: UUID | None = None
    exercise_id: UUID | None = None
    status: str = "completed"
