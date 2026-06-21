#!/bin/bash
# Mentoria Conjunta - Ambiente DEV (servidor remoto)
echo "============================================"
echo "  Mentoria Conjunta - Ambiente DEV"
echo "============================================"
echo ""

# Carrega variáveis do .env-dev.txt
set -a
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  export "$key"="$value"
done < .env-dev.txt
set +a

export NODE_ENV=development
export API_PORT="$PORT"
export VITE_PORT=5020

echo "DATABASE_URL=$DATABASE_URL"
echo ""
echo "API rodando na porta: $API_PORT"
echo "Frontend (Vite) na porta: $VITE_PORT"
echo ""
echo "Acesse: http://localhost:$VITE_PORT"
echo "============================================"
echo ""

# Inicia backend em segundo plano
echo "Iniciando API..."
pnpm exec tsx server/index.ts &
API_PID=$!

# Aguarda backend inicializar
sleep 4

# Inicia frontend em primeiro plano
echo "Iniciando Frontend (Vite)..."
pnpm exec vite --port $VITE_PORT

# Quando o Vite for interrompido (Ctrl+C), mata o backend
kill $API_PID 2>/dev/null
