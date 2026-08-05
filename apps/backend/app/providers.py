from __future__ import annotations

import json
from typing import Any, Protocol
from uuid import uuid4

import httpx

from app.artifacts import ArtifactDefinition, demo_content
from app.config import Settings
from app.schemas import ArtifactResponse


class GenerationProvider(Protocol):
    async def generate_artifact(self, definition: ArtifactDefinition, idea: str) -> ArtifactResponse:
        ...


class DemoProvider:
    async def generate_artifact(self, definition: ArtifactDefinition, idea: str) -> ArtifactResponse:
        return ArtifactResponse(
            id=str(uuid4()),
            category=definition.category,  # type: ignore[arg-type]
            title=definition.title,
            summary=f"A first-pass {definition.title.lower()} for your idea.",
            content=demo_content(definition.category, idea),
            confidence="generated",
        )


class GeminiProvider:
    def __init__(self, settings: Settings) -> None:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is required when AI_PROVIDER=gemini")
        self.api_key = settings.gemini_api_key
        self.base_url = settings.gemini_api_base_url.rstrip("/")
        self.model = settings.ai_model

    async def generate_artifact(self, definition: ArtifactDefinition, idea: str) -> ArtifactResponse:
        payload = {
            "contents": [{"role": "user", "parts": [{"text": self._prompt(definition, idea)}]}],
            "generationConfig": {"temperature": 0.4, "responseMimeType": "application/json"},
        }
        url = f"{self.base_url}/models/{self.model}:generateContent"
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, headers={"x-goog-api-key": self.api_key}, json=payload)
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise RuntimeError(f"Gemini request failed with HTTP {response.status_code}") from exc

        content = self._extract_json(response.json())
        return ArtifactResponse(
            id=str(uuid4()),
            category=definition.category,  # type: ignore[arg-type]
            title=str(content.get("title") or definition.title),
            summary=str(content.get("summary") or f"Generated {definition.title.lower()} for your idea."),
            content=dict(content.get("content") or content),
            confidence=self._confidence(content.get("confidence")),
        )

    @staticmethod
    def _prompt(definition: ArtifactDefinition, idea: str) -> str:
        return (
            "You are Forgeway, a rigorous AI startup-building workspace. "
            "Generate one startup artifact as valid JSON only. "
            "Do not include markdown fences. Label uncertain numbers as estimates. "
            "Return this shape: {"
            '"title": string, "summary": string, "confidence": "estimate"|"generated"|"verified", '
            '"content": object'
            "}. "
            f"Startup idea: {idea}\n"
            f"Artifact: {definition.title}\n"
            f"Focus: {definition.prompt_focus}"
        )

    @staticmethod
    def _extract_json(payload: dict[str, Any]) -> dict[str, Any]:
        candidates = payload.get("candidates") or []
        if not candidates:
            raise ValueError("Gemini returned no candidates")
        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(str(part.get("text", "")) for part in parts)
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.removeprefix("```").removeprefix("json").removesuffix("```").strip()
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError("Gemini returned invalid JSON") from exc
        if not isinstance(parsed, dict):
            raise ValueError("Gemini JSON response must be an object")
        return parsed

    @staticmethod
    def _confidence(value: Any) -> str:
        return value if value in {"estimate", "generated", "verified"} else "generated"


def create_provider(settings: Settings) -> GenerationProvider:
    if settings.ai_provider == "gemini":
        return GeminiProvider(settings)
    if settings.ai_provider == "groq":
        raise NotImplementedError("Groq provider is planned but not implemented in this build slice")
    return DemoProvider()
