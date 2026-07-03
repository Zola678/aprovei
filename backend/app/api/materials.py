from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.models import HighSchoolMaterial as MaterialModel
from app.schemas.high_school import HighSchoolMaterial
from app.api.deps import get_current_user
from app.models.models import User as UserModel
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "storage/materials"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=HighSchoolMaterial, status_code=status.HTTP_201_CREATED)
async def upload_material(
    grade: int = Form(...),
    subject: str = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(None),
    video_url: str = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Apenas admin ou professores podem subir materiais
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Apenas professores ou administradores podem cadastrar materiais.")

    # 1. Validação de entrada
    if not file and not video_url:
        raise HTTPException(status_code=400, detail="Deves fornecer um arquivo PDF ou uma URL de vídeo.")
        
    final_file_url = ""
    
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Apenas arquivos PDF são permitidos.")
        
        file_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        final_file_url = file_path
    else:
        final_file_url = video_url
        
    # 2. Salvar no banco
    new_material = MaterialModel(
        grade=grade,
        subject=subject.capitalize(),
        title=title,
        description=description,
        file_url=final_file_url
    )
    
    db.add(new_material)
    await db.commit()
    await db.refresh(new_material)
    
    return new_material

@router.get("/", response_model=list[HighSchoolMaterial])
async def list_materials(
    grade: int = Query(None, description="Filtrar por classe (10, 11, 12)"),
    subject: str = Query(None, description="Filtrar por disciplina"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = select(MaterialModel)
    
    if grade:
        query = query.where(MaterialModel.grade == grade)
    if subject:
        query = query.where(MaterialModel.subject.ilike(f"%{subject}%"))
        
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores podem apagar materiais.")
        
    stmt = select(MaterialModel).where(MaterialModel.id == material_id)
    result = await db.execute(stmt)
    material = result.scalars().first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado.")
        
    # Remove associated file if it's a PDF stored locally
    if material.file_url and not material.file_url.startswith("http"):
        try:
            import os
            abs_path = os.path.abspath(material.file_url)
            if os.path.exists(abs_path):
                os.remove(abs_path)
        except Exception as e:
            print(f"Error removing file {material.file_url}: {e}")
            
    await db.delete(material)
    await db.commit()
    return None
