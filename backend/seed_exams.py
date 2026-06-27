import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine
from app.models.models import Exam

async def seed_exams():
    exams_data = [
        Exam(
            university="UAN",
            subject="Matemática",
            year=2023,
            pdf_url="https://exemplo.com/provas/uan_matematica_2023.pdf",
            category="acesso",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/uan_matematica_2023_resolvida.pdf",
            description="Exame de Acesso de Matemática da Universidade Agostinho Neto, variante A e B."
        ),
        Exam(
            university="ISUTIC",
            subject="Física",
            year=2022,
            pdf_url="https://exemplo.com/provas/isutic_fisica_2022.pdf",
            category="acesso",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/isutic_fisica_2022_resolvida.pdf",
            description="Prova oficial de Física do ISUTIC para os cursos de Engenharia Informática e Telecomunicações."
        ),
        Exam(
            university="UMN",
            subject="Química",
            year=2024,
            pdf_url="https://exemplo.com/provas/umn_quimica_2024.pdf",
            category="acesso",
            solved=False,
            solution_pdf_url=None,
            description="Exame recente de Química da Universidade Mandume Ya Ndemufayo para a Faculdade de Medicina."
        ),
        Exam(
            university="UAN",
            subject="Biologia",
            year=2021,
            pdf_url="https://exemplo.com/provas/uan_biologia_2021.pdf",
            category="acesso",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/uan_biologia_2021_resolvida.pdf",
            description="Exame de Biologia (UAN). Inclui perguntas teóricas e práticas sobre genética e citologia."
        ),
        Exam(
            university="Geral",
            subject="Língua Portuguesa",
            year=2023,
            pdf_url="https://exemplo.com/provas/geral_portugues_2023.pdf",
            category="geral",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/geral_portugues_2023_resolvida.pdf",
            description="Modelo de preparação de Língua Portuguesa focado em interpretação de texto e gramática."
        ),
    ]

    async with AsyncSessionLocal() as session:
        # Check if exams exist
        from sqlalchemy import select
        result = await session.execute(select(Exam))
        existing = result.scalars().all()
        if not existing:
            print("Adicionando provas de modelo ao banco de dados...")
            session.add_all(exams_data)
            await session.commit()
            print(f"{len(exams_data)} provas foram inseridas com sucesso!")
        else:
            print("O banco de dados já contém provas. Nenhuma prova adicional foi inserida.")

if __name__ == "__main__":
    asyncio.run(seed_exams())
