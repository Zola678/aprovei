from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
import httpx
import secrets
import string
import os
import shutil
import uuid
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User as UserModel
from app.schemas.user import UserCreate, User
from app.core.limiter import limiter
from pydantic import BaseModel, EmailStr

UPLOAD_PHOTO_DIR = "storage/photos"

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SocialLoginRequest(BaseModel):
    provider: str # 'google' ou 'github'
    token: str # ID Token (Google) ou Access Token (GitHub)
    role: str = "student" # Papel padrão caso seja um novo registo

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute") # Protect registration from automated spamming
async def register_user(request: Request, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(UserModel).where(UserModel.email == user_in.email)
    result = await db.execute(stmt)
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já registrado."
        )

    hashed_password = get_password_hash(user_in.password)
    status_val = "pending_interview" if user_in.role == "teacher" else "active"
    new_user = UserModel(
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
        full_name=user_in.full_name,
        phone=user_in.phone,
        educational_level=user_in.educational_level,
        status=status_val
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/register-teacher", status_code=status.HTTP_201_CREATED)
async def register_teacher(
    email: EmailStr = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    phone: str = Form(...),
    educational_level: str = Form("university_access"),
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. Verificar se e-mail já existe
    stmt = select(UserModel).where(UserModel.email == email)
    result = await db.execute(stmt)
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-mail já registrado.")
        
    # 2. Salvar a foto de perfil
    if not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Apenas arquivos de imagem são permitidos.")
        
    file_ext = os.path.splitext(photo.filename)[1]
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_PHOTO_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
        
    photo_url = f"storage/photos/{file_name}"
    
    # 3. Criar o utilizador
    hashed_password = get_password_hash(password)
    new_user = UserModel(
        email=email,
        password_hash=hashed_password,
        role="teacher",
        full_name=full_name,
        phone=phone,
        educational_level=educational_level,
        status="pending_interview", # Inicia na fase de entrevista online
        photo_url=photo_url
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "full_name": new_user.full_name,
        "phone": new_user.phone,
        "photo_url": new_user.photo_url,
        "status": new_user.status
    }

@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute") # Protect login endpoint
async def login(request: Request, credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(UserModel).where(UserModel.email == credentials.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )
        
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-oauth2")
async def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    stmt = select(UserModel).where(UserModel.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )
        
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/social-login", response_model=TokenResponse)
async def social_login(request: Request, credentials: SocialLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Autenticação via Google ou GitHub. O Frontend deve enviar o token recebido do provedor.
    Se o usuário não existir, será criado automaticamente.
    """
    email = None
    full_name = None

    if credentials.provider == "google":
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={credentials.token}")
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Token do Google inválido ou expirado.")
            data = resp.json()
            email = data.get("email")
            full_name = data.get("name")
            
    elif credentials.provider == "github":
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {credentials.token}"}
            resp = await client.get("https://api.github.com/user", headers=headers)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Token do GitHub inválido.")
            data = resp.json()
            email = data.get("email")
            full_name = data.get("name")
            
            # O email pode estar privado no GitHub
            if not email:
                resp_emails = await client.get("https://api.github.com/user/emails", headers=headers)
                if resp_emails.status_code == 200:
                    emails_data = resp_emails.json()
                    primary_email = next((e["email"] for e in emails_data if e.get("primary")), None)
                    email = primary_email

    else:
        raise HTTPException(status_code=400, detail="Provedor de login não suportado.")

    if not email:
        raise HTTPException(status_code=400, detail="Não foi possível obter o e-mail do provedor. Verifique as permissões.")

    # Verifica se o usuário já existe no banco
    stmt = select(UserModel).where(UserModel.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # Cria um novo usuário com senha aleatória complexa (visto que o login é OAuth)
        random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        hashed_password = get_password_hash(random_password)
        
        user = UserModel(
            email=email,
            password_hash=hashed_password,
            role=credentials.role,
            full_name=full_name
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Gera o nosso JWT interno (APROVEI JWT)
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

from app.api.deps import get_current_user

@router.get("/me", response_model=User)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

from sqlalchemy import func
from app.models.models import Exam as ExamModel, ForumPost as ForumPostModel

@router.get("/admin/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    # Contar Alunos
    students_query = select(func.count(UserModel.id)).where(UserModel.role == "student")
    students_res = await db.execute(students_query)
    total_students = students_res.scalar() or 0
    
    # Contar Professores Ativos
    teachers_active_query = select(func.count(UserModel.id)).where(UserModel.role == "teacher", UserModel.status == "active")
    teachers_active_res = await db.execute(teachers_active_query)
    total_teachers_active = teachers_active_res.scalar() or 0
    
    # Contar Professores Pendentes de Aprovação
    teachers_pending_query = select(func.count(UserModel.id)).where(UserModel.role == "teacher", UserModel.status.in_(["pending_approval", "pending_interview"]))
    teachers_pending_res = await db.execute(teachers_pending_query)
    total_teachers_pending = teachers_pending_res.scalar() or 0
    
    # Contar Exames
    exams_query = select(func.count(ExamModel.id))
    exams_res = await db.execute(exams_query)
    total_exams = exams_res.scalar() or 0
    
    # Contar Posts do Fórum
    forum_query = select(func.count(ForumPostModel.id))
    forum_res = await db.execute(forum_query)
    total_posts = forum_res.scalar() or 0
    
    return {
        "total_students": total_students,
        "total_teachers_active": total_teachers_active,
        "total_teachers_pending": total_teachers_pending,
        "total_exams": total_exams,
        "total_posts": total_posts
    }

@router.get("/admin/students")
async def list_students(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    query = select(UserModel).where(UserModel.role == "student").order_by(UserModel.full_name)
    result = await db.execute(query)
    students = result.scalars().all()
    
    return [{
        "id": s.id,
        "email": s.email,
        "full_name": s.full_name,
        "phone": s.phone,
        "is_premium": s.is_premium
    } for s in students]

@router.get("/admin/teachers/active")
async def list_active_teachers(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    query = select(UserModel).where(UserModel.role == "teacher", UserModel.status == "active").order_by(UserModel.full_name)
    result = await db.execute(query)
    teachers = result.scalars().all()
    
    output = []
    for t in teachers:
        from app.models.models import Teacher as TeacherModel
        stmt = select(TeacherModel).where(TeacherModel.user_id == t.id)
        res_profile = await db.execute(stmt)
        p = res_profile.scalars().first()
        
        output.append({
            "id": t.id,
            "email": t.email,
            "full_name": t.full_name,
            "phone": t.phone,
            "photo_url": t.photo_url,
            "profile": {
                "specialty": p.specialty if p else "Geral",
                "price_per_hour": p.price_per_hour if p else 0,
                "location": p.location if p else "Angola",
                "whatsapp": p.whatsapp if p else ""
            } if p else None
        })
    return output
