from celery import Celery

from app.core.config import settings

celery_app = Celery("pyforge", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    task_time_limit=settings.sandbox_timeout + 5,
)

celery_app.autodiscover_tasks(["app.workers"])
