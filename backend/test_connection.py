import asyncio
import os
import sys

# Adicionar backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import engine, Base
from sqlalchemy import text

async def test_connection():
    print(f"=== TESTE DE CONEXÃO COM O BANCO DE DADOS ===")
    print(f"DATABASE_URL configurada: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            row = result.scalar()
            print(f"Resultado do ping (SELECT 1): {row}")
            print(f"Sincronizando tabelas do SQLAlchemy...")
            await conn.run_sync(Base.metadata.create_all)
            print("SUCESSO: Conexao estabelecida e tabelas validadas!")
    except Exception as e:
        print(f"ERRO ao conectar: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
