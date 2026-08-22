"""
BizLens Backend — Tests for application configuration.
"""

from app.core.config import Settings


def test_default_settings_load():
    """Settings should instantiate with defaults when no .env is present."""
    s = Settings(
        _env_file=None,
        database_url="postgresql://test:test@localhost/test",
    )
    assert s.app_env == "development"
    assert s.app_debug is False
    assert s.app_log_level == "INFO"


def test_cors_origin_parsing():
    """CORS origins string should be parsed into a list."""
    s = Settings(
        _env_file=None,
        cors_origins="http://localhost:3000, http://localhost:8080",
        database_url="postgresql://test:test@localhost/test",
    )
    assert s.cors_origin_list == ["http://localhost:3000", "http://localhost:8080"]


def test_cors_single_origin():
    """A single CORS origin should produce a one-element list."""
    s = Settings(
        _env_file=None,
        cors_origins="http://localhost:3000",
        database_url="postgresql://test:test@localhost/test",
    )
    assert s.cors_origin_list == ["http://localhost:3000"]


def test_is_development_flag():
    """is_development should reflect the app_env value."""
    s = Settings(
        _env_file=None,
        app_env="development",
        database_url="postgresql://test:test@localhost/test",
    )
    assert s.is_development is True

    s2 = Settings(
        _env_file=None,
        app_env="production",
        database_url="postgresql://test:test@localhost/test",
    )
    assert s2.is_development is False
