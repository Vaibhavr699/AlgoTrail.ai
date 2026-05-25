from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://neondb_owner@localhost:5432/neondb"
    frontend_origin: str = "http://localhost:3000"
    jwt_secret: str = "dev-only-not-secure"
    environment: str = "development"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
