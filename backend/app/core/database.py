from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# Otimização do Engine para alta concorrência
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,        # Mantém até 20 conexões abertas
    max_overflow=10      # Permite 10 conexões extras em picos
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Dependency para injetar a sessão do DB nas rotas
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
