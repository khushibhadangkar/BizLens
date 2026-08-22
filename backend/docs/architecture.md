# BizLens Backend — Architecture

## Architecture Style

**Modular Monolith** — a single deployable unit with clear internal module boundaries.

Microservices are explicitly rejected for this project. The team size (3–4 students),
timeline (8–10 months), and the fact that the core contribution is a Trustworthy AI
Verification Layer all favour simplicity over distributed complexity.

## Layers

```
┌─────────────────────────────────────────┐
│           API Layer (routers)           │  Thin HTTP handlers, validation
├─────────────────────────────────────────┤
│         Service / Domain Layer          │  Business logic
├─────────────────────────────────────────┤
│          Data Access Layer              │  SQLAlchemy models, queries
├─────────────────────────────────────────┤
│        Integration Layer                │  External APIs (Gemini, Supabase Storage)
├─────────────────────────────────────────┤
│        Core Infrastructure              │  Config, DB engine, auth, logging
└─────────────────────────────────────────┘
```

### Rules

1. **API routers are thin.** They accept requests, validate input, call a service, and return a response.
2. **Services contain business logic.** They are plain Python functions or classes.
3. **Models define database tables.** They live inside the domain module that owns them.
4. **Integrations are isolated.** If we switch from Supabase Storage to S3, only the storage integration changes.
5. **Core is shared infrastructure.** Config, database sessions, auth, and exceptions.

## Module Structure

Each domain module (created per phase) follows this pattern:

```
modules/<domain>/
├── models.py      # SQLAlchemy table definitions
├── schemas.py     # Pydantic request/response models
├── services.py    # Business logic
└── (optional extras as needed)
```

## Database Strategy

- **Engine:** PostgreSQL hosted by Supabase.
- **ORM:** SQLAlchemy 2.x with synchronous sessions.
- **Migrations:** Alembic with autogenerate support.
- **Convention:** UUIDs for primary keys. UTC timestamps for `created_at` / `updated_at`.

Async sessions are not used initially. They add complexity without benefit until
the application has concurrent I/O-bound workloads that justify the overhead.

## Authentication Strategy

The frontend authenticates users via Supabase Auth (client-side SDK).
The backend validates the resulting JWT using the project's JWT secret.

No duplicate user table is created. The authenticated user's UUID (`sub` claim)
is used directly as a foreign key in application tables.

## Storage Strategy

File uploads will be stored in Supabase Storage. A thin abstraction layer will
be introduced in Phase 1 so the rest of the application depends on an interface,
not on Supabase-specific API calls.

## Phase Boundaries

| Phase | Domain Modules Added |
|-------|---------------------|
| Phase A | (foundation only — no domain modules) |
| Phase 1 | `ingestion/` — file upload, parsing, profiling |
| Phase 2 | `analytics/` — EDA, KPIs, forecasting |
| Phase 3 | `retrieval/` — chunking, embeddings, RAG |
| Phase 4 | `agents/` — LangGraph orchestration |
| Phase 5 | `verification/` — claim extraction, verification, provenance |

Each phase adds new modules without modifying the core architecture.
