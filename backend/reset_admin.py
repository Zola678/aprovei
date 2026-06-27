import asyncio
import os
import sys

# Adiciona o diretório principal do backend ao path do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.models import User
from app.core.security import get_password_hash

async def reset_admin():
    email = "admin@aprovei.com"
    password = "AdminAprovei2026!"
    hashed_password = get_password_hash(password)

    print("[ADMIN CREATOR]: Conectando ao banco de dados...")
    try:
        async with AsyncSessionLocal() as session:
            # Verifica se o administrador já existe
            query = select(User).where(User.email == email)
            result = await session.execute(query)
            admin_user = result.scalars().first()

            if admin_user:
                admin_user.password_hash = hashed_password
                admin_user.role = "admin"
                print(f"[ADMIN CREATOR] SUCESSO: Usuário admin encontrado. Palavra-passe redefinida.")
            else:
                admin_user = User(
                    email=email,
                    password_hash=hashed_password,
                    role="admin",
                    full_name="Administrador Aprovei",
                    phone="999999999",
                    educational_level="university_access"
                )
                session.add(admin_user)
                print(f"[ADMIN CREATOR] SUCESSO: Novo usuário admin criado.")

            await session.commit()
            print(f"--------------------------------------------------")
            print(f"Credenciais do Administrador:")
            print(f"E-mail: {email}")
            print(f"Palavra-passe: {password}")
            print(f"--------------------------------------------------")
    except Exception as e:
        print(f"[ADMIN CREATOR] ERRO: Falha ao conectar ou salvar no banco de dados. Detalhe: {e}")

if __name__ == "__main__":
    asyncio.run(reset_admin())
