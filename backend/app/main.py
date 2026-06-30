from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request
import logging
import asyncio
from app.api import auth, exams, teachers, forum, study, payments, ai, materials, classrooms
from app.core.database import engine, Base
from app.models.models import User, Exam, TeacherProfile, ForumPost, ForumComment, StudyTask, Payment, HighSchoolMaterial
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="APROVEI API",
    description="API de Suporte Académico - FILDA Ready",
    version="1.0.0"
)

# Integração do Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS para Desenvolvimento e Produção
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://aprovei-frontend-production.up.railway.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Inclusão das rotas
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(exams.router, prefix="/api/v1/exams", tags=["exams"])
app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["teachers"])
app.include_router(forum.router, prefix="/api/v1/forum", tags=["forum"])
app.include_router(study.router, prefix="/api/v1/study", tags=["study"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["materials"])
app.include_router(classrooms.router, prefix="/api/v1/classrooms", tags=["classrooms"])

# Garantir que a pasta storage existe e criar as subpastas
os.makedirs("storage", exist_ok=True)
os.makedirs("storage/exams", exist_ok=True)
os.makedirs("storage/materials", exist_ok=True)
os.makedirs("storage/photos", exist_ok=True)
os.makedirs("storage/resumes", exist_ok=True)

# Servir arquivos estáticos do diretório storage
app.mount("/storage", StaticFiles(directory="storage"), name="storage")



# Handler Global para Erros de Validação (Segurança: Não expor detalhes internos)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    
    error_messages = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []) if loc != "body")
        msg = error.get("msg", "")
        
        # Traduzindo erros comuns do Pydantic para português
        if "String should have at least" in msg:
            msg = f"Deve ter no mínimo {error.get('ctx', {}).get('min_length', 8)} caracteres."
        elif "String should have at most" in msg:
            msg = f"Deve ter no máximo {error.get('ctx', {}).get('max_length', 72)} caracteres."
        elif "value is not a valid email address" in msg:
            msg = "E-mail inválido."
        elif "String should match pattern" in msg:
            msg = "Formato inválido."
        elif "Field required" in msg:
            msg = "Campo obrigatório."
            
        friendly_msg = f"{field}: {msg}" if field else msg
        error_messages.append(friendly_msg)
        
    friendly_detail = " | ".join(error_messages) if error_messages else "Dados inválidos."

    return JSONResponse(
        status_code=422,
        content={"detail": friendly_detail, "errors": exc.errors()},
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "APROVEI API operante e segura."}

@app.on_event("startup")
async def on_startup():
    max_retries = 5
    retry_delay = 5
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Tentando conectar ao banco de dados (Tentativa {attempt}/{max_retries})...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                
                # SQL para migrar a tabela de utilizadores com os novos campos de entrevista/status
                try:
                    from sqlalchemy import text
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255)"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS experience TEXT"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS what_intends TEXT"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_pdf_url VARCHAR(255)"))
                    
                    # Migração para exames e desafios IA
                    await conn.execute(text("ALTER TABLE exams ADD COLUMN IF NOT EXISTS answer_key TEXT"))
                    await conn.execute(text("ALTER TABLE exams ADD COLUMN IF NOT EXISTS questions_text TEXT"))
                    await conn.execute(text("ALTER TABLE ai_chat_sessions ADD COLUMN IF NOT EXISTS exam_id INTEGER REFERENCES exams(id)"))
                except Exception as e:
                    logger.error(f"Erro ao rodar migração de tabelas no startup: {e}")
            logger.info("Banco de dados conectado e inicializado com sucesso!")
            
            # Seeding automático de Admin, Provas e Materiais do Ensino Médio
            try:
                import sys
                import os
                backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                if backend_dir not in sys.path:
                    sys.path.append(backend_dir)
                
                from reset_admin import reset_admin
                from seed_exams import seed_exams
                from seed_materials import seed_materials
                
                logger.info("Iniciando carregamento de dados padrão (Seeding)...")
                await reset_admin()
                await seed_exams()
                await seed_materials()
                logger.info("Seeding concluído com sucesso!")
            except Exception as e:
                logger.error(f"Erro ao executar seeding no startup: {e}")
            break
        except Exception as e:
            logger.error(f"Erro de conexao com o banco de dados na tentativa {attempt}: {e}")
            if attempt == max_retries:
                logger.error("Nao foi possivel conectar ao banco de dados após várias tentativas. Continuando inicialização do servidor...")
            else:
                await asyncio.sleep(retry_delay)

