from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import User, AIChatSession, AIChatMessage, Exam as ExamModel
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.limiter import limiter
import asyncio
import random
import httpx
import os
import shutil
import uuid
import base64
import mimetypes

router = APIRouter()

class AIChatMessageCreate(BaseModel):
    session_id: int
    content: str
    file_url: str | None = None
    file_url: str | None = None

class AIChatSessionCreate(BaseModel):
    title: str = "Nova Conversa de Estudos"

class ExamChallengeCreate(BaseModel):
    exam_key: str

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

async def generate_ai_response(
    user_input: str,
    history: List[AIChatMessage],
    educational_level: str,
    session_title: str = "",
    answer_key: str | None = None,
    questions_text: str | None = None,
    file_url: str | None = None
) -> str:
    """
    Gera uma resposta da IA utilizando o motor LUNAR local de forma nativa.
    """
    is_challenge = session_title.startswith("Desafio:")
    
    # 1. Tentar contactar a IA LUNAR nativa
    try:
        prompt_with_context = f"[Contexto de Estudos Aprovei: {educational_level}] [Desafio: {session_title if is_challenge else 'Nenhum'}] [Gabarito: {answer_key or 'Nenhum'}] {user_input}"
        lunar_resp = await asyncio.to_thread(lunar_ai.run, prompt_with_context)
        # Se for executada com sucesso e não for o aviso offline estático, devolve a resposta
        if lunar_resp and not lunar_resp.startswith("LUNAR CORE EXCEPTION") and not lunar_resp.startswith("À sua disposição, Senhor. Contudo"):
            return lunar_resp
    except Exception as e:
        print(f"Exceção ao chamar a Lunar AI de forma nativa: {e}")

    api_key = settings.GEMINI_API_KEY
    
    if api_key:
        try:
            # 1. Definir a instrução de sistema com base no nível educacional ou modo desafio
            if is_challenge:
                system_prompt = (
                    "Tu és a 'APROVEI IA' operando em MODO DESAFIO/SIMULADO de exames em Angola. "
                    f"O estudante está a realizar um simulado focado no Exame: {session_title}. "
                    "O teu papel é ser o examinador oficial deste teste. "
                )
                if questions_text:
                    system_prompt += f"\nAs perguntas oficiais deste exame são:\n{questions_text}\n"
                else:
                    system_prompt += "\nComo não temos as perguntas originais estruturadas, deves propor perguntas de escolha múltipla ou desenvolvimento realistas que simulem exatamente este exame.\n"
                
                if answer_key:
                    system_prompt += f"\nO gabarito oficial / chave de resposta é:\n{answer_key}\nUsa este gabarito para avaliar as respostas do aluno de forma estrita.\n"
                
                system_prompt += (
                    "Deves propor uma pergunta de cada vez e aguardar pela resposta do estudante. "
                    "Quando o estudante responder, avalia a resposta dele de forma clara com base na chave da prova, explica a resolução de forma pedagógica (mostrando a fórmula e os passos se ele errar), e depois apresenta o próximo desafio. "
                    "Mantenha um tom motivador e responda em português de Angola."
                )
            else:
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
            
            # Adicionar regra crítica de formatação matemática
            math_formatting_rule = (
                "\n\n[REGRA CRÍTICA DE FORMATAÇÃO MATEMÁTICA]\n"
                "- NUNCA uses notação LaTeX, símbolos matemáticos brutos (ex: \\frac, \\sqrt, \\cdot, \\times, \\Delta) ou cifrões ($ ou $$) para envolver fórmulas.\n"
                "- Formata todas as equações, potências, raízes e funções em texto simples legível usando caracteres padrão do teclado.\n"
                "- Para potências, usa '^' (ex: x^2, x^3).\n"
                "- Para raízes, escreve por extenso 'raiz(x)' ou 'raiz quadrada de x'.\n"
                "- Para multiplicação, usa '*' ou 'x'. Para divisão, usa '/'.\n"
                "- Para frações complexas, escreve no formato '(numerador)/(denominador)'.\n"
                "- Escreve as fórmulas passo a passo em linhas separadas para facilitar a leitura em dispositivos móveis."
            )
            system_prompt += math_formatting_rule

            # 2. Formatar o histórico para o formato aceitado pela API do Gemini
            import re
            contents = []
            for msg in history:
                role = "user" if msg.sender == "user" else "model"
                # O Gemini exige que a primeira mensagem seja do 'user'.
                # Ignoramos mensagens de 'model' (ai) no início do histórico.
                if not contents and role == "model":
                    continue
                
                # Limpar a marcação de arquivo para o histórico da IA não ter raw URLs
                clean_msg_content = re.sub(r'\[FILE:[^\]]+\]', '[Ficheiro Anexado]', msg.content)
                
                # Se a última mensagem adicionada tiver o mesmo remetente (role), concatena o conteúdo
                if contents and contents[-1]["role"] == role:
                    contents[-1]["parts"][0]["text"] += "\n" + clean_msg_content
                else:
                    contents.append({
                        "role": role,
                        "parts": [{"text": clean_msg_content}]
                    })
            
            # 2.5 Processar anexo de ficheiro da mensagem atual
            file_part = None
            if file_url:
                local_path = file_url.replace("/storage/", "storage/").split("?")[0]
                if local_path.startswith("/"):
                    local_path = local_path[1:]
                
                if os.path.exists(local_path):
                    try:
                        with open(local_path, "rb") as f:
                            file_data = f.read()
                        encoded_data = base64.b64encode(file_data).decode("utf-8")
                        mime_type, _ = mimetypes.guess_type(local_path)
                        if not mime_type:
                            if local_path.endswith(".pdf"):
                                mime_type = "application/pdf"
                            else:
                                mime_type = "application/octet-stream"
                        
                        file_part = {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": encoded_data
                            }
                        }
                    except Exception as e:
                        print(f"Erro ao ler anexo para a IA: {e}")

            # Adicionar a mensagem atual do utilizador
            user_parts = []
            if file_part:
                user_parts.append(file_part)
            user_parts.append({"text": user_input})

            if contents and contents[-1]["role"] == "user":
                contents[-1]["parts"].extend(user_parts)
            else:
                contents.append({
                    "role": "user",
                    "parts": user_parts
                })
            
            # 3. Fazer a chamada HTTP assíncrona
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": contents,
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=30.0)
                
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                error_msg = f"Erro na API do Gemini: {response.status_code} - {response.text}"
                print(error_msg)
                return f"Lamento, mas encontrei um erro ao conectar ao servidor da IA na nuvem. Detalhe técnico: {response.status_code}. Se estiver no Railway, verifique se a GEMINI_API_KEY está correta e se a região do servidor tem suporte para a API da Google."
        except Exception as e:
            error_msg = f"Exceção ao ligar à API do Gemini: {str(e)}"
            print(error_msg)
            return "Desculpe, ocorreu uma falha de conexão interna ao tentar contactar o motor de inteligência artificial. Por favor, tente novamente em instantes."
            
    else:
        return "A chave da API Gemini (GEMINI_API_KEY) não foi encontrada nas variáveis de ambiente do Railway. Por favor, configure-a no painel do Railway e reinicie o servidor para que eu possa responder às suas perguntas!"
            
    # --- MOTOR DE RESPOSTA LOCAL DE FALLBACK (Altamente robusto e contextualizado) ---
    if is_challenge:
        import re
        
        # Parse questions
        questions = []
        if questions_text:
            parts = re.split(r'(?i)\n*(?=quest(?:ã|a)o\s*\d+[:\s\-])', questions_text)
            for p in parts:
                p_strip = p.strip()
                if p_strip:
                    questions.append(p_strip)
        
        if not questions and questions_text:
            questions = [q.strip() for q in questions_text.split("\n\n") if q.strip()]
            
        if not questions:
            questions = [
                "Questão 1: Se f(x) = x^2 - 4x + 3, qual é o valor mínimo de f(x)?\nA) -1\nB) 0\nC) 1\nD) 3",
                "Questão 2: Qual é o limite de (sen(5x))/x quando x tende a 0?\nA) 0\nB) 1\nC) 5\nD) Infinito",
                "Questão 3: Resolva a equação logarítmica log2(x) + log2(x-2) = 3. Qual é o valor de x?\nA) 4\nB) 2\nC) 8\nD) 6",
                "Questão 4: Uma progressão aritmética (PA) tem o primeiro termo a1 = 3 e a razão r = 4. Qual é o décimo termo a10?\nA) 39\nB) 43\nC) 35\nD) 41"
            ]
            
        # Parse answer key
        key_dict = {}
        if answer_key:
            pairs = re.findall(r'(\d+)\s*[-:]\s*([A-D|a-d])', answer_key)
            for q_num, ans in pairs:
                key_dict[int(q_num)] = ans.upper()
                
        if not key_dict:
            key_dict = {1: 'A', 2: 'C', 3: 'A', 4: 'A'}
            
        user_history = [m for m in history if m.sender == "user"]
        total_user_inputs = len(user_history) + 1
        
        def check_answer(u_ans: str, c_ans: str) -> bool:
            clean_ans = u_ans.strip().upper()
            if clean_ans == c_ans:
                return True
            letters = re.findall(r'\b([A-D])\b', clean_ans)
            if letters and letters[0] == c_ans:
                return True
            if clean_ans.startswith(c_ans):
                return True
            return False

        if total_user_inputs == 1:
            return (
                f"Excelente! Iniciamos o **MODO DESAFIO** interativo da prova.\n\n"
                f"Aqui está o teu primeiro desafio:\n\n"
                f"{questions[0]}\n\n"
                f"Responda com a letra da opção que consideras correta."
            )
            
        prev_question_idx = total_user_inputs - 2
        
        if prev_question_idx < len(questions):
            q_num = prev_question_idx + 1
            correct_ans = key_dict.get(q_num, 'A')
            is_correct = check_answer(user_input, correct_ans)
            
            feedback = ""
            if is_correct:
                feedback = f"✅ **Correto!** A tua resposta para a Questão {q_num} está certíssima. Parabéns!\n\n"
            else:
                feedback = f"❌ **Incorreto.** Para a Questão {q_num}, a opção correta era a **{correct_ans}**.\n\n"
                
            next_question_idx = prev_question_idx + 1
            if next_question_idx < len(questions):
                return (
                    f"{feedback}"
                    f"**Próximo Desafio (Questão {next_question_idx + 1}):**\n\n"
                    f"{questions[next_question_idx]}\n\n"
                    f"Qual é a tua resposta?"
                )
            else:
                correct_count = 0
                all_inputs = [m.content for m in user_history] + [user_input]
                for idx, ans in enumerate(all_inputs[1:]):
                    c_num = idx + 1
                    c_ans = key_dict.get(c_num, 'A')
                    if check_answer(ans, c_ans):
                        correct_count += 1
                        
                percentage = int((correct_count / len(questions)) * 100)
                
                return (
                    f"{feedback}"
                    f"🏆 **Desafio Concluído!** 🎉\n\n"
                    f"A tua pontuação final é: **{correct_count} / {len(questions)}** acertos (**{percentage}%**).\n\n"
                    f"{'Excelente desempenho! Estás totalmente preparado para os exames! ⭐' if percentage >= 75 else 'Bom esforço! Continua a estudar e tenta novamente para melhorar a tua pontuação.'}\n\n"
                    f"Podes iniciar um novo desafio com outra chave de prova ou voltar para o menu principal de estudos."
                )

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
                "A **Segunda Lei de Newton** diz que a força resultant aplicada num corpo é igual ao produto da sua massa pela aceleração:\n\n"
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
@limiter.limit("15/minute")
async def create_chat_session(
    request: Request,
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

@router.post("/upload")
@limiter.limit("10/minute")
async def upload_chat_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Permite ao estudante carregar ficheiros (PDF, TXT ou Imagens) para a IA ensinar a resolver"""
    # 1. Validar extensão
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"}
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Extensão não permitida. Use PDF, TXT ou Imagens (PNG, JPG, WEBP).")
        
    # 2. Validar tamanho (máx 10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="O arquivo é grande demais. Máximo 10MB.")
        
    # 3. Guardar o ficheiro
    upload_dir = "storage/ai_uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/storage/ai_uploads/{file_name}"
    return {"file_url": file_url, "filename": file.filename}

@router.post("/messages", response_model=AIChatMessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def send_message(
    request: Request,
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
        
    # 2. Guardar a mensagem do utilizador na base de dados (com anexo)
    db_content = msg_data.content
    if msg_data.file_url:
        db_content = f"[FILE:{msg_data.file_url}] {msg_data.content}"
        
    user_msg = AIChatMessage(session_id=session.id, sender="user", content=db_content)
    db.add(user_msg)
    await db.commit()
    await db.refresh(user_msg)
    
    # 3. Buscar o histórico de mensagens desta sessão para servir de contexto à IA
    history_query = select(AIChatMessage).where(AIChatMessage.session_id == session.id).order_by(AIChatMessage.created_at.asc())
    history_result = await db.execute(history_query)
    history = history_result.scalars().all()[:-1] # Excluir a última mensagem que acabamos de salvar
    
    # 3.5 Buscar informações da prova se for uma sessão de desafio
    answer_key = None
    questions_text = None
    if session.exam_id:
        exam_query = select(ExamModel).where(ExamModel.id == session.exam_id)
        exam_res = await db.execute(exam_query)
        exam = exam_res.scalars().first()
        if exam:
            answer_key = exam.answer_key
            questions_text = exam.questions_text
 
    # 4. Chamar a IA (Gemini ou Fallback) de forma assíncrona
    ai_response_content = await generate_ai_response(
        user_input=msg_data.content,
        history=history,
        educational_level=current_user.educational_level,
        session_title=session.title,
        answer_key=answer_key,
        questions_text=questions_text,
        file_url=msg_data.file_url
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

@router.post("/sessions/exam-challenge", response_model=AIChatSessionResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def create_exam_challenge_session(
    request: Request,
    challenge_data: ExamChallengeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria uma nova sessão de chat focada num desafio de prova (exam key)"""
    exam_key = challenge_data.exam_key
    
    # 1. Procurar a prova correspondente à chave
    parts = exam_key.upper().split("-")
    exam = None
    
    # Tenta procurar por ID se for número
    if exam_key.isdigit():
        query = select(ExamModel).where(ExamModel.id == int(exam_key))
        res = await db.execute(query)
        exam = res.scalars().first()
        
    if not exam and len(parts) >= 3:
        univ = parts[0]
        subj_prefix = parts[1]
        year_str = parts[2]
        # Filtrar por universidade e ano
        query = select(ExamModel).where(
            ExamModel.university == univ,
            ExamModel.year == int(year_str) if year_str.isdigit() else ExamModel.year
        )
        res = await db.execute(query)
        exams = res.scalars().all()
        # Filtrar por assunto
        for e in exams:
            if e.subject.upper().startswith(subj_prefix) or subj_prefix in e.subject.upper():
                exam = e
                break
                
    if not exam:
        # Busca genérica
        query = select(ExamModel).where(
            (ExamModel.university.ilike(f"%{exam_key}%")) | 
            (ExamModel.subject.ilike(f"%{exam_key}%"))
        )
        res = await db.execute(query)
        exam = res.scalars().first()
        
    if not exam:
        raise HTTPException(
            status_code=404, 
            detail=f"Não encontramos nenhuma prova correspondente à chave '{exam_key}'. Verifica a chave e tenta novamente."
        )
        
    # 2. Criar a sessão com título especial
    title = f"Desafio: {exam.university} - {exam.subject} ({exam.year})"
    new_session = AIChatSession(user_id=current_user.id, title=title, exam_id=exam.id)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    # 3. Criar mensagem de boas-vindas do examinador
    welcome_text = (
        f"Olá! Ativei o **MODO DESAFIO** para a prova **{exam.university} - {exam.subject} ({exam.year})**.\n\n"
        f"Esta prova de **{exam.subject}** foi aplicada no ano de **{exam.year}**. "
        "Vou avaliar os teus conhecimentos com um simulado interativo de perguntas. "
        "Apresentarei uma questão de cada vez e darei feedback após cada resposta.\n\n"
        "Estás pronto para começar? Responde 'Sim' ou 'Começar'!"
    )
    
    welcome_msg = AIChatMessage(
        session_id=new_session.id,
        sender="ai",
        content=welcome_text
    )
    db.add(welcome_msg)
    await db.commit()
    
    return new_session
