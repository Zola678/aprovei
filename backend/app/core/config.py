from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GEMINI_API_KEY: str | None = None

    def __init__(self, **values):
        super().__init__(**values)
        if self.DATABASE_URL:
            # Corrige 'postgres://' para 'postgresql://' (comum em Raiwall/Railway/Render)
            if self.DATABASE_URL.startswith("postgres://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            # Adiciona '+asyncpg' se for postgresql e nao tiver driver especificado
            if self.DATABASE_URL.startswith("postgresql://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

    class Config:
        env_file = ".env"

settings = Settings()

