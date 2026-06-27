# 🎓 APROVEI - Plataforma de Suporte Académico para Estudantes Angolanos

Plataforma completa de suporte para estudantes angolanos que pretendem ingressar no Ensino Superior (exames de acesso à universidade).

## 📝 Histórico de Alterações (Changelog - Junho 2026)

Toda a plataforma foi refinada e bugs críticos foram corrigidos no Backend, Docker Compose e Frontend.

### 🎨 Frontend & Design System (Melhorias e Inovações)
* **Design e Margens Otimizadas:** Adaptamos a Landing Page seguindo as proporções e margens fluidas do site de referência [PEA](https://pea-journey-experience.vercel.app/). Passamos a usar containers `max-w-7xl mx-auto px-6 md:px-8` para melhor aproveitamento do espaço.
* **Slideshow no Hero Background:** Implementamos uma rotação cíclica periódica (a cada 6 segundos) com transições suaves usando as **imagens reais de estudantes angolanos** (da pasta `/public`), em vez de ilustrações ou fundos planos.
* **Inovação - Simulador de Admissibilidade Inteligente:** Criamos um widget interativo flutuante (card de vidro com sliders e seletores) diretamente na Hero Section. O estudante pode simular a sua probabilidade de admissão nas principais universidades (UAN, ISUTIC, UMN) por curso, recebendo dicas e médias históricas personalizadas.
* **Ecosystem e Roadmap:** Refinamos a exibição orbital dos módulos e a timeline em linha guia de 6 passos.

### 🛠️ Backend, Correção de Bugs e Docker
* **Portas Docker Corrigidas:** Ajustamos o Dockerfile do frontend para expor a porta `3000` (porta padrão do Next.js), eliminando a colisão de portas com a antiga configuração `5173`.
* **Dockerfile Sintaxe:** Corrigimos um erro de concatenação e duplicação no Dockerfile do backend.
* **Montagem de Estáticos (/storage):** Adicionamos a montagem de `StaticFiles` no FastAPI (`app.mount("/storage", ...)`). Agora, os ficheiros de provas e materiais PDF guardados localmente são servidos corretamente ao cliente (resolvendo o erro **404 Not Found**).
* **Correção no Histórico de Chat da IA:** Corrigimos o conversor de histórico no `generate_ai_response` para ignorar mensagens iniciais de `model` (boas-vindas da IA), garantindo que a conversa enviada para a API do Gemini sempre inicie com uma mensagem `user` (evitando o erro **400 Bad Request** da API).

## 🚀 Como Iniciar (Setup Rápido)

A plataforma está totalmente configurada para ser executada localmente utilizando o **Docker Compose**, que inicia automaticamente o banco de dados PostgreSQL, a API FastAPI (backend) e a aplicação Next.js (frontend).

### Pré-requisitos
* Ter o [Docker](https://docs.docker.com/get-docker/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados na sua máquina.

### Executar a Aplicação

1. Aceda ao diretório raiz do projeto:
   ```bash
   cd APROVEI
   ```

2. Execute o comando para construir e iniciar os contentores:
   ```bash
   docker-compose up --build
   ```

3. Aceda aos serviços através dos links:
   * **Frontend App:** [http://localhost:3000](http://localhost:3000)
   * **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Health Check da API:** [http://localhost:8000/health](http://localhost:8000/health)

### 🔑 Credenciais do Administrador (Padrão)

Para aceder ao painel administrativo e gerir materiais, professores e simulados, podes usar as seguintes credenciais padrão geradas pelo script de seeding:
* **E-mail:** `admin@aprovei.com`
* **Palavra-passe:** `AdminAprovei2026!`

Se precisares de restaurar ou criar esta conta de administrador a qualquer momento com os contentores Docker ativos, basta executar:
```bash
sudo docker exec -it aprovei_backend python /app/reset_admin.py
```

### 🤖 Integração com a IA LUNAR Local

A plataforma APROVEI possui integração nativa com o agente inteligente **LUNAR AI** que corre no computador local.
Para ativar a integração:
1. Certifica-te de que a LUNAR está a correr na porta `5000`:
   ```bash
   python3 /home/genial/Lunar/lunar_bridge.py
   ```
2. Inicia o Docker do APROVEI. O backend irá encaminhar de forma inteligente todos os pedidos de chat da plataforma para a LUNAR AI via `host.docker.internal:5000`.
3. Caso a LUNAR esteja desligada, o APROVEI utilizará automaticamente a API oficial do Gemini (se configurada no `.env` do backend) ou o motor de fallback local.

---

## 📁 Estrutura do Projeto

* **`backend/`**: API RESTful desenvolvida em **Python (FastAPI)**.
  * `app/main.py`: Ponto de entrada, configuração do middleware CORS e criação automática de tabelas do DB na inicialização.
  * `app/api/`: Rotas da aplicação (autenticação JWT, exames, marketplace de explicadores, fórum da comunidade e planeador de estudos).
  * `app/models/`: Modelos de dados do SQLAlchemy (PostgreSQL).
  * `app/schemas/`: Esquemas de validação de dados com Pydantic.
  * `app/core/`: Limiter de requisições, segurança JWT e ligação ao banco de dados.
* **`frontend/`**: Aplicação Web cliente desenvolvida em **Next.js (React)** com estilos dinâmicos e Tailwind CSS.
  * `src/app/page.tsx`: Página inicial interativa com apresentação do projeto.
  * `src/app/auth/`: Páginas funcionais de registo e l
Cores sugeridas (aproximadas do design):
🟣 Roxo principal: #3B0A57ogin de utilizadores com persistência JWT em cache.
  * `src/app/exams/`: Banco de provas e resoluções com filtros dinâmicos de pesquisa.
  * `src/app/teachers/`: Marketplace para contratar explicadores com link direto para o WhatsApp.
  * `src/app/forum/`: Fórum da comunidade com perguntas, comentários e curtidas.
  * `src/app/study/`: Ferramentas integradas de estudo (Cronómetro Pomodoro interativo com confetti, Planeador de estudos conectado à BD e Flashcards académicos).
  * `src/app/preparatorio/`: Detalhes de turmas digitais e presenciais nas províncias.
  * `src/app/dashboard/`: Painel geral com status das tarefas, recomendações de livros e videoaulas do YouTube.
* **`docs/`**: Documentação do projeto, roadmap estratégico e plano de negócio detalhado.

---
## Paletas de cor
Cores sugeridas (aproximadas do design):
🟣 Roxo principal: #3B0A57
🟠 Laranja principal: #FF6A00
🟠 Laranja claro/gradiente: #FF8A3D
⚪ Branco: #FFFFFF
⚫ Cinza texto: #333333
🟣 Roxo secundário: #5A2B82

## 2. 🔤 Tipografia (fontes)

O estilo atual sugere uma identidade bold, educativa e digital.
Títulos: Montserrat ExtraBold / Poppins Bold
Texto: Poppins Regular / Inter
Destaques (preço e chamadas): Montserrat Black

## 3 Estilo de marca (branding)

A identidade do APROVEI é:

🎓 Educacional infantil e juvenil
🏠 Aulas ao domicílio (proximidade e conforto)
📈 Foco em performance escolar
💡 “Mais que explicações, formamos campeões”
Tom da marca:

motivador
simples
confiante
familiar
## Adicionais sobre a marca
“Educação moderna, energética e confiável, com forte contraste visual roxo + laranja e comunicação direta focada em resultados escolares.” design profisional e moderno baseado na PEA (https://pea-edu.com/)
## 🛡️ Segurança & Desempenho

* **Autenticação Segura:** Proteção por senhas com hash criptográfico (bcrypt) e sessões por JSON Web Tokens (JWT) seguros.
* **Rate Limiting:** Defesa contra ataques de força bruta no login e registo através de limites controlados por IP (SlowAPI).
* **Validação Rígida:** Proteção contra injeções e dados malformados com Pydantic (backend) e Zod.
* **Otimização de Conexões:** Engine assíncrono SQLAlchemy para PostgreSQL com pool pré-alocado de conexões para alto volume de utilizadores simultâneos.
