from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://pyforge:pyforge@localhost:5432/pyforge"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "dev-secret-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    anthropic_api_key: str = ""
    sandbox_image: str = "pyforge-runner"
    sandbox_timeout: int = 10
    sandbox_memory_mb: int = 256
    hints_per_day: int = 5
    server_runs_per_hour: int = 30
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
