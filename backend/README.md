# BizLens Backend

**AI Business Intelligence & Verification Platform — Backend API**

> Analytics computes. LLM explains. Verification validates.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI |
| Language | Python 3.12 |
| Database | PostgreSQL (via Supabase) |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Auth | Supabase Auth (JWT validation) |
| Storage | Supabase Storage (future) |
| Linting | Ruff |
| Testing | Pytest |
| Container | Docker |

## Current Phase

**Phase A — Architecture Lock & Repository Governance**

The backend foundation is established. No business functionality (ingestion, analytics, RAG, verification) is implemented yet.

## Project Phases (Official)

1. **Phase 1** — Data Ingestion (CSV, Excel, PDF, profiling)
2. **Phase 2** — Data Analytics (EDA, KPI, forecasting)
3. **Phase 3** — RAG & AI Interaction (retrieval, Gemini)
4. **Phase 4** — Multi-Agent System (LangGraph)
5. **Phase 5** — Trustworthy AI Verification Layer

## Local Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 16+ (or use Docker)

### 1. Create virtual environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -e ".[dev]"
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual database URL and Supabase credentials.
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Swagger docs: `http://localhost:8000/docs`

### 5. Run tests

```bash
pytest
```

### 6. Run linter

```bash
ruff check .
ruff format --check .
```

To auto-fix:

```bash
ruff check --fix .
ruff format .
```

## Database Migrations

### Run existing migrations

```bash
alembic upgrade head
```

### Create a new migration

```bash
alembic revision --autogenerate -m "description of change"
```

### Check migration status

```bash
alembic current
```

## Docker

### Start local database only

```bash
docker compose up -d db
```

Then set `DATABASE_URL=postgresql://bizlens:bizlens_dev@localhost:5432/bizlens` in `.env`.

### Start full stack

```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/health` | Application liveness | No |
| GET | `/api/v1/health/db` | Database connectivity | No |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/                 # Configuration, DB, auth, exceptions, logging
│   ├── api/                  # API routers and dependencies
│   │   ├── dependencies.py   # Shared FastAPI dependencies
│   │   └── v1/               # Versioned API routes
│   ├── modules/              # Domain modules (added per phase)
│   └── shared/               # Cross-cutting enums and utilities
├── tests/                    # Pytest test suite
├── alembic/                  # Database migration scripts
├── pyproject.toml            # Project config, dependencies, tool settings
├── .env.example              # Environment variable template
├── Dockerfile                # Production container
└── docker-compose.yml        # Local development stack
```
