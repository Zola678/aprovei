import asyncio
from backend.app.core.database import SessionLocal
from backend.app.models.models import User, TeacherProfile
from sqlalchemy.future import select

async def main():
    async with SessionLocal() as db:
        stmt = select(User).where(User.role == 'teacher')
        res = await db.execute(stmt)
        teachers = res.scalars().all()
        for t in teachers:
            print(f"Teacher {t.id} - {t.email}")
            stmt2 = select(TeacherProfile).where(TeacherProfile.user_id == t.id)
            p = (await db.execute(stmt2)).scalars().first()
            if p:
                print(f"  Profile: {p.specialty}, {p.price_per_hour}")
            else:
                print("  No profile")

asyncio.run(main())
