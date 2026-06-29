from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import User, AIChatSession, AIChatMessage
from app.api.deps import get_current_user
from app.core.config import settings
import asyncio
import random
import httpx

router = APIRouter()

class AIChatMessageCreate(BaseModel):
    session_id: int
    content: str

class AIChatSessionCreate(BaseModel):
    title: str = "Nova Conversa de Estudos"

class AIChatMessageResponse(BaseModel):
    id: int
    session_id: int
    sender: str
    content: str

    class Config:
        from_attributes = True

class AIChatSessionResponse(BaseModel):
    id: int
    title: str
    
    class Config:
        from_attributes = True

from app.core.lunar import LunarAI

lunar_ai = LunarAI()

async def generate_ai_response(user_input: str, history: List[AIChatMessage], educational_level: str) -> str:
    """
    Gera uma resposta da IA utilizando o motor LUNAR local de forma nativa.
    """
    # 1. Tentar contactar a IA LUNAR nativa
    try:
        prompt_with_context = f"[Contexto de Estudos Aprovei: {educational_level}] {user_input}"
        lunar_resp = await asyncio.to_thread(lunar_ai.run, prompt_with_context)
        # Se for executada com sucesso e não for o aviso offline estático, devolve a resposta
        if lunar_resp and not lunar_resp.startswith("LUNAR CORE EXCEPTION"):
            return lunar_resp
    except Exception as e:
        print(f"Exceção ao chamar a Lunar AI de forma nativa: {e}")

    api_key = settings.GEMINI_API_KEY
    
    if api_key:
        try:
            # 1. Definir a instrução de sistema com base no nível educacional
            level_desc = (
                "Ensino Médio (10ª à 12ª classe, preparando para institutos técnicos como ITEL, IMEL, IPIL, INP e Liceus)" 
                if educational_level == "high_school" 
                else "Acesso Universitário (preparação intensiva para exames da UAN, ISUTIC, UMN, UKB, etc.)"
            )
            
            system_prompt = (
                "Tu és a 'APROVEI IA', o tutor pessoal de inteligência artificial integrado na plataforma APROVEI. "
                "O teu objetivo principal é apoiar estudantes angolanos a alcançarem o sucesso escolar e a entrarem no ensino superior. "
                f"O nível escolar atual deste estudante é: {level_desc}. "
                "Deves responder sempre em português (Angola/Portugal), com um tom motivador, confiante, acolhedor e simples. "
                "Explica teorias e resoluções passo a passo, usando exemplos práticos angolanos sempre que apropriado. "
                "Usa formatação Markdown para destacar fórmulas (ex: F = m * a) e termos chave, tornando a leitura fluida e interativa. "
                "Foca a resposta no contexto curricular angolano."
            )
            
            # 2. Formatar o histórico para o formato aceitado pela API do Gemini
            contents = []
            for msg in history:
                role = "user" if msg.sender == "user" else "model"
                # O Gemini exige que a primeira mensagem seja do 'user'.
                # Ignoramos mensagens de 'model' (ai) no início do histórico.
                if not contents and role == "model":
                    continue
                
                # Se a última mensagem adicionada tiver o mesmo remetente (role), concatena o conteúdo
                if contents and contents[-1]["role"] == role:
                    contents[-1]["parts"][0]["text"] += "\n" + msg.content
                else:
                    contents.append({
                        "role": role,
                        "parts": [{"text": msg.content}]
                    })
            
            # Adicionar a mensagem atual do utilizador
            if contents and contents[-1]["role"] == "user":
                contents[-1]["parts"][0]["text"] += "\n" + user_input
            else:
                contents.append({
                    "role": "user",
                    "parts": [{"text": user_input}]
                })
            
            # 3. Fazer a chamada HTTP assíncrona
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": contents,
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=12.0)
                
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                print(f"Erro na API do Gemini: Status {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Exceção ao ligar à API do Gemini: {str(e)}")
            
    # --- MOTOR DE RESPOSTA LOCAL DE FALLBACK (Altamente robusto e contextualizado) ---
    lower_input = user_input.lower()
    
    if "matemática" in lower_input or "bhaskara" in lower_input or "equação" in lower_input or "limite" in lower_input or "derivada" in lower_input:
        if educational_level == "high_school":
            return (
                "Com certeza! No Ensino Médio angolano, a Álgebra é a base de tudo. "
                "Para resolver uma equação do 2º grau do tipo ax² + bx + c = 0, aplicamos a fórmula resolvente (Bhaskara):\n\n"
                "**x = (-b ± √(Δ)) / 2a**, onde o discriminante é **Δ = b² - 4ac**.\n\n"
                "Se o Δ > 0, temos duas soluções reais distintas. Se Δ = 0, uma única solução. Se Δ < 0, não existem soluções reais.\n\n"
                "Gostarias de resolver um exercício prático da 10ª ou 11ª classe para treinares?"
            )
        else:
            return (
                "Excelente pergunta para o Acesso Universitário! Nos exames de engenharia da UAN e ISUTIC, limites e derivadas são cobrados com frequência. "
                "Por exemplo, para limites com indeterminação do tipo **1^∞**, aplicamos a fórmula clássica:\n\n"
                "**lim (f(x))^g(x) = e^(lim (f(x) - 1) * g(x))**.\n\n"
                "Isso simplifica bastante limites complexos. Gostarias de ver um exemplo real que caiu na prova de matemática da UAN?"
            )
            
    if "física" in lower_input or "newton" in lower_input or "força" in lower_input or "velocidade" in lower_input:
        if educational_level == "high_school":
            return (
                "Claro! Na Física do Ensino Médio, a Dinâmica é rainha. "
                "A **Segunda Lei de Newton** diz que a força resultante aplicada num corpo é igual ao produto da sua massa pela aceleração:\n\n"
                "**F = m * a**\n\n"
                "Nas disciplinas técnicas do ITEL e IPIL, estudamos isto em polias e planos com atrito. Queres fazer um exercício simples sobre forças?"
            )
        else:
            return (
                "Com certeza! Nos exames de admissão universitários, a Física cobra decomposição de forças em planos inclinados. "
                "Num plano inclinado com ângulo θ, decompomos o peso em:\n\n"
                "*   **Px = P * sen(θ)** (força que puxa para baixo)\n"
                "*   **Py = P * cos(θ)** (força contra a superfície)\n"
                "*   A força de atrito será: **Fat = μ * Py = μ * P * cos(θ)**.\n\n"
                "Queres resolver uma questão típica de exame de acesso sobre dinâmica?"
            )

    if "itel" in lower_input or "imel" in lower_input or "ipil" in lower_input or "ensino médio" in lower_input:
        return (
            "Os institutos médios em Angola (como o ITEL para TI, Telecomunicações e Eletrónica, o IMEL para Economia/Finanças e o IPIL para Indústria) "
            "têm exigências académicas altas. Aqui na APROVEI, organizamos materiais focados exatamente nesses currículos para te ajudar a ter notas de destaque!\n\n"
            "Em que classe estás (10ª, 11ª, 12ª) e em qual disciplina sentes mais dificuldade atualmente?"
        )
        
    if "uan" in lower_input or "isutic" in lower_input or "umn" in lower_input or "acesso" in lower_input:
        return (
            "Foco extraordinário! Entrar na Universidade Agostinho Neto (UAN), no ISUTIC ou na UMN exige uma preparação sólida de exames de anos anteriores. "
            "Os exames costumam ter rasteiras em Matemática e Física.\n\n"
            "Qual é o teu curso de eleição para que eu te diga em quais temas te deves focar mais a partir de hoje?"
        )

    fallbacks = [
        (
            "Essa é uma ótima questão! Como a tua APROVEI IA de suporte académico, estou aqui para tornar o estudo mais simples. "
            "Podes dar-me um exemplo prático ou detalhar o teu exercício para o resolvermos passo a passo?"
        ),
        (
            "Perfeito! Lembra-te de que a prática leva à aprovação. "
            "Queres que eu faça um resumo conceitual rápido deste tema ou prefere que eu formule um mini-teste de 3 perguntas para testares os teus conhecimentos?"
        ),
        (
            "Interessante! Este tema é muito comum no programa oficial de Angola. "
            "Vamos estruturar os pontos mais importantes em tópicos para facilitar a tua revisão. Por onde queres começar?"
        )
    ]
    return random.choice(fallbacks)


@router.post("/sessions", response_model=AIChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_data: AIChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria uma nova sessão de chat com a IA"""
    new_session = AIChatSession(user_id=current_user.id, title=session_data.title)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    # Mensagem de boas-vindas da IA baseada no nível educacional
    level_welcome = (
        "Olá! Sou a APROVEI IA, a tua explicadora particular para o Ensino Médio (10ª à 12ª classe). Como te posso ajudar a dominar a matéria hoje?"
        if current_user.educational_level == "high_school"
        else "Olá! Sou a APROVEI IA, o teu tutor particular focado nos Exames de Acesso Universitários. Qual é a disciplina que vamos estudar hoje?"
    )
    
    welcome_msg = AIChatMessage(
        session_id=new_session.id,
        sender="ai",
        content=level_welcome
    )
    db.add(welcome_msg)
    await db.commit()
    
    return new_session

@router.get("/sessions", response_model=List[AIChatSessionResponse])
async def list_chat_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista as sessões de chat do utilizador"""
    query = select(AIChatSession).where(AIChatSession.user_id == current_user.id).order_by(AIChatSession.created_at.desc())
    result = await db.execute(query)
    sessions = result.scalars().all()
    return sessions

@router.post("/messages", response_model=AIChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    msg_data: AIChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Envia uma mensagem do utilizador e obtém a resposta real da IA"""
    # 1. Verificar se a sessão pertence ao utilizador
    query = select(AIChatSession).where(AIChatSession.id == msg_data.session_id, AIChatSession.user_id == current_user.id)
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada.")
        
    # 2. Guardar a mensagem do utilizador na base de dados
    user_msg = AIChatMessage(session_id=session.id, sender="user", content=msg_data.content)
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)
    
    # 3. Buscar o histórico de mensagens desta sessão para servir de contexto à IA
    history_query = select(AIChatMessage).where(AIChatMessage.session_id == session.id).order_by(AIChatMessage.created_at.asc())
    history_result = await db.execute(history_query)
    history = history_result.scalars().all()[:-1] # Excluir a última mensagem que acabamos de salvar para passá-la como 'user_input'
    
    # 4. Chamar a IA (Gemini ou Fallback) de forma assíncrona
    ai_response_content = await generate_ai_response(
        user_input=msg_data.content,
        history=history,
        educational_level=current_user.educational_level
    )
    
    # 5. Guardar e retornar a resposta da IA
    ai_msg = AIChatMessage(session_id=session.id, sender="ai", content=ai_response_content)
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)
    
    return ai_msg

@router.get("/sessions/{session_id}/messages", response_model=List[AIChatMessageResponse])
async def get_session_messages(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém todas as mensagens de uma sessão específica"""
    query = select(AIChatSession).where(AIChatSession.id == session_id, AIChatSession.user_id == current_user.id)
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
        
    messages_query = select(AIChatMessage).where(AIChatMessage.session_id == session_id).order_by(AIChatMessage.created_at.asc())
    messages_result = await db.execute(messages_query)
    messages = messages_result.scalars().all()
    
    return messages
