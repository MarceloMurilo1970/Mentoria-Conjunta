#!/bin/bash

# Monitora mudanças no repositório e dispara deploy automaticamente
# Uso via cron (a cada 1 min):
#   * * * * * /caminho/para/Mentoria-Conjunta/monitora-mudancas.sh >> /var/log/monitora-mudancas-mentoria.log 2>&1

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCK_FILE="/tmp/monitora-mudancas-mentoria.lock"
BRANCH="main"

# ─── Lock: só uma execução por vez ───
if [ -f "$LOCK_FILE" ]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null)
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy em andamento (PID $LOCK_PID). Saindo."
    exit 0
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Lock órfão encontrado (PID $LOCK_PID). Removendo."
    rm -f "$LOCK_FILE"
  fi
fi

echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# ─── Verifica mudanças no remote ───
cd "$SCRIPT_DIR"

git fetch origin "$BRANCH" --quiet 2>/dev/null

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sem mudanças. Local=$LOCAL_HASH Remote=$REMOTE_HASH"
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Mudanças detectadas!"
echo "  Local:  $LOCAL_HASH"
echo "  Remote: $REMOTE_HASH"

# ─── Aplica mudanças e faz deploy ───
git pull origin "$BRANCH" --quiet

# ─── Detecta se precisa rebuild da imagem base (node_modules) ───
CHANGED_FILES=$(git diff --name-only "$LOCAL_HASH" "$REMOTE_HASH")
NEEDS_BASE=false

if echo "$CHANGED_FILES" | grep -qE '^(package\.json|package-lock\.json|Dockerfile\.base)$'; then
  NEEDS_BASE=true
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dependências alteradas — rebuild da imagem base necessário"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando deploy..."

if [ "$NEEDS_BASE" = true ]; then
  bash "$SCRIPT_DIR/deploy-ecs.sh" --base
else
  bash "$SCRIPT_DIR/deploy-ecs.sh"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy finalizado."
