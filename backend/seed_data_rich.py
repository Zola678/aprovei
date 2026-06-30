import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.models import User, TeacherProfile, ForumPost
from app.core.security import get_password_hash

async def seed_data_rich():
    print("[RICH SEEDER]: Inicializando seeding rico...")
    
    # Criar caminhos de mídia fake se não existirem
    os.makedirs("storage/resumes", exist_ok=True)
    os.makedirs("storage/photos", exist_ok=True)
    
    with open("storage/resumes/dummy_resume1.pdf", "w") as f:
        f.write("%PDF-1.4 dummy resume content 1")
    with open("storage/resumes/dummy_resume2.pdf", "w") as f:
        f.write("%PDF-1.4 dummy resume content 2")
    with open("storage/photos/dummy_photo.jpg", "w") as f:
        f.write("dummy photo content")

    hashed_password = get_password_hash("Aprovei2026!")

    async with AsyncSessionLocal() as session:
        # 1. Seed Estudantes (se não existirem)
        students_data = [
            ("student1@aprovei.com", "Manuel Santos", "923000111", True, "university_access"),
            ("student2@aprovei.com", "Cláudia André", "912000222", False, "high_school"),
            ("student3@aprovei.com", "António Guterres", "931000333", True, "university"),
            ("student4@aprovei.com", "Helena Kiala", "941000444", False, "university_access")
        ]
        
        for email, name, phone, is_premium, ed_level in students_data:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            if not res.scalars().first():
                student = User(
                    email=email,
                    password_hash=hashed_password,
                    role="student",
                    full_name=name,
                    phone=phone,
                    is_premium=is_premium,
                    educational_level=ed_level,
                    status="active"
                )
                session.add(student)
                print(f"[RICH SEEDER]: Estudante {name} adicionado.")

        # 2. Seed Explicadores Ativos (se não existirem)
        teachers_active_data = [
            ("teacher_active1@aprovei.com", "Prof. Dr. Mateus Bernardo", "923111222", "Luanda, Talatona", 
             "Matemática Aplicada e Cálculo I/II", 6000, "https://wa.me/244923111222", 
             "Professor Universitário com mais de 10 anos de experiência em exames de acesso da UAN.", 
             "Matemática, Física, Álgebra"),
            ("teacher_active2@aprovei.com", "Dra. Isabel Neto", "912333444", "Huíla, Lubango", 
             "Língua Portuguesa e Redação", 4500, "https://wa.me/244912333444", 
             "Mestre em Letras, especialista em preparação técnica para redações do ISUTIC e UAN.", 
             "Português, Redação, Literatura"),
            ("teacher_active3@aprovei.com", "Eng. Carlos Silva", "931444555", "Benguela, Lobito", 
             "Física Geral e Termodinâmica", 5500, "https://wa.me/244931444555", 
             "Explicador de engenharia há 6 anos, focado em cinemática, dinâmica e eletricidade.", 
             "Física, Mecânica, Termodinâmica")
        ]

        for email, name, phone, loc, specialty, price, wa, bio, tags in teachers_active_data:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            user = res.scalars().first()
            if not user:
                user = User(
                    email=email,
                    password_hash=hashed_password,
                    role="teacher",
                    full_name=name,
                    phone=phone,
                    status="active",
                    experience=bio,
                    years_of_experience=6,
                    photo_url="storage/photos/dummy_photo.jpg"
                )
                session.add(user)
                await session.flush()  # Para obter o ID gerado do user
                
                profile = TeacherProfile(
                    user_id=user.id,
                    specialty=specialty,
                    bio=bio,
                    price_per_hour=price,
                    whatsapp=wa,
                    location=loc,
                    rating=5.0,
                    subject_tags=tags
                )
                session.add(profile)
                print(f"[RICH SEEDER]: Explicador Ativo {name} e perfil adicionados.")

        # 3. Seed Candidaturas Pendentes de Avaliação (status='pending_approval')
        teachers_pending_data = [
            ("teacher_pending1@aprovei.com", "Albertina Simão", "941555666", "Cabinda, Cabinda", 
             "Biologia Celular e Genética", 4000, "https://wa.me/244941555666", 
             "Licenciada em Ciências Biológicas, 3 anos lecionando no Ensino Médio.", 3, 
             "Ajudar os estudantes a ingressarem na faculdade de medicina.", "storage/resumes/dummy_resume1.pdf", 
             "Biologia, Química"),
            ("teacher_pending2@aprovei.com", "Daniel Cassule", "923999888", "Luanda, Maianga", 
             "Química Orgânica e Geral", 5000, "https://wa.me/244923999888", 
             "Químico Industrial e explicador autónomo de Química preparatória há 5 anos.", 5, 
             "Desenvolver o raciocínio químico nos estudantes de engenharias.", "storage/resumes/dummy_resume2.pdf", 
             "Química, Ciências")
        ]

        for email, name, phone, loc, specialty, price, wa, exp, years, intent, resume_url, tags in teachers_pending_data:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            user = res.scalars().first()
            if not user:
                user = User(
                    email=email,
                    password_hash=hashed_password,
                    role="teacher",
                    full_name=name,
                    phone=phone,
                    status="pending_approval",
                    experience=exp,
                    years_of_experience=years,
                    what_intends=intent,
                    resume_pdf_url=resume_url,
                    photo_url="storage/photos/dummy_photo.jpg"
                )
                session.add(user)
                await session.flush()
                
                profile = TeacherProfile(
                    user_id=user.id,
                    specialty=specialty,
                    bio=exp,
                    price_per_hour=price,
                    whatsapp=wa,
                    location=loc,
                    rating=5.0,
                    subject_tags=tags
                )
                session.add(profile)
                print(f"[RICH SEEDER]: Candidatura Pendente de {name} criada.")

        # 4. Seed Candidaturas em Fase de Entrevista (status='pending_interview', sem perfil)
        interview_data = [
            ("teacher_interview1@aprovei.com", "Zola Manuel", "923444777")
        ]
        
        for email, name, phone in interview_data:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            user = res.scalars().first()
            if not user:
                user = User(
                    email=email,
                    password_hash=hashed_password,
                    role="teacher",
                    full_name=name,
                    phone=phone,
                    status="pending_interview",
                    photo_url="storage/photos/dummy_photo.jpg"
                )
                session.add(user)
                print(f"[RICH SEEDER]: Candidato em Entrevista {name} adicionado.")

        # 5. Seed Fórum Posts (se não existirem)
        stmt = select(ForumPost)
        res = await session.execute(stmt)
        if not res.scalars().first():
            # Buscar um estudante e um professor para autoria
            student_stmt = select(User).where(User.role == "student")
            student_user = (await session.execute(student_stmt)).scalars().first()
            
            teacher_stmt = select(User).where(User.role == "teacher", User.status == "active")
            teacher_user = (await session.execute(teacher_stmt)).scalars().first()
            
            if student_user and teacher_user:
                post1 = ForumPost(
                    title="Dúvida em Limites Notáveis - Exame UAN",
                    content="Olá pessoal! Alguém me consegue ajudar a resolver o limite de (e^x - 1)/x quando x tende a 0? Não consigo perceber o desenvolvimento algebraico necessário.",
                    category="Dúvidas",
                    user_id=student_user.id,
                    likes=12
                )
                post2 = ForumPost(
                    title="Dicas de Estudo e Preparação Mental para o Exame",
                    content="Caros estudantes, a vossa preparação física e psicológica é tão importante quanto as horas de estudo. Durmam bem e leiam com atenção as questões.",
                    category="Dicas",
                    user_id=teacher_user.id,
                    likes=24
                )
                session.add(post1)
                session.add(post2)
                print("[RICH SEEDER]: Posts de fórum adicionados.")

        await session.commit()
        print("[RICH SEEDER] SUCESSO: Seeding concluído!")

if __name__ == "__main__":
    asyncio.run(seed_data_rich())
