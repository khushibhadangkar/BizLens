"""
BizLens Backend — FastAPI Application Entry Point.

Creates and configures the FastAPI application instance.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import health
from app.core.config import settings
from app.core.exceptions import BizLensError, bizlens_error_to_http
from app.core.logging import setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    setup_logging()
    logger.info(
        "BizLens backend starting — env=%s, debug=%s",
        settings.app_env,
        settings.app_debug,
    )
    yield
    logger.info("BizLens backend shutting down")


def create_app() -> FastAPI:
    """Application factory — creates and returns a configured FastAPI instance."""
    app = FastAPI(
        title="BizLens Backend",
        description="AI Business Intelligence & Verification Platform",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # --- Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Exception handlers ---
    @app.exception_handler(BizLensError)
    async def handle_bizlens_error(request: Request, exc: BizLensError) -> JSONResponse:
        http_exc = bizlens_error_to_http(exc)
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail},
        )

    # --- Routers ---
    app.include_router(health.router, prefix="/api/v1")

    return app


app = create_app()
