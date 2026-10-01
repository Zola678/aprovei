from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

connect_args = {}
engine_kwargs = {"echo": False}

if DATABASE_URL.startswith("sqlite"):
    # SQLite para testes locais
    engine = create_async_engine(DATABASE_URL, **engine_kwargs)
else:
    # PostgreSQL para Neon / Render / Railway
    if any(k in DATABASE_URL.lower() for k in ["neon.tech", "ssl", "onrender.com", "railway"]):
        connect_args["ssl"] = True
        connect_args["statement_cache_size"] = 0
    elif "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL:
        connect_args["ssl"] = True
        connect_args["statement_cache_size"] = 0

    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 5
    if connect_args:
        engine_kwargs["connect_args"] = connect_args

    engine = create_async_engine(DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Dependency para injetar a sessão do DB nas rotas
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

