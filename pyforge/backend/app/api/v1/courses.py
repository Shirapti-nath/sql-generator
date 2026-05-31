from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models import Course, Exercise, Lesson, Module, User, UserProgress
from app.schemas.course import (
    CourseDetail,
    CourseSummary,
    ExerciseResponse,
    LessonResponse,
    ModuleResponse,
    ProgressUpdate,
)

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseSummary])
def list_courses(
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    courses = db.query(Course).order_by(Course.order_index).all()
    result = []
    for course in courses:
        modules = db.query(Module).filter(Module.course_id == course.id).all()
        lesson_ids = []
        for mod in modules:
            lessons = db.query(Lesson).filter(Lesson.module_id == mod.id).all()
            lesson_ids.extend([l.id for l in lessons])
        total = len(lesson_ids)
        completed = 0
        if user and lesson_ids:
            completed = (
                db.query(UserProgress)
                .filter(UserProgress.user_id == user.id, UserProgress.lesson_id.in_(lesson_ids))
                .count()
            )
        progress = int((completed / total) * 100) if total else 0
        result.append(
            CourseSummary(
                id=course.id,
                slug=course.slug,
                title=course.title,
                description=course.description,
                order_index=course.order_index,
                progress_percent=progress,
                total_lessons=total,
                completed_lessons=completed,
            )
        )
    return result


@router.get("/{slug}", response_model=CourseDetail)
def get_course(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(Module).filter(Module.course_id == course.id).order_by(Module.order_index).all()
    module_responses = []
    for mod in modules:
        lessons = db.query(Lesson).filter(Lesson.module_id == mod.id).order_by(Lesson.order_index).all()
        exercises = db.query(Exercise).filter(Exercise.module_id == mod.id).order_by(Exercise.order_index).all()
        module_responses.append(
            ModuleResponse(
                id=mod.id,
                title=mod.title,
                order_index=mod.order_index,
                lessons=[LessonResponse.model_validate(l) for l in lessons],
                exercises=[{"id": e.id, "title": e.title, "order_index": e.order_index} for e in exercises],
            )
        )
    return CourseDetail(
        id=course.id,
        slug=course.slug,
        title=course.title,
        description=course.description,
        modules=module_responses,
    )


@router.get("/{slug}/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(slug: str, lesson_id: UUID, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonResponse.model_validate(lesson)


@router.get("/{slug}/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(slug: str, exercise_id: UUID, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ExerciseResponse.model_validate(exercise)


@router.post("/progress")
def update_progress(
    data: ProgressUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = None
    if data.lesson_id:
        existing = (
            db.query(UserProgress)
            .filter(UserProgress.user_id == user.id, UserProgress.lesson_id == data.lesson_id)
            .first()
        )
    if existing:
        return {"status": "already_completed"}
    progress = UserProgress(
        user_id=user.id,
        lesson_id=data.lesson_id,
        exercise_id=data.exercise_id,
        status=data.status,
    )
    db.add(progress)
    db.commit()
    return {"status": "ok"}
