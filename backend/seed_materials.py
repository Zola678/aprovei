import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import HighSchoolMaterial

async def seed_materials():
    materials_data = [
        HighSchoolMaterial(
            grade=10,
            subject="Matemática",
            title="Introdução à Álgebra e Equações",
            description="Sebenta completa sobre equações lineares, quadráticas e sistemas de equações para a 10ª classe.",
            file_url="https://exemplo.com/materiais/10_matematica_algebra.pdf"
        ),
        HighSchoolMaterial(
            grade=10,
            subject="Física",
            title="Cinemática e Movimento Retilíneo",
            description="Resumo teórico e exercícios práticos sobre velocidade, aceleração e queda livre.",
            file_url="https://exemplo.com/materiais/10_fisica_cinematica.pdf"
        ),
        HighSchoolMaterial(
            grade=11,
            subject="Matemática",
            title="Trigonometria e Funções Trigonométricas",
            description="Estudo das razões trigonométricas, ciclo trigonométrico e identidades fundamentais.",
            file_url="https://exemplo.com/materiais/11_matematica_trigonometria.pdf"
        ),
        HighSchoolMaterial(
            grade=11,
            subject="Física",
            title="Leis de Newton e Dinâmica",
            description="Manual prático de Dinâmica, forças de atrito, planos inclinados e forças centrípetas.",
            file_url="https://exemplo.com/materiais/11_fisica_dinamica.pdf"
        ),
        HighSchoolMaterial(
            grade=12,
            subject="Matemática",
            title="Limites e Derivadas",
            description="Preparação intensiva de análise matemática, cálculo de limites notáveis e derivadas.",
            file_url="https://exemplo.com/materiais/12_matematica_limites.pdf"
        ),
        HighSchoolMaterial(
            grade=12,
            subject="Língua Portuguesa",
            title="Guia de Redação e Textos Argumentativos",
            description="Como estruturar ensaios e redações nota máxima para exames nacionais e de acesso.",
            file_url="https://exemplo.com/materiais/12_portugues_redacao.pdf"
        ),
    ]

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(select(HighSchoolMaterial))
        existing = result.scalars().all()
        if not existing:
            print("Adicionando materiais de modelo do Ensino Médio ao banco de dados...")
            session.add_all(materials_data)
            await session.commit()
            print(f"{len(materials_data)} materiais foram inseridos com sucesso!")
        else:
            print("O banco de dados já contém materiais do Ensino Médio.")

if __name__ == "__main__":
    asyncio.run(seed_materials())
