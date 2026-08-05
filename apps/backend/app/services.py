from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from app.artifacts import ARTIFACTS, calculate_startup_score, slug_name
from app.config import Settings
from app.providers import GenerationProvider
from app.schemas import ArtifactResponse, ProjectResponse


class InMemoryProjectStore:
    def __init__(self) -> None:
        self._projects: dict[str, ProjectResponse] = {}

    def list(self) -> list[ProjectResponse]:
        return list(self._projects.values())

    def get(self, project_id: str) -> ProjectResponse | None:
        return self._projects.get(project_id)

    def create(self, idea: str) -> ProjectResponse:
        project = ProjectResponse(
            id=str(uuid4()),
            name=slug_name(idea),
            idea=idea,
            score=calculate_startup_score(idea),
            status="queued",
            progress=0,
            artifacts=[],
            createdAt=datetime.now(timezone.utc).isoformat(),
        )
        self._projects[project.id] = project
        return project

    def save(self, project: ProjectResponse) -> None:
        self._projects[project.id] = project


class ProjectService:
    def __init__(self, store: InMemoryProjectStore, provider: GenerationProvider, settings: Settings) -> None:
        self.store = store
        self.provider = provider
        self.settings = settings
        self._locks: dict[str, asyncio.Lock] = {}

    def prepare_generation(self, project_id: str) -> ProjectResponse | None:
        project = self.store.get(project_id)
        if project is None:
            return None
        project.status = "queued"
        project.progress = 0
        project.artifacts = []
        project.errorMessage = None
        self.store.save(project)
        return project

    async def run_generation(self, project_id: str) -> None:
        lock = self._locks.setdefault(project_id, asyncio.Lock())
        if lock.locked():
            return
        async with lock:
            await self._run_generation(project_id)

    async def _run_generation(self, project_id: str) -> None:
        project = self.store.get(project_id)
        if project is None:
            return

        project.status = "running"
        project.errorMessage = None
        self.store.save(project)

        try:
            for index, definition in enumerate(ARTIFACTS, start=1):
                if self.settings.generation_delay_seconds > 0:
                    await asyncio.sleep(self.settings.generation_delay_seconds)
                artifact = await self.provider.generate_artifact(definition, project.idea)
                project.artifacts.append(ArtifactResponse.model_validate(artifact))
                if isinstance(artifact.content, dict):
                    score_val = (
                        artifact.content.get("startupScore")
                        or artifact.content.get("startup_score")
                        or artifact.content.get("score")
                    )
                    if isinstance(score_val, (int, float)):
                        project.score = max(1, min(100, int(score_val)))
                project.progress = round(index / len(ARTIFACTS) * 100)
                self.store.save(project)
            project.status = "completed"
        except Exception as exc:
            project.status = "failed"
            project.errorMessage = f"{type(exc).__name__}: {exc}"
        finally:
            self.store.save(project)
