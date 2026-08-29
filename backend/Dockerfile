# BizLens Backend — Dockerfile
# Minimal production-ready image for FastAPI + Uvicorn.
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install application and Python dependencies.
COPY . .
RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]