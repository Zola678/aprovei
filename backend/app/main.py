from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from starlette.requests import Request
import logging
import asyncio
from app.api import auth, exams, teachers, forum, study, payments, ai, materials, classrooms, admin
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

# CORS para Desenvolvimento e Produção (Render, Railway, Vercel e Local)
import os
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://aprovei-frontend-production.up.railway.app"
]

cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS")
if cors_origins_env:
    if cors_origins_env.strip() == "*":
        allowed_origins = ["*"]
    else:
        for origin in cors_origins_env.split(","):
            clean_origin = origin.strip()
            if clean_origin:
                if clean_origin.endswith("/"):
                    clean_origin = clean_origin[:-1]
                allowed_origins.append(clean_origin)

cors_kwargs = {
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

if "*" in allowed_origins:
    cors_kwargs["allow_origins"] = ["*"]
    cors_kwargs["allow_credentials"] = False
else:
    cors_kwargs["allow_origins"] = allowed_origins
    cors_kwargs["allow_origin_regex"] = r"^https?://.*(railway\.app|onrender\.com|vercel\.app|pages\.dev|localhost)(:\d+)?$"

app.add_middleware(CORSMiddleware, **cors_kwargs)

from fastapi.staticfiles import StaticFiles
import os

# Inclusão das rotas
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Endpoint de emergência para criar/promover admin
@app.post("/api/v1/setup/promote-admin")
async def promote_to_admin(email: str, secret: str):
    """Promove um utilizador a admin. Apenas para uso inicial de configuração."""
    from app.core.database import AsyncSessionLocal
    from sqlalchemy.future import select
    from app.models.models import User as UserModel
    from app.core.security import get_password_hash
    import os

    SETUP_SECRET = os.getenv("SETUP_SECRET", "aprovei-setup-2026")
    if secret != SETUP_SECRET:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Segredo inválido.")

    async with AsyncSessionLocal() as session:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await session.execute(stmt)
        user = result.scalars().first()
        if not user:
            # Criar o utilizador admin se não existir
            user = UserModel(
                email=email,
                password_hash=get_password_hash("AdminAprovei2026!"),
                role="admin",
                full_name="Administrador",
                status="active"
            )
            session.add(user)
        else:
            user.role = "admin"
            user.status = "active"
        await session.commit()
        return {"message": f"Utilizador {email} promovido a admin com sucesso!", "role": "admin"}


app.include_router(exams.router, prefix="/api/v1/exams", tags=["exams"])
app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["teachers"])
app.include_router(forum.router, prefix="/api/v1/forum", tags=["forum"])
app.include_router(study.router, prefix="/api/v1/study", tags=["study"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["materials"])
app.include_router(classrooms.router, prefix="/api/v1/classrooms", tags=["classrooms"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

# Garantir que a pasta storage existe e criar as subpastas
os.makedirs("storage", exist_ok=True)
os.makedirs("storage/exams", exist_ok=True)
os.makedirs("storage/materials", exist_ok=True)
os.makedirs("storage/photos", exist_ok=True)
os.makedirs("storage/resumes", exist_ok=True)
os.makedirs("storage/ai_uploads", exist_ok=True)

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

    safe_errors = []
    for e in exc.errors():
        err = dict(e)
        if "input" in err and isinstance(err["input"], bytes):
            err["input"] = err["input"].decode("utf-8", "ignore")
        safe_errors.append(err)

    return JSONResponse(
        status_code=422,
        content={"detail": friendly_detail, "errors": jsonable_encoder(safe_errors)},
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
                
                # SQL para migrar tabelas - cada coluna individualmente para não bloquear as outras
                from sqlalchemy import text, inspect

                is_sqlite = str(engine.url).startswith("sqlite")

                async def safe_add_column(conn, table, column, col_type, default=None):
                    """Adiciona coluna se não existir - compatível com SQLite e PostgreSQL."""
                    try:
                        if is_sqlite:
                            # SQLite: verificar via PRAGMA
                            result = await conn.execute(text(f"PRAGMA table_info({table})"))
                            cols = [row[1] for row in result.fetchall()]
                            if column not in cols:
                                default_clause = f" DEFAULT {default}" if default is not None else ""
                                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}{default_clause}"))
                        else:
                            # PostgreSQL: suporta IF NOT EXISTS nativamente
                            default_clause = f" DEFAULT {default}" if default is not None else ""
                            await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}{default_clause}"))
                    except Exception as col_err:
                        logger.warning(f"Coluna {table}.{column} já existe ou erro ignorado: {col_err}")

                # Migração da tabela users
                await safe_add_column(conn, "users", "photo_url", "VARCHAR(255)")
                await safe_add_column(conn, "users", "status", "VARCHAR(50)", "'active'")
                await safe_add_column(conn, "users", "experience", "TEXT")
                await safe_add_column(conn, "users", "years_of_experience", "INTEGER")
                await safe_add_column(conn, "users", "what_intends", "TEXT")
                await safe_add_column(conn, "users", "resume_pdf_url", "VARCHAR(255)")
                await safe_add_column(conn, "users", "xp", "INTEGER", "0")
                await safe_add_column(conn, "users", "premium_until", "TIMESTAMP")

                # Migração da tabela exams
                await safe_add_column(conn, "exams", "answer_key", "TEXT")
                await safe_add_column(conn, "exams", "questions_text", "TEXT")

                # Migração da tabela ai_chat_sessions
                try:
                    if is_sqlite:
                        result = await conn.execute(text("PRAGMA table_info(ai_chat_sessions)"))
                        cols = [row[1] for row in result.fetchall()]
                        if "exam_id" not in cols:
                            await conn.execute(text("ALTER TABLE ai_chat_sessions ADD COLUMN exam_id INTEGER REFERENCES exams(id)"))
                    else:
                        await conn.execute(text("ALTER TABLE ai_chat_sessions ADD COLUMN IF NOT EXISTS exam_id INTEGER REFERENCES exams(id)"))
                except Exception as e:
                    logger.warning(f"Coluna ai_chat_sessions.exam_id ignorada: {e}")

                # Migração da tabela forum_posts
                await safe_add_column(conn, "forum_posts", "is_call", "BOOLEAN", "FALSE")
                await safe_add_column(conn, "forum_posts", "call_title", "VARCHAR(255)")
                await safe_add_column(conn, "forum_posts", "call_scheduled_at", "TIMESTAMP")
                await safe_add_column(conn, "forum_posts", "call_status", "VARCHAR(50)", "'scheduled'")
                await safe_add_column(conn, "forum_posts", "call_url", "VARCHAR(255)")

                logger.info("Migração de colunas concluída com sucesso!")
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
                from seed_data_rich import seed_data_rich
                
                logger.info("Iniciando carregamento de dados padrão (Seeding)...")
                await reset_admin()
                await seed_exams()
                await seed_materials()
                await seed_data_rich()
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

