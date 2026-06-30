import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
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
            description="Exame de Acesso de Matemática da Universidade Agostinho Neto, variante A e B.",
            answer_key="1-A, 2-C, 3-A, 4-A",
            questions_text=(
                "Questão 1: Se f(x) = x^2 - 4x + 3, qual é o valor mínimo de f(x)?\n"
                "A) -1\nB) 0\nC) 1\nD) 3\n\n"
                "Questão 2: Qual é o limite de (sen(5x))/x quando x tende a 0?\n"
                "A) 0\nB) 1\nC) 5\nD) Infinito\n\n"
                "Questão 3: Resolva a equação logarítmica log2(x) + log2(x-2) = 3. Qual é o valor de x?\n"
                "A) 4\nB) 2\nC) 8\nD) 6\n\n"
                "Questão 4: Uma progressão aritmética (PA) tem o primeiro termo a1 = 3 e a razão r = 4. Qual é o décimo termo a10?\n"
                "A) 39\nB) 43\nC) 35\nD) 41"
            )
        ),
        Exam(
            university="ISUTIC",
            subject="Física",
            year=2022,
            pdf_url="https://exemplo.com/provas/isutic_fisica_2022.pdf",
            category="acesso",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/isutic_fisica_2022_resolvida.pdf",
            description="Prova oficial de Física do ISUTIC para os cursos de Engenharia Informática e Telecomunicações.",
            answer_key="1-C, 2-C, 3-B, 4-D",
            questions_text=(
                "Questão 1: Um corpo cai livremente a partir do repouso. Desprezando a resistência do ar e usando g = 10 m/s^2, qual é a velocidade do corpo após 3 segundos?\n"
                "A) 10 m/s\nB) 20 m/s\nC) 30 m/s\nD) 40 m/s\n\n"
                "Questão 2: Qual é a unidade de medida da força no Sistema Internacional (SI)?\n"
                "A) Joule\nB) Watt\nC) Newton\nD) Pascal\n\n"
                "Questão 3: A primeira lei da termodinâmica expressa o princípio da conservação da:\n"
                "A) Massa\nB) Energia\nC) Temperatura\nD) Pressão\n\n"
                "Questão 4: Um circuito tem uma resistência de 10 Ohms e uma tensão de 220 Volts. Qual é a corrente elétrica?\n"
                "A) 10 A\nB) 15 A\nC) 20 A\nD) 22 A"
            )
        ),
        Exam(
            university="UMN",
            subject="Química",
            year=2024,
            pdf_url="https://exemplo.com/provas/umn_quimica_2024.pdf",
            category="acesso",
            solved=False,
            solution_pdf_url=None,
            description="Exame recente de Química da Universidade Mandume Ya Ndemufayo para a Faculdade de Medicina.",
            answer_key="1-B, 2-C, 3-A, 4-B",
            questions_text=(
                "Questão 1: Qual é o pH de uma solução neutra a 25 °C?\n"
                "A) 0\nB) 7\nC) 14\nD) 1\n\n"
                "Questão 2: Qual elemento químico tem o símbolo 'O'?\n"
                "A) Ouro\nB) Osmio\nC) Oxigénio\nD) Olho\n\n"
                "Questão 3: Qual é o composto químico cuja fórmula é H2O?\n"
                "A) Água\nB) Álcool\nC) Ácido Clorídrico\nD) Amónia\n\n"
                "Questão 4: A ligação química caracterizada pelo compartilhamento de pares de eletrões chama-se ligação:\n"
                "A) Iónica\nB) Covalente\nC) Metálica\nD) De Hidrogénio"
            )
        ),
        Exam(
            university="UAN",
            subject="Biologia",
            year=2021,
            pdf_url="https://exemplo.com/provas/uan_biologia_2021.pdf",
            category="acesso",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/uan_biologia_2021_resolvida.pdf",
            description="Exame de Biologia (UAN). Inclui perguntas teóricas e práticas sobre genética e citologia.",
            answer_key="1-B, 2-C, 3-A, 4-A",
            questions_text=(
                "Questão 1: Qual é a organela celular responsável pela respiração celular aeróbica e produção de ATP?\n"
                "A) Complexo de Golgi\nB) Mitocôndria\nC) Ribossoma\nD) Lisossoma\n\n"
                "Questão 2: Quem é conhecido como o pai da genética moderna por suas pesquisas com ervilhas?\n"
                "A) Charles Darwin\nB) Louis Pasteur\nC) Gregor Mendel\nD) Jean-Baptiste Lamarck\n\n"
                "Questão 3: O processo de divisão celular que resulta em quatro células-filhas haploides chama-se:\n"
                "A) Meiose\nB) Mitose\nC) Fissão Binária\nD) Clonagem\n\n"
                "Questão 4: Qual é o principal pigmento responsável pela realização da fotossíntese nas plantas?\n"
                "A) Clorofila\nB) Caroteno\nC) Xantofila\nD) Hemoglobina"
            )
        ),
        Exam(
            university="Geral",
            subject="Língua Portuguesa",
            year=2023,
            pdf_url="https://exemplo.com/provas/geral_portugues_2023.pdf",
            category="geral",
            solved=True,
            solution_pdf_url="https://exemplo.com/resolucoes/geral_portugues_2023_resolvida.pdf",
            description="Modelo de preparação de Língua Portuguesa focado em interpretação de texto e gramática.",
            answer_key="1-B, 2-C, 3-B, 4-A",
            questions_text=(
                "Questão 1: Identifique a frase que apresenta um erro de concordância verbal.\n"
                "A) Eles gostam de estudar para o exame.\n"
                "B) Haviam muitos estudantes na sala de aula.\n"
                "C) Faz dois anos que não visito Luanda.\n"
                "D) Nós fomos à escola ontem.\n\n"
                "Questão 2: Qual é o antónimo da palavra 'efémero'?\n"
                "A) Passageiro\n"
                "B) Curto\n"
                "C) Duradouro\n"
                "D) Rápido\n\n"
                "Questão 3: Indique a palavra grafada incorretamente:\n"
                "A) Exceção\n"
                "B) Analisar\n"
                "C) Compania\n"
                "D) Privilégio\n\n"
                "Questão 4: Na frase 'Ela comprou um livro interessante', qual é a classe gramatical da palavra 'interessante'?\n"
                "A) Adjectivo\n"
                "B) Substantivo\n"
                "C) Advérbio\n"
                "D) Verbo"
            )
        ),
    ]

    async with AsyncSessionLocal() as session:
        for exam_item in exams_data:
            stmt = select(Exam).where(
                Exam.university == exam_item.university,
                Exam.subject == exam_item.subject,
                Exam.year == exam_item.year
            )
            result = await session.execute(stmt)
            existing_exam = result.scalars().first()
            if existing_exam:
                print(f"Atualizando {exam_item.university} - {exam_item.subject} ({exam_item.year})...")
                existing_exam.questions_text = exam_item.questions_text
                existing_exam.answer_key = exam_item.answer_key
            else:
                print(f"Adicionando {exam_item.university} - {exam_item.subject} ({exam_item.year})...")
                session.add(exam_item)
        await session.commit()
        print("Seeding e atualização de provas executados com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_exams())
