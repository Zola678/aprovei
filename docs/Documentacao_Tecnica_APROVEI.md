# APROVEI - Documentação Técnica e Planeamento de Execução

Data: 18 de Junho de 2026
Objetivo: Entrega do MVP da plataforma APROVEI até 30 de Junho de 2026 (Prazo de 12 dias).

## 1. Stack Tecnológica
*   **Backend:** Python (FastAPI).
*   **Frontend:** Next.js (React).
*   **Database:** PostgreSQL.
*   **Infraestrutura:** Docker.

## 2. Estrutura de Entrega e Roadmap (Sprint Intensivo de 12 Dias)
Para viabilizar a entrega até 30 de Junho, focaremos apenas no Core:
*   **Dias 1-3:** Modelagem da BD, Setup de Ambiente e Autenticação (JWT).
*   **Dias 4-8:** Funcionalidade de Banco de Provas (Upload, Catálogo e Visualizador PDF).
*   **Dias 9-10:** Marketplace simplificado (Cadastro de Professores e Listagem).
*   **Dias 11-12:** Testes rápidos, ajustes UI e Deploy inicial (Hosting simples).

## 3. Segurança e Validação
*   **Validação de Formulários:** Pydantic (Backend) e Zod (Frontend).
*   **Acesso à Base de Dados:** ORM (SQLAlchemy) e SQL seguro.
*   **Controle de Acessos:** JWT para sessões e RBAC básico (Aluno/Professor).

## 4. Deploy e Infraestrutura
*   **Deploy:** Simples, usando Docker Compose ou plataforma PaaS (ex: Render/Fly.io) para agilidade.
    
## 5. Possíveis Falhas e Mitigação
*   **Escopo:** Risco alto de não completar tudo. *Mitigação:* Cortar qualquer funcionalidade não essencial (chat, gamificação, IA) para a v1.
*   **Confiabilidade:** Foco apenas em testes funcionais críticos.

---
*Este documento serve como base para a implementação do projeto APROVEI.*