import asyncio
from httpx import AsyncClient
from backend.app.main import app

async def main():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # We need a token. We can override the dependency.
        from backend.app.api.deps import get_current_user
        from backend.app.models.models import User
        
        # Override dependency
        async def mock_get_current_user():
            # Get a real user from DB to have an ID
            from sqlalchemy.ext.asyncio import AsyncSession
            from backend.app.core.database import SessionLocal
            from sqlalchemy.future import select
            
            async with SessionLocal() as db:
                stmt = select(User).where(User.role == "teacher").limit(1)
                res = await db.execute(stmt)
                return res.scalars().first()
                
        app.dependency_overrides[get_current_user] = mock_get_current_user
        
        # Now try PUT /api/v1/auth/me
        payload = {
            "full_name": "Test Prof Updated",
            "specialty": "Math",
            "bio": "I teach math"
        }
        res = await client.put("/api/v1/auth/me", json=payload)
        print("PUT /me:", res.status_code, res.json())

asyncio.run(main())
