import asyncio
from app.api.ai import generate_ai_response
from app.models.models import AIChatMessage

async def main():
    resp = await generate_ai_response("Oi", [], "high_school")
    print("RESPONSE:")
    print(resp)

asyncio.run(main())
