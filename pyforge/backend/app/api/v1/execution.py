import asyncio
import hashlib
import json
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.redis_client import check_rate_limit, create_job_id, get_job_result
from app.core.security import get_current_user, get_optional_user
from app.models import Exercise, RunLog, Submission, User, UserProgress
from app.schemas.execution import ExecuteRequest, ExecuteResponse, HintRequest, HintResponse, RunLogRequest, SubmitRequest, SubmitResponse
from app.services.grader import grade_submission
from app.services.hints import generate_hint
from app.workers.tasks import execute_code_task

router = APIRouter(tags=["execution"])


@router.post("/execute/server", response_model=ExecuteResponse)
def execute_server(
    data: ExecuteRequest,
    user: User | None = Depends(get_optional_user),
):
    rate_key = f"runs:{user.id if user else 'anon'}"
    if not check_rate_limit(rate_key, settings.server_runs_per_hour):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

    job_id = create_job_id()
    execute_code_task.delay(job_id, data.code, data.stdin)
    return ExecuteResponse(job_id=job_id, status="queued")


@router.websocket("/execute/ws/{job_id}")
async def execute_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()
    r = aioredis.from_url(settings.redis_url, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"job_channel:{job_id}")

    try:
        result = get_job_result(job_id)
        if result:
            await websocket.send_json({"type": "done", "data": result})
            await websocket.close()
            return

        async def listen():
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    event = json.loads(message["data"])
                    await websocket.send_json(event)
                    if event.get("type") == "done":
                        return
                await asyncio.sleep(0.05)

        await asyncio.wait_for(listen(), timeout=settings.sandbox_timeout + 10)
    except (asyncio.TimeoutError, WebSocketDisconnect):
        pass
    finally:
        await pubsub.unsubscribe(f"job_channel:{job_id}")
        await r.close()
        try:
            await websocket.close()
        except Exception:
            pass


@router.post("/exercises/{exercise_id}/submit", response_model=SubmitResponse)
def submit_exercise(
    exercise_id: UUID,
    data: SubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    grade_result = grade_submission(data.code, exercise.test_cases)
    submission = Submission(
        user_id=user.id,
        exercise_id=exercise.id,
        code=data.code,
        score=grade_result["score"],
        test_results=grade_result["results"],
    )
    db.add(submission)

    if grade_result["passed"] == grade_result["total"] and grade_result["total"] > 0:
        existing = (
            db.query(UserProgress)
            .filter(UserProgress.user_id == user.id, UserProgress.exercise_id == exercise.id)
            .first()
        )
        if not existing:
            db.add(UserProgress(user_id=user.id, exercise_id=exercise.id, status="completed"))

    db.commit()
    return SubmitResponse(**grade_result)


@router.post("/exercises/{exercise_id}/hint", response_model=HintResponse)
def get_hint(
    exercise_id: UUID,
    data: HintRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.core.redis_client import log_hint_usage

    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    used = log_hint_usage(str(user.id))
    if used > settings.hints_per_day:
        raise HTTPException(status_code=429, detail="Daily hint limit reached")

    hint = generate_hint(
        exercise.problem_statement,
        data.code,
        data.previous_hints,
    )
    return HintResponse(
        hint=hint,
        hint_number=len(data.previous_hints) + 1,
        hints_remaining=max(0, settings.hints_per_day - used),
    )


class RunLogRequest(BaseModel):
    code: str
    execution_mode: str
    duration_ms: int


@router.post("/run-log")
def log_run(
    data: RunLogRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    code_hash = hashlib.sha256(data.code.encode()).hexdigest()[:16]
    log = RunLog(
        user_id=user.id if user else None,
        code_hash=code_hash,
        execution_mode=data.execution_mode,
        duration_ms=data.duration_ms,
    )
    db.add(log)
    db.commit()
    return {"status": "ok"}
