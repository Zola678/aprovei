import asyncio
import os
import sys

# Adiciona o diretório ao PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
# Importar todos os modelos para garantir que o SQLAlchemy os mapeie
from app.models.models import (
    User, Exam, TeacherProfile, ForumPost, ForumComment,
    StudyTask, Payment, HighSchoolMaterial, AIChatSession,
    AIChatMessage, PostLike, Classroom, ClassroomEnrollment
)

async def init_db():
    print("[DB-INIT]: A conectar ao PostgreSQL remoto no Railway...")
    async with engine.begin() as conn:
        print("[DB-INIT]: A sincronizar e criar tabelas se não existirem...")
        await conn.run_sync(Base.metadata.create_all)
    print("[DB-INIT] SUCESSO: Todas as tabelas foram configuradas de forma segura no Railway!")

if __name__ == "__main__":
    asyncio.run(init_db())
