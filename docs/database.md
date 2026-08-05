# Database schema

```mermaid
erDiagram
  ORGANIZATION ||--o{ USER : contains
  ORGANIZATION ||--o{ PROJECT : owns
  PROJECT ||--o{ GENERATION_RUN : has
  PROJECT ||--o{ ARTIFACT : produces
  GENERATION_RUN ||--o{ AGENT_OUTPUT : records
  ORGANIZATION ||--o{ SUBSCRIPTION : bills
  ORGANIZATION { uuid id PK string name }
  USER { uuid id PK uuid organization_id FK string email }
  PROJECT { uuid id PK uuid organization_id FK string idea string status int progress }
  GENERATION_RUN { uuid id PK uuid project_id FK string status datetime started_at }
  ARTIFACT { uuid id PK uuid project_id FK string category jsonb content string confidence }
  AGENT_OUTPUT { uuid id PK uuid run_id FK string role jsonb output int tokens }
  SUBSCRIPTION { uuid id PK uuid organization_id FK string stripe_customer_id string plan }
```

Recommended indexes: `project(organization_id, created_at desc)`, `artifact(project_id, category, version desc)`, `generation_run(project_id, created_at desc)`, and a unique idempotency key per generation run.
