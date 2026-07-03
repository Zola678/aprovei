import asyncio
from app.core.lunar import LunarAI
from app.models.models import AIChatMessage

lunar = LunarAI()
print(lunar.run("Oi"))
