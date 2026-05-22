from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://trackmydsa:trackmydsa@localhost:5432/trackmydsa"
    frontend_origin: str = "http://localhost:3000"
    jwt_secret: str = "dev-only-not-secure"
    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
