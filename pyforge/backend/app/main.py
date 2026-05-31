from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, courses, execution, snippets
from app.core.config import settings

app = FastAPI(title="PyForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(execution.router, prefix="/api/v1")
app.include_router(snippets.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
