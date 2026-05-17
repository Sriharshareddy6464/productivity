from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.goals import router as goals_router
from app.api.milestones import router as milestones_router
from app.api.tasks import router as tasks_router
from app.api.todos import router as todos_router

app = FastAPI(title="Productivity Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(goals_router)
app.include_router(milestones_router)
app.include_router(tasks_router)
app.include_router(todos_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
