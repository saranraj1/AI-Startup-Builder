# Deployment

1. Provision managed PostgreSQL, Redis, S3-compatible storage, and Qdrant.
2. Set the variables in `.env.example`; use a secret manager for provider keys, JWT secrets, and Stripe keys.
3. Build the frontend with `npm run build` and run it behind a TLS reverse proxy.
4. Run FastAPI with multiple workers, Celery workers for generation, and a separate scheduler if recurring jobs are enabled.
5. Add OpenTelemetry/Sentry, structured JSON logs, database backups, provider spend alerts, and health probes.
6. Restrict CORS to the deployed frontend origin and apply per-user/project rate limits.

The included `infra/docker-compose.yml` is for local dependencies, not production.
