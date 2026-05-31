from pydantic import BaseModel, Field


class ExecuteRequest(BaseModel):
    code: str = Field(max_length=50000)
    stdin: str = ""


class ExecuteResponse(BaseModel):
    job_id: str
    status: str = "queued"


class ExecutionResult(BaseModel):
    stdout: str = ""
    stderr: str = ""
    plots: list[str] = []
    exit_code: int = 0
    duration_ms: int = 0
    status: str = "completed"
    error: str | None = None


class SubmitRequest(BaseModel):
    code: str = Field(max_length=50000)


class TestResult(BaseModel):
    name: str
    passed: bool
    expected: str | None = None
    actual: str | None = None
    hidden: bool = False
    message: str = ""


class SubmitResponse(BaseModel):
    passed: int
    total: int
    score: int
    results: list[TestResult]


class HintRequest(BaseModel):
    code: str
    previous_hints: list[str] = []


class HintResponse(BaseModel):
    hint: str
    hint_number: int
    hints_remaining: int


class RunLogRequest(BaseModel):
    code: str
    execution_mode: str
    duration_ms: int
