#!/bin/bash
# Script para iniciar o APROVEI localmente (sem Docker)
# Execute com: bash start_local.sh

echo "=========================================="
echo "   APROVEI - Iniciar Serviços Locais"
echo "=========================================="
echo ""

# Ir para a pasta do backend e iniciar
echo "Iniciando o Backend (Porta 8000)..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend iniciado em background (PID: $BACKEND_PID, logs em backend/backend.log)"

# Ir para a pasta do frontend e iniciar
echo ""
echo "Iniciando o Frontend (Porta 3000)..."
cd "../frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend iniciado em background (PID: $FRONTEND_PID, logs em frontend/frontend.log)"

echo ""
echo "=========================================="
echo "   ✅ SERVIÇOS INICIADOS COM SUCESSO!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Docs API: http://localhost:8000/docs"
echo ""
echo "Para parar os serviços, execute:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Aguardar os processos terminarem
wait $BACKEND_PID $FRONTEND_PID
