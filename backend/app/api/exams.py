from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.models import Exam as ExamModel
from app.schemas.exam import Exam
from app.api.deps import get_current_user
from app.models.models import User as UserModel
import shutil
import os
import uuid

router = APIRouter()

# Pasta de armazenamento (Em prod, seria S3/Cloud Storage)
UPLOAD_DIR = "storage/exams"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=Exam, status_code=status.HTTP_201_CREATED)
async def upload_exam(
    university: str = Form(...),
    subject: str = Form(...),
    year: int = Form(...),
    category: str = Form(...),
    description: str = Form(None),
    answer_key: str = Form(None),
    questions_text: str = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Apenas admin ou professores podem subir provas
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Apenas professores ou administradores podem cadastrar provas.")

    # 1. Validação de segurança do arquivo
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são permitidos.")
    
    # 2. Gerar nome único para evitar sobrescrita
    file_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # 3. Salvar arquivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 4. Salvar no banco
    new_exam = ExamModel(
        university=university.upper(),
        subject=subject.capitalize(),
        year=year,
        category=category,
        description=description,
        pdf_url=file_path,
        solved=False,
        answer_key=answer_key,
        questions_text=questions_text
    )
    
    db.add(new_exam)
    await db.commit()
    await db.refresh(new_exam)
    
    return new_exam

@router.get("/", response_model=list[Exam])
async def list_exams(
    university: str = Query(None, description="Filtrar por universidade"),
    subject: str = Query(None, description="Filtrar por disciplina"),
    year: int = Query(None, description="Filtrar por ano"),
    category: str = Query(None, description="Filtrar por categoria (acesso ou exame_especial)"),
    solved: bool = Query(None, description="Filtrar por resolvidas"),
    db: AsyncSession = Depends(get_db)
):
    query = select(ExamModel)
    
    # Aplicar filtros dinâmicos
    if university:
        query = query.where(ExamModel.university == university.upper())
    if subject:
        query = query.where(ExamModel.subject.ilike(f"%{subject}%"))
    if year:
        query = query.where(ExamModel.year == year)
    if category:
        query = query.where(ExamModel.category == category)
    if solved is not None:
        query = query.where(ExamModel.solved == solved)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{exam_id}", response_model=Exam)
async def get_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ExamModel).where(ExamModel.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Prova não encontrada.")
    return exam

@router.post("/{exam_id}/solve", response_model=Exam)
async def upload_exam_solution(
    exam_id: int,
    solution_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Apenas professores e admins podem resolver provas
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Apenas professores podem enviar resoluções de provas.")
        
    stmt = select(ExamModel).where(ExamModel.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalars().first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Prova não encontrada.")
        
    if solution_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF para resoluções são permitidos.")
        
    file_name = f"solution_{uuid.uuid4()}_{solution_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(solution_file.file, buffer)
        
    exam.solved = True
    exam.solution_pdf_url = file_path
    
    await db.commit()
    await db.refresh(exam)
    return exam
