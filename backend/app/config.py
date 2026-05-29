from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_JWT_SECRET = "dev-only-not-secure"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://neondb_owner@localhost:5432/neondb"
    # Comma-separated list of allowed browser origins for CORS.
    frontend_origin: str = "http://localhost:3000"
    jwt_secret: str = DEV_JWT_SECRET
    environment: str = "development"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    ai_daily_limit: int = 50  # free-plan AI requests per user per day
    ai_pro_daily_limit: int = 500  # pro-plan AI requests per user per day
    sentry_dsn: str = ""  # optional; enables error tracking when set

    # Billing (Stripe). All blank in dev -> billing endpoints return 503.
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_pro: str = ""  # Stripe Price ID for the Pro plan (set in dashboard)

    @property
    def plan_daily_limits(self) -> dict[str, int]:
        return {"free": self.ai_daily_limit, "pro": self.ai_pro_daily_limit}

    # Email (SMTP). With no smtp_host set, emails are logged to the console
    # (dev-safe) instead of being sent.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "AlgoTrail <no-reply@algotrail.ai>"
    smtp_starttls: bool = True
    # Public base URL of the frontend, used to build links in emails.
    app_base_url: str = ""

    @property
    def public_base_url(self) -> str:
        """Frontend origin to build email links from (first configured origin)."""
        if self.app_base_url:
            return self.app_base_url.rstrip("/")
        return self.cors_origins[0].rstrip("/")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.frontend_origin.split(",") if o.strip()]
        if not self.is_production:
            # Convenience for local dev across common Next.js ports.
            for port in ("3000", "3001", "3002"):
                url = f"http://localhost:{port}"
                if url not in origins:
                    origins.append(url)
        return origins

    @model_validator(mode="after")
    def _reject_insecure_production(self) -> "Settings":
        """Fail fast at startup rather than silently running insecure in prod."""
        if not self.is_production:
            return self

        problems: list[str] = []
        if self.jwt_secret == DEV_JWT_SECRET or len(self.jwt_secret) < 32:
            problems.append("JWT_SECRET must be a strong random value of at least 32 characters")
        if "localhost" in self.database_url:
            problems.append("DATABASE_URL must point to your production database, not localhost")
        if "localhost" in self.frontend_origin:
            problems.append("FRONTEND_ORIGIN must be your production URL, not localhost")
        if problems:
            raise ValueError(
                "Refusing to start with insecure production configuration:\n  - "
                + "\n  - ".join(problems)
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
