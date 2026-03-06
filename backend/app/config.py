from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "orbital_guard"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    frontend_origin: str = "http://localhost:5173"
    base_url: str = "http://localhost:8000"

    # Model-related
    model_path: str = str(Path(__file__).resolve().parents[2] / "environment_model.h5")
    model_classes: str = "illegal-mining,deforestation,river-encroachment"

    # Optional metadata used by UI (System Control)
    model_version: str = "v1.0.0"
    model_last_trained: str = ""
    model_dataset_size: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()

