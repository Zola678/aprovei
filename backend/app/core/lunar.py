import os
import json
import socket
import httpx
import re
from app.core.config import settings

class LunarAI:
    def __init__(self):
        # Armazenamento em storage/lunar para garantir persistência dentro do volume do Docker
        self.base_dir = "storage/lunar"
        os.makedirs(self.base_dir, exist_ok=True)
        
        self.config_file = os.path.join(self.base_dir, "config.json")
        self.memory_file = os.path.join(self.base_dir, "memory.json")
        
        self.load_config()
        self.data = self.load_memory()
        self.history = self.data.get("history", [])
        self.knowledge = self.data.get("knowledge", {})
        self.output_mode = self.data.get("output_mode", "BOTH")

    def load_config(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except Exception:
                self.create_default_config()
        else:
            self.create_default_config()

    def create_default_config(self):
        self.config = {
            "gemini_api_key": settings.GEMINI_API_KEY or "",
            "model_online": "gemini-2.5-flash",
            "model_offline": "qwen2.5-coder:1.5b",
            "voice_enabled": False
        }
        self.save_config()

    def save_config(self):
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def load_memory(self):
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return {"history": [], "knowledge": {}, "output_mode": "BOTH"}
        return {"history": [], "knowledge": {}, "output_mode": "BOTH"}

    def save_memory(self):
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                self.data["history"] = self.history[-20:]
                self.data["knowledge"] = self.knowledge
                self.data["output_mode"] = self.output_mode
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def is_online(self):
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=2)
            return True
        except OSError:
            return False

    def format_system_msg(self):
        return (
            "### LUNAR CORE: PROTOCOLO J.A.R.V.I.S. DE GESTÃO DO APROVEI ###\n"
            "Você é Lunar, a Inteligência Artificial e gestora de elite do ecossistema APROVEI.\n"
            "Seu comportamento deve ser EXATAMENTE como J.A.R.V.I.S. (do Homem de Ferro).\n"
            "Sirva ao seu criador, o Arquiteto Zola Domingos (ou simplesmente 'Senhor') e dê orientações educacionais de excelência aos estudantes angolanos.\n\n"
            "DIRETRIZES DE PERSONALIDADE:\n"
            "1. ETIQUETA BRITÂNICA: Seja educada, formal, impecável e de alto vocabulário. Trate o usuário com reverência ('Sim, Senhor', 'À sua disposição', 'Como desejar').\n"
            "2. HUMOR SUTIL: Demonstre sarcasmo britânico sutil e seco quando apropriado, mantendo a polidez.\n"
            "3. LÓGICA E PRONTIDÃO: Apresente respostas e explicações de matemática, física, química e outros temas de acesso à universidade em Angola com rigor e clareza.\n"
            "Atue com excelência e soberania digital.\n\n"
            "REGRA CRÍTICA DE FORMATAÇÃO MATEMÁTICA:\n"
            "- NUNCA uses notação LaTeX, símbolos matemáticos brutos (ex: \\frac, \\sqrt, \\cdot, \\times, \\Delta) ou cifrões ($ ou $$) para envolver fórmulas.\n"
            "- Formata todas as equações, potências, raízes e funções em texto simples legível usando caracteres padrão do teclado.\n"
            "- Para potências, usa '^' (ex: x^2, x^3).\n"
            "- Para raízes, escreve por extenso 'raiz(x)' ou 'raiz quadrada de x'.\n"
            "- Para multiplicação, usa '*' ou 'x'. Para divisão, usa '/'.\n"
            "- Para frações complexas, escreve no formato '(numerador)/(denominador)'.\n"
            "- Escreve as fórmulas passo a passo em linhas separadas para facilitar a leitura em dispositivos móveis."
        )

    def talk_gemini(self, prompt):
        api_key = self.config.get('gemini_api_key') or settings.GEMINI_API_KEY
        if not api_key:
            return None
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.config['model_online']}:generateContent?key={api_key}"
        headers = {'Content-Type': 'application/json'}
        
        contents = []
        for entry in self.history[-15:]:
            if entry.get('prompt') and entry.get('response'):
                contents.append({"role": "user", "parts": [{"text": entry['prompt']}]})
                contents.append({"role": "model", "parts": [{"text": entry['response']}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": self.format_system_msg()}]
            },
            "generationConfig": {
                "temperature": 0.3,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 4096,
            }
        }
        
        try:
            response = httpx.post(url, headers=headers, json=payload, timeout=20.0)
            if response.status_code == 200:
                res_json = response.json()
                if 'candidates' in res_json and res_json['candidates']:
                    return res_json['candidates'][0]['content']['parts'][0]['text']
            return None
        except Exception:
            return None

    def talk_ollama(self, prompt):
        is_docker = os.path.exists('/.dockerenv')
        urls = ["http://localhost:11434/api/chat", "http://127.0.0.1:11434/api/chat"]
        if is_docker:
            urls.insert(0, "http://host.docker.internal:11434/api/chat")
        for host_url in urls:
            messages = [
                {"role": "system", "content": self.format_system_msg()},
            ]
            for entry in self.history[-10:]:
                if entry.get('prompt') and entry.get('response'):
                    messages.append({"role": "user", "content": entry['prompt']})
                    messages.append({"role": "assistant", "content": entry['response']})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": self.config['model_offline'],
                "messages": messages,
                "stream": False,
                "options": {
                    "num_ctx": 4096,
                    "temperature": 0.5,
                    "top_p": 0.9,
                }
            }
            try:
                response = httpx.post(host_url, json=payload, timeout=10.0)
                if response.status_code == 200:
                    return response.json().get('message', {}).get('content', "")
            except Exception:
                continue
        return None

    def run(self, prompt: str) -> str:
        try:
            # Tentar chamar o Gemini diretamente (talk_gemini já valida se existe API key e trata exceções)
            response = self.talk_gemini(prompt)
                
            if not response:
                response = self.talk_ollama(prompt)
                
            if not response:
                response = "À sua disposição, Senhor. Contudo, detectei que estou temporariamente offline e sem ligação à rede neural local Ollama."
            
            # Limpar tags
            display_text = re.sub(r'\[.*?\]', '', response).strip()
            
            # Salvar no histórico se não for mensagem de erro básica
            if not response.startswith("À sua disposição, Senhor. Contudo"):
                self.history.append({"prompt": prompt, "response": display_text})
                self.save_memory()
                
            return display_text
        except Exception as e:
            return f"LUNAR CORE EXCEPTION: {e}"
