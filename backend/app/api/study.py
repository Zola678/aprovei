from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.models import StudyTask as TaskModel, User as UserModel
from app.schemas.study_task import StudyTask, StudyTaskCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/tasks", response_model=list[StudyTask])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(TaskModel).where(TaskModel.user_id == current_user.id).order_by(TaskModel.due_date.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/tasks", response_model=StudyTask, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: StudyTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    new_task = TaskModel(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        due_date=task_in.due_date,
        completed=task_in.completed
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.put("/tasks/{task_id}", response_model=StudyTask)
async def update_task(
    task_id: int,
    task_in: StudyTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        
    task.title = task_in.title
    task.description = task_in.description
    task.due_date = task_in.due_date
    task.completed = task_in.completed
    
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(TaskModel).where(TaskModel.id == task_id, TaskModel.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        
    await db.delete(task)
    await db.commit()
    return None
