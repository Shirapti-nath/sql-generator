import json

from app.core.redis_client import publish_job_event, store_job_result
from app.services.sandbox import run_code_in_sandbox
from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="execute_code")
def execute_code_task(self, job_id: str, code: str, stdin: str = ""):
    publish_job_event(job_id, {"type": "status", "status": "running"})

    result = run_code_in_sandbox(code, stdin)

    publish_job_event(job_id, {"type": "stdout", "data": result.get("stdout", "")})
    if result.get("stderr"):
        publish_job_event(job_id, {"type": "stderr", "data": result["stderr"]})
    for plot in result.get("plots", []):
        publish_job_event(job_id, {"type": "plot", "data": plot})

    final = {
        "job_id": job_id,
        "status": result.get("status", "completed"),
        "stdout": result.get("stdout", ""),
        "stderr": result.get("stderr", ""),
        "plots": result.get("plots", []),
        "exit_code": result.get("exit_code", 0),
        "duration_ms": result.get("duration_ms", 0),
        "error": result.get("error"),
    }
    store_job_result(job_id, final)
    publish_job_event(job_id, {"type": "done", "data": final})
    return final
