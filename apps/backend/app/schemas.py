from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


ArtifactCategory = Literal[
    "analysis",
    "research",
    "business",
    "revenue",
    "brand",
    "marketing",
    "product",
    "engineering",
    "ai",
    "legal",
    "investor",
    "docs",
]
GenerationStatus = Literal["queued", "running", "completed", "failed"]
Confidence = Literal["estimate", "generated", "verified"]


class CreateProject(BaseModel):
    idea: str = Field(min_length=12, max_length=1000)


class ArtifactResponse(BaseModel):
    id: str
    category: ArtifactCategory
    title: str
    summary: str
    content: dict[str, Any]
    confidence: Confidence = "generated"


class ProjectResponse(BaseModel):
    id: str
    name: str
    idea: str
    score: int
    status: GenerationStatus
    progress: int
    artifacts: list[ArtifactResponse]
    createdAt: str
    errorMessage: str | None = None
