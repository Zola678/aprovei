import asyncio
from app.core.database import SessionLocal
from app.models.models import User, AIChatSession, AIChatMessage
from app.api.ai import generate_ai_response

async def main():
    async with SessionLocal() as db:
        # Create dummy user
        user = User(email="test_ai@aprovei.com", hashed_password="pw", educational_level="high_school")
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Create session
        session = AIChatSession(user_id=user.id, title="Test Session")
        db.add(session)
        await db.commit()
        await db.refresh(session)

        # Create message
        msg = AIChatMessage(session_id=session.id, sender="user", content="podemos continuar?")
        db.add(msg)
        await db.commit()

        resp = await generate_ai_response("podemos continuar?", [], "high_school", session.title)
        print("RESPONSE:")
        print(resp)

asyncio.run(main())
