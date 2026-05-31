import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models import Course, Lesson, Module, RunLog, Snippet, Submission, User, UserProgress
from app.schemas.dashboard import DashboardStats, RunLogEntry, SnippetCreate, SnippetResponse

router = APIRouter(tags=["snippets", "dashboard"])


def _generate_share_id() -> str:
    return secrets.token_urlsafe(8)[:10]


@router.post("/snippets", response_model=SnippetResponse)
def create_snippet(
    data: SnippetCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    snippet = Snippet(
        user_id=user.id if user else None,
        share_id=_generate_share_id(),
        code=data.code,
        title=data.title,
        is_public=data.is_public,
    )
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return SnippetResponse.model_validate(snippet)


@router.get("/snippets/{share_id}", response_model=SnippetResponse)
def get_snippet(share_id: str, db: Session = Depends(get_db)):
    snippet = db.query(Snippet).filter(Snippet.share_id == share_id).first()
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found")
    if not snippet.is_public:
        raise HTTPException(status_code=403, detail="Snippet is private")
    return SnippetResponse.model_validate(snippet)


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    lessons_completed = db.query(UserProgress).filter(
        UserProgress.user_id == user.id, UserProgress.lesson_id.isnot(None)
    ).count()
    exercises_passed = db.query(UserProgress).filter(
        UserProgress.user_id == user.id, UserProgress.exercise_id.isnot(None)
    ).count()
    total_submissions = db.query(Submission).filter(Submission.user_id == user.id).count()
    recent_runs = (
        db.query(RunLog)
        .filter(RunLog.user_id == user.id)
        .order_by(RunLog.ran_at.desc())
        .limit(10)
        .all()
    )
    recent_snippets = (
        db.query(Snippet)
        .filter(Snippet.user_id == user.id)
        .order_by(Snippet.created_at.desc())
        .limit(5)
        .all()
    )

    courses = db.query(Course).order_by(Course.order_index).all()
    course_progress = []
    for course in courses:
        modules = db.query(Module).filter(Module.course_id == course.id).all()
        lesson_ids = []
        for mod in modules:
            lessons = db.query(Lesson).filter(Lesson.module_id == mod.id).all()
            lesson_ids.extend([l.id for l in lessons])
        total = len(lesson_ids)
        completed = 0
        if lesson_ids:
            completed = (
                db.query(UserProgress)
                .filter(UserProgress.user_id == user.id, UserProgress.lesson_id.in_(lesson_ids))
                .count()
            )
        course_progress.append({
            "slug": course.slug,
            "title": course.title,
            "percent": int((completed / total) * 100) if total else 0,
            "completed": completed,
            "total": total,
        })

    return DashboardStats(
        streak_days=_calc_streak(db, user),
        lessons_completed=lessons_completed,
        exercises_passed=exercises_passed,
        total_submissions=total_submissions,
        recent_runs=[RunLogEntry.model_validate(r) for r in recent_runs],
        recent_snippets=[SnippetResponse.model_validate(s) for s in recent_snippets],
        course_progress=course_progress,
    )


def _calc_streak(db: Session, user: User) -> int:
    from datetime import date, timedelta

    progress_dates = set()
    entries = db.query(UserProgress).filter(UserProgress.user_id == user.id).all()
    for entry in entries:
        progress_dates.add(entry.completed_at.date())

    streak = 0
    current = date.today()
    while current in progress_dates or (streak == 0 and current == date.today()):
        if current in progress_dates:
            streak += 1
        elif streak > 0:
            break
        current -= timedelta(days=1)
    return streak
