#!/bin/bash
# Script de configuração do APROVEI
# Execute uma vez com: bash setup_aprovei.sh
# Este script precisa de sudo para configurar Docker e PostgreSQL

echo "=========================================="
echo "   APROVEI - Script de Configuração"
echo "=========================================="
echo ""

# 1. Adicionar o utilizador ao grupo docker
echo "[1/4] Adicionando utilizador ao grupo Docker..."
sudo usermod -aG docker $USER
echo "✓ Utilizador adicionado ao grupo docker"

# 2. Configurar PostgreSQL (criar utilizador admin)
echo ""
echo "[2/4] Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE USER admin WITH SUPERUSER PASSWORD 'senha_forte_filda';" 2>/dev/null || \
sudo -u postgres psql -c "ALTER USER admin WITH PASSWORD 'senha_forte_filda';" 2>/dev/null
sudo -u postgres psql -c "CREATE DATABASE aprovei OWNER admin;" 2>/dev/null || echo "  (base de dados já existe)"
echo "✓ Base de dados configurada"

# 3. Iniciar os containers Docker
echo ""
echo "[3/4] Iniciando serviços com Docker Compose..."
cd /home/genial/APROVEI/aprovei
sudo docker compose up -d --build
echo "✓ Containers iniciados"

# 4. Aguardar e criar o admin
echo ""
echo "[4/4] Aguardando serviços iniciarem (30s)..."
sleep 30
sudo docker compose exec backend python reset_admin.py 2>/dev/null || \
sudo docker compose exec -T backend python reset_admin.py

echo ""
echo "=========================================="
echo "   ✅ APROVEI CONFIGURADO COM SUCESSO!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Docs API: http://localhost:8000/docs"
echo ""
echo "Credenciais Admin:"
echo "  Email: admin@aprovei.com"
echo "  Senha: AdminAprovei2026!"
echo ""
echo "NOTA: Faça logout e login novamente para"
echo "aplicar as permissões do Docker."
