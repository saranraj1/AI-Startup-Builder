from __future__ import annotations

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.providers import create_provider
from app.schemas import CreateProject, ProjectResponse
from app.services import InMemoryProjectStore, ProjectService

settings = get_settings()
store = InMemoryProjectStore()
service = ProjectService(store=store, provider=create_provider(settings), settings=settings)

app = FastAPI(title="Forgeway API", version="0.1.0", docs_url="/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "forgeway-api", "aiProvider": settings.ai_provider}


@app.get("/api/v1/projects")
def list_projects() -> list[ProjectResponse]:
    return store.list()


@app.post("/api/v1/projects", response_model=ProjectResponse, status_code=202)
async def create_project(payload: CreateProject, background_tasks: BackgroundTasks) -> ProjectResponse:
    project = store.create(payload.idea)
    background_tasks.add_task(service.run_generation, project.id)
    return project


@app.post("/api/v1/projects/{project_id}/generate", response_model=ProjectResponse, status_code=202)
async def regenerate_project(project_id: str, background_tasks: BackgroundTasks) -> ProjectResponse:
    project = service.prepare_generation(project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    background_tasks.add_task(service.run_generation, project.id)
    return project


@app.get("/api/v1/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str) -> ProjectResponse:
    project = store.get(project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    return project
