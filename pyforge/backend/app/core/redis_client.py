import json
import uuid
from datetime import datetime, timezone

import redis

from app.core.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def store_job_result(job_id: str, data: dict) -> None:
    redis_client.setex(f"job:{job_id}", 3600, json.dumps(data))


def get_job_result(job_id: str) -> dict | None:
    raw = redis_client.get(f"job:{job_id}")
    return json.loads(raw) if raw else None


def publish_job_event(job_id: str, event: dict) -> None:
    redis_client.publish(f"job_channel:{job_id}", json.dumps(event))


def check_rate_limit(key: str, limit: int, window_seconds: int = 3600) -> bool:
    """Returns True if under limit, False if exceeded."""
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window_seconds)
    return current <= limit


def create_job_id() -> str:
    return str(uuid.uuid4())


def log_hint_usage(user_id: str) -> int:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = f"hints:{user_id}:{today}"
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, 86400)
    return count
