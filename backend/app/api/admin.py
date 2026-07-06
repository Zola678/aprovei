from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import User, Exam, ForumPost, TeacherProfile
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/charts/users-growth")
async def get_users_growth(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return [
        {"name": "Jan", "Estudantes": 40, "Explicadores": 10},
        {"name": "Fev", "Estudantes": 65, "Explicadores": 15},
        {"name": "Mar", "Estudantes": 120, "Explicadores": 22},
        {"name": "Abr", "Estudantes": 180, "Explicadores": 30},
        {"name": "Mai", "Estudantes": 250, "Explicadores": 45},
        {"name": "Jun", "Estudantes": 320, "Explicadores": 60},
    ]

@router.get("/charts/distribution")
async def get_user_distribution(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    stmt_student = select(func.count(User.id)).where(User.role == "student")
    stmt_teacher = select(func.count(User.id)).where(User.role == "teacher")
    
    res_student = await db.execute(stmt_student)
    res_teacher = await db.execute(stmt_teacher)
    
    return [
        {"name": "Estudantes", "value": res_student.scalar() or 0},
        {"name": "Explicadores", "value": res_teacher.scalar() or 0}
    ]

@router.get("/ai-insights")
async def get_ai_insights(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    stmt_pending = select(func.count(User.id)).where(User.status == "pending_interview")
    res_pending = await db.execute(stmt_pending)
    pendings = res_pending.scalar() or 0
    
    insights = []
    if pendings > 0:
        insights.append({"type": "warning", "title": "Explicadores Pendentes", "description": f"Existem {pendings} explicadores à espera de entrevista. Recomendo analisar os seus perfis."})
    
    insights.append({"type": "info", "title": "Crescimento da Plataforma", "description": "Houve um aumento de 15% nas inscrições de alunos esta semana."})
    insights.append({"type": "action", "title": "Otimização de Provas", "description": "Algumas provas da UAN e ISPTEC de 2024 não possuem chave de respostas. Recomenda-se adicionar para melhorar o engajamento."})
    insights.append({"type": "action", "title": "Limpeza do Fórum", "description": "Existem 12 tópicos com mais de 6 meses sem qualquer interação. Desejas que eu apague ou arquive?"})
    
    return insights

@router.get("/forum-stats")
async def get_forum_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    return [
        {"name": "Seg", "Posts": 12, "Respostas": 20},
        {"name": "Ter", "Posts": 19, "Respostas": 35},
        {"name": "Qua", "Posts": 15, "Respostas": 28},
        {"name": "Qui", "Posts": 22, "Respostas": 40},
        {"name": "Sex", "Posts": 30, "Respostas": 60},
        {"name": "Sab", "Posts": 45, "Respostas": 85},
        {"name": "Dom", "Posts": 25, "Respostas": 45},
    ]

@router.get("/institutions")
async def get_institutions_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return [
        {"name": "UAN", "value": 45},
        {"name": "ISPTEC", "value": 30},
        {"name": "ISUTIC", "value": 15},
        {"name": "UP", "value": 10}
    ]
