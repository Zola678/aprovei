from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./aprovei.db"
    SECRET_KEY: str = "aprovei_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias
    GEMINI_API_KEY: str | None = None
    CORS_ALLOWED_ORIGINS: str | None = None

    def __init__(self, **values):
        super().__init__(**values)
        if self.DATABASE_URL:
            # Corrige prefixos postgres:// -> postgresql://
            if self.DATABASE_URL.startswith("postgres://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            # Adiciona '+asyncpg' se for postgresql e nao tiver driver especificado
            if self.DATABASE_URL.startswith("postgresql://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            # asyncpg nao suporta sslmode na query string (suporta via connect_args ou ssl=require)
            if "sslmode=require" in self.DATABASE_URL:
                self.DATABASE_URL = self.DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

