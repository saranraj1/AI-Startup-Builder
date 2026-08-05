# Architecture

Forgeway is split into a browser client and an API that owns generation state. The browser submits an idea, polls a project resource, and renders persisted artifacts. The demo implementation uses an in-memory repository and FastAPI background tasks so it works with zero infrastructure. Production replaces that repository with PostgreSQL and the background task with Redis/Celery without changing the HTTP contract.

## Agent contract

Every agent receives the original idea, project metadata, previous artifacts, and an explicit output schema. Outputs must include `confidence` (`generated`, `estimate`, or `verified`) and assumptions. The intended orchestrator persists each section independently so one provider timeout does not discard completed work. The current build keeps this state in memory while the storage boundary is being implemented.

## Production boundaries

- API: authentication, authorization, project CRUD, artifact versioning, exports, billing hooks.
- Orchestrator: stage registry, retries, idempotency keys, token/cost accounting.
- Research: web/search connectors plus Qdrant embeddings, with source URLs stored beside claims.
- Storage: MinIO/S3 for exports and brand assets.

The first production provider target is Gemini. The deterministic demo provider remains available for local development and tests, and Groq can be added later behind the same provider interface if low-latency generation becomes a product requirement.

The API exposes `POST /api/v1/projects/{project_id}/generate` for explicit retries. A retry clears the previous partial artifact set, returns the project to `queued`, and runs under a per-project lock so overlapping generation jobs do not write concurrently.
