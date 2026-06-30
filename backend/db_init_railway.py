import asyncio
import os
import sys

# Adiciona o diretório ao PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from sqlalchemy import text
# Importar todos os modelos para garantir que o SQLAlchemy os mapeie
from app.models.models import (
    User, Exam, TeacherProfile, ForumPost, ForumComment,
    StudyTask, Payment, HighSchoolMaterial, AIChatSession,
    AIChatMessage, PostLike, Classroom, ClassroomEnrollment, CallConfirmation
)

async def init_db():
    print("[DB-INIT]: A conectar ao PostgreSQL remoto no Railway...")
    async with engine.begin() as conn:
        print("[DB-INIT]: A sincronizar e criar tabelas se não existirem...")
        await conn.run_sync(Base.metadata.create_all)
        
        # Executar os comandos ALTER TABLE para garantir que os novos campos de streaming existam
        print("[DB-INIT]: A adicionar novas colunas de streaming ao forum_posts se necessário...")
        try:
            # PostgreSQL suporta ADD COLUMN IF NOT EXISTS
            await conn.execute(text("ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_call BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS call_title VARCHAR(255) NULL"))
            await conn.execute(text("ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS call_scheduled_at TIMESTAMP NULL"))
            await conn.execute(text("ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS call_status VARCHAR(50) DEFAULT 'scheduled'"))
            await conn.execute(text("ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS call_url VARCHAR(500) NULL"))
            print("[DB-INIT]: Colunas de streaming sincronizadas com sucesso.")
        except Exception as e:
            print(f"[DB-INIT] AVISO/INFO: Ignorado erro de ALTER TABLE (esperado se SQLite local): {e}")
            
    print("[DB-INIT] SUCESSO: Todas as tabelas foram configuradas de forma segura no Railway!")

if __name__ == "__main__":
    asyncio.run(init_db())
