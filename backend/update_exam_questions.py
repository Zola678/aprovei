import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.models import Exam

async def update_exams():
    async with AsyncSessionLocal() as session:
        # Find UAN Matemática 2023
        stmt = select(Exam).where(Exam.university == "UAN", Exam.subject == "Matemática", Exam.year == 2023)
        res = await session.execute(stmt)
        exam = res.scalars().first()
        if exam:
            print("Encontrou a prova! Atualizando questions_text e answer_key...")
            exam.answer_key = "1-A, 2-C, 3-A, 4-A"
            exam.questions_text = "Questão 1: Se f(x) = x^2 - 4x + 3, qual é o valor mínimo de f(x)?\nA) -1\nB) 0\nC) 1\nD) 3\n\nQuestão 2: Qual é o limite de (sen(5x))/x quando x tende a 0?\nA) 0\nB) 1\nC) 5\nD) Infinito\n\nQuestão 3: Resolva a equação logarítmica log2(x) + log2(x-2) = 3. Qual é o valor de x?\nA) 4\nB) 2\nC) 8\nD) 6\n\nQuestão 4: Uma progressão aritmética (PA) tem o primeiro termo a1 = 3 e a razão r = 4. Qual é o décimo termo a10?\nA) 39\nB) 43\nC) 35\nD) 41"
            await session.commit()
            print("Prova atualizada com sucesso!")
        else:
            # Se não existe, cria ela
            print("Prova não encontrada. Criando nova prova UAN Matemática 2023...")
            new_exam = Exam(
                university="UAN",
                subject="Matemática",
                year=2023,
                pdf_url="https://exemplo.com/provas/uan_matematica_2023.pdf",
                category="acesso",
                solved=True,
                solution_pdf_url="https://exemplo.com/resolucoes/uan_matematica_2023_resolvida.pdf",
                description="Exame de Acesso de Matemática da Universidade Agostinho Neto, variante A e B.",
                answer_key="1-A, 2-C, 3-A, 4-A",
                questions_text="Questão 1: Se f(x) = x^2 - 4x + 3, qual é o valor mínimo de f(x)?\nA) -1\nB) 0\nC) 1\nD) 3\n\nQuestão 2: Qual é o limite de (sen(5x))/x quando x tende a 0?\nA) 0\nB) 1\nC) 5\nD) Infinito\n\nQuestão 3: Resolva a equação logarítmica log2(x) + log2(x-2) = 3. Qual é o valor de x?\nA) 4\nB) 2\nC) 8\nD) 6\n\nQuestão 4: Uma progressão aritmética (PA) tem o primeiro termo a1 = 3 e a razão r = 4. Qual é o décimo termo a10?\nA) 39\nB) 43\nC) 35\nD) 41"
            )
            session.add(new_exam)
            await session.commit()
            print("Prova UAN Matemática 2023 inserida com sucesso!")

if __name__ == "__main__":
    asyncio.run(update_exams())
