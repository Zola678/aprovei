from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Classroom as ClassroomModel, ClassroomEnrollment as EnrollmentModel, User as UserModel
from app.schemas.classroom import ClassroomCreate, ClassroomResponse, ClassroomEnrollmentResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ClassroomResponse, status_code=status.HTTP_201_CREATED)
async def create_classroom(
    classroom_in: ClassroomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Apenas utilizadores com papel de professor podem criar turmas."
        )
    
    new_classroom = ClassroomModel(
        teacher_id=current_user.id,
        name=classroom_in.name,
        description=classroom_in.description,
        subject=classroom_in.subject,
        price=classroom_in.price
    )
    
    db.add(new_classroom)
    await db.commit()
    await db.refresh(new_classroom)
    
    # Recarregar relacionamento do professor
    stmt = select(ClassroomModel).options(selectinload(ClassroomModel.teacher)).where(ClassroomModel.id == new_classroom.id)
    res = await db.execute(stmt)
    return res.scalars().first()

@router.get("/", response_model=list[ClassroomResponse])
async def list_classrooms(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ClassroomModel).options(selectinload(ClassroomModel.teacher)).order_by(ClassroomModel.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/{classroom_id}/enroll", response_model=ClassroomEnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_classroom(
    classroom_id: int,
    payment_reference: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Apenas estudantes podem inscrever-se em turmas."
        )
        
    # Verificar se a turma existe
    stmt = select(ClassroomModel).where(ClassroomModel.id == classroom_id)
    res = await db.execute(stmt)
    classroom = res.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
        
    # Verificar se já está inscrito
    stmt_check = select(EnrollmentModel).where(
        EnrollmentModel.classroom_id == classroom_id,
        EnrollmentModel.student_id == current_user.id
    )
    res_check = await db.execute(stmt_check)
    existing = res_check.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Já possui uma inscrição nesta turma.")
        
    # Definir status inicial
    initial_status = "approved" if classroom.price == 0 else "pending_approval"
    
    new_enrollment = EnrollmentModel(
        classroom_id=classroom_id,
        student_id=current_user.id,
        status=initial_status,
        payment_reference=payment_reference
    )
    
    db.add(new_enrollment)
    await db.commit()
    await db.refresh(new_enrollment)
    
    # Recarregar com relacionamentos
    stmt = select(EnrollmentModel).options(
        selectinload(EnrollmentModel.classroom).selectinload(ClassroomModel.teacher),
        selectinload(EnrollmentModel.student)
    ).where(EnrollmentModel.id == new_enrollment.id)
    res_load = await db.execute(stmt)
    return res_load.scalars().first()

@router.get("/teacher/enrollments", response_model=list[ClassroomEnrollmentResponse])
async def list_teacher_enrollments(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Acesso restrito a professores.")
        
    # Buscar inscrições para turmas que pertencem a este professor
    stmt = select(EnrollmentModel).join(EnrollmentModel.classroom).options(
        selectinload(EnrollmentModel.classroom).selectinload(ClassroomModel.teacher),
        selectinload(EnrollmentModel.student)
    ).where(ClassroomModel.teacher_id == current_user.id).order_by(EnrollmentModel.created_at.desc())
    
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/student/my-classes", response_model=list[ClassroomEnrollmentResponse])
async def list_student_classes(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Apenas estudantes podem ver as suas turmas.")
        
    stmt = select(EnrollmentModel).options(
        selectinload(EnrollmentModel.classroom).selectinload(ClassroomModel.teacher),
        selectinload(EnrollmentModel.student)
    ).where(EnrollmentModel.student_id == current_user.id).order_by(EnrollmentModel.created_at.desc())
    
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/enrollments/{enrollment_id}/approve", response_model=ClassroomEnrollmentResponse)
async def approve_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Acesso restrito a professores.")
        
    stmt = select(EnrollmentModel).join(EnrollmentModel.classroom).options(
        selectinload(EnrollmentModel.classroom).selectinload(ClassroomModel.teacher),
        selectinload(EnrollmentModel.student)
    ).where(
        EnrollmentModel.id == enrollment_id,
        ClassroomModel.teacher_id == current_user.id
    )
    
    res = await db.execute(stmt)
    enrollment = res.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada ou não pertence às suas turmas.")
        
    enrollment.status = "approved"
    await db.commit()
    await db.refresh(enrollment)
    return enrollment

@router.post("/enrollments/{enrollment_id}/reject", response_model=ClassroomEnrollmentResponse)
async def reject_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Acesso restrito a professores.")
        
    stmt = select(EnrollmentModel).join(EnrollmentModel.classroom).options(
        selectinload(EnrollmentModel.classroom).selectinload(ClassroomModel.teacher),
        selectinload(EnrollmentModel.student)
    ).where(
        EnrollmentModel.id == enrollment_id,
        ClassroomModel.teacher_id == current_user.id
    )
    
    res = await db.execute(stmt)
    enrollment = res.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada ou não pertence às suas turmas.")
        
    enrollment.status = "rejected"
    await db.commit()
    await db.refresh(enrollment)
    return enrollment
