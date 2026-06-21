#!/bin/bash
# Mentoria Conjunta - Ambiente LOCAL (PostgreSQL local)
echo "============================================"
echo "  Mentoria Conjunta - Ambiente LOCAL"
echo "============================================"
echo ""

# Carrega variáveis do .env.local
set -a
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  export "$key"="$value"
done < .env.local
set +a

export NODE_ENV=development
export API_PORT="$PORT"
export VITE_PORT=5020

# Verifica se psql está disponível
if command -v psql &>/dev/null; then
  echo "Verificando banco de dados local..."

  # Cria usuário se não existir
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='mentoria_conjunta_usr'" | grep -q 1
  if [ $? -ne 0 ]; then
    echo "Criando usuário mentoria_conjunta_usr..."
    psql -h localhost -U postgres -c "CREATE USER mentoria_conjunta_usr WITH PASSWORD 'mentoria123';"
  fi

  # Cria banco se não existir
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='mentoria_conjunta_db'" | grep -q 1
  if [ $? -ne 0 ]; then
    echo "Criando banco mentoria_conjunta_db..."
    psql -h localhost -U postgres -c "CREATE DATABASE mentoria_conjunta_db;"
    psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mentoria_conjunta_db TO mentoria_conjunta_usr;"
    psql -h localhost -U postgres -d mentoria_conjunta_db -c "GRANT ALL ON SCHEMA public TO mentoria_conjunta_usr;"
    psql -h localhost -U postgres -d mentoria_conjunta_db -c "GRANT CREATE ON SCHEMA public TO mentoria_conjunta_usr;"
    psql -h localhost -U postgres -d mentoria_conjunta_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mentoria_conjunta_usr;"
    psql -h localhost -U postgres -d mentoria_conjunta_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mentoria_conjunta_usr;"
  fi

  # Aplica schema com drizzle-kit
  echo "Aplicando schema (drizzle-kit push)..."
  pnpm exec drizzle-kit push --force

  # Cria tabela session se não existir
  echo "Verificando tabela session..."
  psql -h localhost -U mentoria_conjunta_usr -d mentoria_conjunta_db -c "
    CREATE TABLE IF NOT EXISTS \"session\" (
      \"sid\" varchar NOT NULL COLLATE \"default\",
      \"sess\" json NOT NULL,
      \"expire\" timestamp(6) NOT NULL,
      CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\")
    );
    CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
  "
else
  echo "[AVISO] psql não encontrado. Instale PostgreSQL com: brew install postgresql@16"
  echo "Pulando configuração do banco local..."
fi

echo ""
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
