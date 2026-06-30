from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import TeacherProfile as TeacherModel, User as UserModel
from app.schemas.teacher import TeacherProfile, TeacherProfileCreate
from app.api.deps import get_current_user, get_current_user_optional
import os
import shutil
import uuid

UPLOAD_RESUME_DIR = "storage/resumes"

router = APIRouter()

@router.get("/")
async def list_teachers(
    specialty: str = Query(None, description="Filtrar por especialidade"),
    location: str = Query(None, description="Filtrar por localização (Província/Município)"),
    max_price: int = Query(None, description="Preço máximo por hora"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel | None = Depends(get_current_user_optional)
):
    # Apenas listar professores que estão aprovados ("active")
    query = select(TeacherModel).join(TeacherModel.user).where(UserModel.status == "active").options(selectinload(TeacherModel.user))
    
    if specialty:
        query = query.where(TeacherModel.specialty.ilike(f"%{specialty}%"))
    if location:
        query = query.where(TeacherModel.location.ilike(f"%{location}%"))
    if max_price:
        query = query.where(TeacherModel.price_per_hour <= max_price)
        
    result = await db.execute(query)
    teachers = result.scalars().all()

    # Verificar se o utilizador atual é premium ou admin/professor
    is_premium = current_user is not None and (current_user.is_premium or current_user.role in ["admin", "teacher"])
    
    output = []
    for t in teachers:
        t_dict = {
            "id": t.id,
            "user_id": t.user_id,
            "specialty": t.specialty,
            "rating": float(t.rating) if t.rating else 5.0,
            "subject_tags": t.subject_tags,
            "user": {
                "id": t.user.id,
                "email": t.user.email,
                "full_name": t.user.full_name,
                "photo_url": t.user.photo_url,
                "role": t.user.role,
                "is_premium": t.user.is_premium
            },
            "bio": t.bio if is_premium else "[Apenas para estudantes Premium]",
            "price_per_hour": int(t.price_per_hour) if is_premium else 0,
            "whatsapp": t.whatsapp if is_premium else None,
            "location": t.location if is_premium else "[Apenas para estudantes Premium]"
        }
        output.append(t_dict)
        
    return output

@router.get("/admin/pending")
async def list_pending_teachers(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    query = select(UserModel).where(UserModel.role == "teacher", UserModel.status.in_(["pending_approval", "pending_interview"]))
    result = await db.execute(query)
    pending_users = result.scalars().all()
    
    output = []
    for u in pending_users:
        # Buscar o perfil temporário criado na candidatura
        stmt = select(TeacherModel).where(TeacherModel.user_id == u.id)
        res_profile = await db.execute(stmt)
        p = res_profile.scalars().first()
        
        output.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "photo_url": u.photo_url,
            "status": u.status,
            "experience": u.experience,
            "years_of_experience": u.years_of_experience,
            "what_intends": u.what_intends,
            "resume_pdf_url": u.resume_pdf_url,
            "profile": {
                "specialty": p.specialty if p else "",
                "bio": p.bio if p else "",
                "price_per_hour": p.price_per_hour if p else 0,
                "whatsapp": p.whatsapp if p else "",
                "location": p.location if p else "",
                "subject_tags": p.subject_tags if p else ""
            } if p else None
        })
    return output

@router.post("/admin/{user_id}/approve")
async def approve_teacher(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    stmt = select(UserModel).where(UserModel.id == user_id, UserModel.role == "teacher")
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Professor não encontrado.")
        
    user.status = "active"
    await db.commit()
    return {"message": f"Professor {user.full_name} aprovado com sucesso!"}

@router.post("/admin/{user_id}/reject")
async def reject_teacher(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
        
    stmt = select(UserModel).where(UserModel.id == user_id, UserModel.role == "teacher")
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Professor não encontrado.")
        
    # Deletar perfil de professor
    prof_stmt = select(TeacherModel).where(TeacherModel.user_id == user_id)
    prof_result = await db.execute(prof_stmt)
    profile = prof_result.scalars().first()
    if profile:
        await db.delete(profile)
        
    # Deletar ficheiros do disco se existirem
    if user.photo_url and os.path.exists(user.photo_url):
        try:
            os.remove(user.photo_url)
        except Exception:
            pass
            
    if user.resume_pdf_url and os.path.exists(user.resume_pdf_url):
        try:
            os.remove(user.resume_pdf_url)
        except Exception:
            pass

    # Deletar utilizador
    await db.delete(user)
    await db.commit()
    
    return {"message": "Candidatura rejeitada e dados excluídos com sucesso."}

@router.get("/{teacher_id}")
async def get_teacher(
    teacher_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: UserModel | None = Depends(get_current_user_optional)
):
    stmt = select(TeacherModel).options(selectinload(TeacherModel.user)).where(TeacherModel.id == teacher_id)
    result = await db.execute(stmt)
    t = result.scalars().first()
    if not t or t.user.status != "active":
        raise HTTPException(status_code=404, detail="Professor não encontrado.")
        
    is_premium = current_user is not None and (current_user.is_premium or current_user.role in ["admin", "teacher"])
    
    return {
        "id": t.id,
        "user_id": t.user_id,
        "specialty": t.specialty,
        "rating": float(t.rating) if t.rating else 5.0,
        "subject_tags": t.subject_tags,
        "user": {
            "id": t.user.id,
            "email": t.user.email,
            "full_name": t.user.full_name,
            "photo_url": t.user.photo_url,
            "role": t.user.role,
            "is_premium": t.user.is_premium
        },
        "bio": t.bio if is_premium else "[Apenas para estudantes Premium]",
        "price_per_hour": int(t.price_per_hour) if is_premium else 0,
        "whatsapp": t.whatsapp if is_premium else None,
        "location": t.location if is_premium else "[Apenas para estudantes Premium]"
    }

@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply_teacher(
    specialty: str = Form(...),
    bio: str = Form(...),
    price_per_hour: int = Form(...),
    location: str = Form(...),
    whatsapp: str = Form(...),
    subject_tags: str = Form(...),
    experience: str = Form(...),
    years_of_experience: int = Form(...),
    what_intends: str = Form(...),
    resume: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Apenas utilizadores com papel de professor podem candidatar-se.")
        
    if current_user.status != "pending_interview":
        raise HTTPException(status_code=400, detail="Candidatura já enviada ou utilizador já aprovado.")

    # 1. Salvar o PDF do currículo
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são permitidos para o currículo.")
        
    file_name = f"{uuid.uuid4()}_{resume.filename}"
    file_path = os.path.join(UPLOAD_RESUME_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)
        
    resume_url = f"storage/resumes/{file_name}"
    
    # 2. Criar ou atualizar o Perfil de Professor
    stmt = select(TeacherModel).where(TeacherModel.user_id == current_user.id)
    result = await db.execute(stmt)
    existing_profile = result.scalars().first()
    if existing_profile:
        await db.delete(existing_profile)
        
    new_profile = TeacherModel(
        user_id=current_user.id,
        specialty=specialty,
        bio=bio,
        price_per_hour=price_per_hour,
        whatsapp=whatsapp,
        location=location,
        subject_tags=subject_tags
    )
    db.add(new_profile)
    
    # 3. Atualizar dados do utilizador com respostas da entrevista e mudar status
    current_user.experience = experience
    current_user.years_of_experience = years_of_experience
    current_user.what_intends = what_intends
    current_user.resume_pdf_url = resume_url
    current_user.status = "pending_approval" # Fila de aprovação do Admin
    
    await db.commit()
    await db.refresh(current_user)
    
    return {
        "message": "Candidatura submetida com sucesso! Aguarda a avaliação do administrador.",
        "status": current_user.status
    }

@router.post("/", response_model=TeacherProfile, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_in: TeacherProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Apenas usuários com perfil de professor podem registrar perfil de tutor.")
        
    # Verificar se perfil já existe
    stmt = select(TeacherModel).where(TeacherModel.user_id == current_user.id)
    result = await db.execute(stmt)
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Perfil de professor já existe.")
        
    new_profile = TeacherModel(
        user_id=current_user.id,
        specialty=profile_in.specialty,
        bio=profile_in.bio,
        price_per_hour=profile_in.price_per_hour,
        whatsapp=profile_in.whatsapp,
        location=profile_in.location,
        subject_tags=profile_in.subject_tags
    )
    
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    
    # Recarregar com relacionamento carregado
    stmt = select(TeacherModel).options(selectinload(TeacherModel.user)).where(TeacherModel.id == new_profile.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.put("/", response_model=TeacherProfile)
async def update_profile(
    profile_in: TeacherProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(TeacherModel).where(TeacherModel.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado.")
        
    profile.specialty = profile_in.specialty
    profile.bio = profile_in.bio
    profile.price_per_hour = profile_in.price_per_hour
    profile.whatsapp = profile_in.whatsapp
    profile.location = profile_in.location
    profile.subject_tags = profile_in.subject_tags
    
    await db.commit()
    
    # Recarregar relacionamento
    stmt = select(TeacherModel).options(selectinload(TeacherModel.user)).where(TeacherModel.id == profile.id)
    result = await db.execute(stmt)
    return result.scalars().first()


