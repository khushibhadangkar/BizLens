"""
BizLens Backend — Application Configuration.

All settings are loaded from environment variables.
Defaults are provided for local development only.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Centralised application configuration."""

    # --- Application ---
    app_env: str = "development"
    app_debug: bool = False
    app_log_level: str = "INFO"

    # --- Database ---
    database_url: str = "postgresql://user:password@localhost:5432/bizlens"

    # --- Supabase ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_service_role_key: str = ""

    # --- Storage ---
    storage_bucket_name: str = "uploads"
    max_upload_size_bytes: int = 10 * 1024 * 1024  # 10 MB

    # --- CORS ---
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


# Singleton — imported by the rest of the application.
settings = Settings()
