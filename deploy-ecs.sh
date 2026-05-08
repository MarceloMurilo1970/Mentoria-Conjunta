#!/bin/bash

# Script de Deploy para ECS mentoria (cluster m2d-servicos)
# Suporta imagem base (node_modules) e imagem da aplicação
#
# Uso:
#   ./deploy-ecs.sh              # Deploy da aplicação (default)
#   ./deploy-ecs.sh --base       # Rebuild da imagem base (node_modules)
#   ./deploy-ecs.sh --base-only  # Rebuild da imagem base sem deploy
#   ./deploy-ecs.sh v1.2.3       # Deploy com tag específica
#   ./deploy-ecs.sh --test-email # Testa envio de email sem fazer deploy

set -e

# ─── Configurações ───
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="127259105548"
ECR_APP_REPO="ecr_mentoria"
ECR_BASE_REPO="ecr_mentoria_base"
ECR_APP_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_APP_REPO}"
ECR_BASE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BASE_REPO}"
ECS_CLUSTER="m2d-servicos"
ECS_SERVICE="mentoria"

# Cluster roda em Graviton (ARM64) — pinamos a plataforma pra evitar surpresa
# se alguém rodar em host x86_64.
DOCKER_PLATFORM="linux/arm64"

BUILD_BASE=false
BASE_ONLY=false
TEST_EMAIL=false
IMAGE_TAG="latest"

# ─── WhatsApp Notificação ───
WHATSAPP_API="http://localhost:8080/api/send"
WHATSAPP_DEVICE_ID=1
NOTIFY_NUMBERS=("5527998495692" "5511987890001")
NOTIFY_NAMES=("Deivid" "Marcelo")

# ─── Email Notificação (SMTP) ───
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="AKIA3CLXMM33FW5NGI5A"
SMTP_PASS="BCKM62t0UXYe3AEN8gLqT6GiYzpgqrg8qq0e369+xL5n"
SMTP_FROM="noreply@boardmanager.com.br"
SMTP_FROM_NAME="Mentoria Marcelo Murilo"
NOTIFY_EMAILS=("deivid.bitti@flexa.cloud" "marcelo.murilo.silva@gmail.com")

# Coleta info do commit antes de tudo
COMMIT_FULL=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_SHORT="${COMMIT_FULL:0:6}"
COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "sem mensagem")
COMMIT_AUTHOR=$(git log -1 --pretty=format:"%an" 2>/dev/null || echo "desconhecido")
COMMIT_DATE=$(git log -1 --pretty=format:"%ci" 2>/dev/null || echo "")
DEPLOY_START=$(date "+%d/%m/%Y %H:%M:%S")

notify_whatsapp() {
  local message="$1"
  for i in "${!NOTIFY_NUMBERS[@]}"; do
    curl -s -X POST "${WHATSAPP_API}" \
      -H "Content-Type: application/json" \
      -d "{\"device_id\": ${WHATSAPP_DEVICE_ID}, \"recipient\": \"${NOTIFY_NUMBERS[$i]}\", \"message\": \"${message}\"}" \
      > /dev/null 2>&1 || echo "⚠️  Falha ao notificar ${NOTIFY_NAMES[$i]}"
  done
}

notify_email() {
  local subject="$1"
  local body="$2"

  python3 - "${subject}" "${body}" <<'PYEOF'
import sys, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

subject = sys.argv[1]
body = sys.argv[2]

SMTP_HOST = "email-smtp.us-east-1.amazonaws.com"
SMTP_PORT = 587
SMTP_USER = "AKIA3CLXMM33FW5NGI5A"
SMTP_PASS = "BCKM62t0UXYe3AEN8gLqT6GiYzpgqrg8qq0e369+xL5n"
SMTP_FROM = "noreply@boardmanager.com.br"
SMTP_FROM_NAME = "Mentoria Marcelo Murilo"
RECIPIENTS = ["deivid.bitti@flexa.cloud", "marcelo.murilo.silva@gmail.com"]

for recipient in RECIPIENTS:
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, recipient, msg.as_string())
        print(f"📧 Email enviado para {recipient}")
    except Exception as e:
        print(f"⚠️  Falha ao enviar email para {recipient}: {e}")
PYEOF
}

# ─── Parse argumentos ───
for arg in "$@"; do
  case $arg in
    --base)
      BUILD_BASE=true
      shift
      ;;
    --base-only)
      BUILD_BASE=true
      BASE_ONLY=true
      shift
      ;;
    --test-email)
      TEST_EMAIL=true
      shift
      ;;
    *)
      IMAGE_TAG="$arg"
      shift
      ;;
  esac
done

echo "📋 Mentoria ECS Deploy Script"
echo "================================"
echo "  App ECR:   ${ECR_APP_URI}"
echo "  Base ECR:  ${ECR_BASE_URI}"
echo "  Cluster:   ${ECS_CLUSTER}"
echo "  Service:   ${ECS_SERVICE}"
echo "  Tag:       ${IMAGE_TAG}"
echo "  Platform:  ${DOCKER_PLATFORM}"
echo "  Base:      ${BUILD_BASE}"
echo "================================"
echo ""

# ─── Teste de email ───
if [ "$TEST_EMAIL" = true ]; then
  echo "📧 Testando envio de email SMTP..."
  echo "   Host: ${SMTP_HOST}:${SMTP_PORT}"
  echo "   From: ${SMTP_FROM_NAME} <${SMTP_FROM}>"
  echo "   Para: ${NOTIFY_EMAILS[*]}"
  echo ""

  TEST_DATE=$(date "+%d/%m/%Y %H:%M:%S")

  TEST_BODY="<html><body style=\"font-family: Arial, sans-serif; color: #333;\">
<h2 style=\"color: #f59e0b;\">🧪 Teste de Email - Deploy System</h2>
<p>Este é um email de teste do sistema de notificação de deploy da Mentoria.</p>
<table style=\"border-collapse: collapse; margin: 16px 0;\">
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📅 Data:</td><td style=\"padding: 6px 12px;\">${TEST_DATE}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📧 SMTP Host:</td><td style=\"padding: 6px 12px;\">${SMTP_HOST}:${SMTP_PORT}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📤 Remetente:</td><td style=\"padding: 6px 12px;\">${SMTP_FROM_NAME} &lt;${SMTP_FROM}&gt;</td></tr>
</table>
<p>✅ Se você recebeu este email, a configuração SMTP está funcionando corretamente.</p>
<hr style=\"border: none; border-top: 1px solid #ddd;\">
<p style=\"font-size: 12px; color: #888;\">Mentoria Deploy System</p>
</body></html>"

  notify_email "🧪 Teste de Email - Mentoria Deploy" "${TEST_BODY}"

  echo ""
  echo "================================"
  echo "✅ Teste de email concluído!"
  echo "   Verifique a caixa de entrada dos destinatários."
  echo "================================"
  exit 0
fi

# ─── Verificações ───
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando"
    exit 1
fi

# ─── Login no ECR ───
echo "🔐 Login no ECR..."
aws ecr get-login-password --region ${AWS_REGION} \
  | docker login --username AWS --password-stdin \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo "✅ Login OK"
echo ""

# ─── Função: garantir que o repo ECR base existe ───
ensure_base_repo() {
  if ! aws ecr describe-repositories --repository-names ${ECR_BASE_REPO} --region ${AWS_REGION} &> /dev/null; then
    echo "📦 Criando repositório ECR base: ${ECR_BASE_REPO}..."
    aws ecr create-repository \
      --repository-name ${ECR_BASE_REPO} \
      --region ${AWS_REGION} \
      --image-scanning-configuration scanOnPush=false \
      > /dev/null
    echo "✅ Repositório base criado"
  fi
}

# ─── Função: verificar se imagem base existe no ECR ───
base_image_exists() {
  aws ecr describe-images \
    --repository-name ${ECR_BASE_REPO} \
    --image-ids imageTag=latest \
    --region ${AWS_REGION} &> /dev/null
}

# ─── Função: build e push da imagem base ───
build_base() {
  ensure_base_repo

  echo "🏗️  Construindo imagem BASE (node_modules)..."
  echo "   Isso demora na primeira vez (~2-3 min), mas só precisa rodar quando package.json mudar"
  echo ""

  docker build \
    --platform ${DOCKER_PLATFORM} \
    -f Dockerfile.base \
    -t ${ECR_BASE_REPO}:latest \
    .

  echo "✅ Imagem base construída"
  echo ""

  echo "🏷️  Taggeando imagem base..."
  docker tag ${ECR_BASE_REPO}:latest ${ECR_BASE_URI}:latest

  echo "📤 Enviando imagem base para ECR..."
  docker push ${ECR_BASE_URI}:latest
  echo "✅ Imagem base enviada"
  echo ""
}

# ─── Função: build e push da imagem da aplicação ───
build_app() {
  echo "🏗️  Construindo imagem da APLICAÇÃO..."

  COMMIT_HASH=$(git rev-parse HEAD | head -c 6)
  echo "   Commit: ${COMMIT_HASH}"

  docker build \
    --platform ${DOCKER_PLATFORM} \
    --build-arg BASE_IMAGE=${ECR_BASE_URI}:latest \
    --build-arg COMMIT_HASH=${COMMIT_HASH} \
    -t ${ECR_APP_REPO}:${IMAGE_TAG} \
    .

  echo "✅ Imagem da aplicação construída"
  echo ""

  echo "🏷️  Taggeando imagem..."
  docker tag ${ECR_APP_REPO}:${IMAGE_TAG} ${ECR_APP_URI}:${IMAGE_TAG}

  echo "📤 Enviando imagem para ECR..."
  docker push ${ECR_APP_URI}:${IMAGE_TAG}
  echo "✅ Imagem enviada"
  echo ""
}

# ─── Função: deploy no ECS ───
deploy_ecs() {
  echo "🚀 Forçando novo deployment no ECS..."
  aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null
  echo "✅ Deployment forçado"
  echo ""

  echo "⏳ Aguardando deployment estabilizar..."
  if aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}; then
    echo "✅ Deployment concluído e estável!"
  else
    echo "⚠️  Timeout aguardando estabilização. Verifique o console ECS."
  fi
}

# ─── Execução ───

# Se pediu --base ou --base-only, build da base
if [ "$BUILD_BASE" = true ]; then
  build_base
  if [ "$BASE_ONLY" = true ]; then
    echo ""
    echo "================================"
    echo "🎉 Imagem base atualizada!"
    echo "   Próximo deploy da app será rápido."
    echo "================================"
    exit 0
  fi
fi

# Verificar se imagem base existe (se não, buildar automaticamente)
if ! base_image_exists; then
  echo "⚠️  Imagem base não encontrada no ECR. Construindo automaticamente..."
  echo ""
  build_base
fi

# Build e deploy da aplicação
notify_whatsapp "🚀 *Deploy Mentoria iniciado*\n\n📦 Commit: \`${COMMIT_SHORT}\`\n💬 ${COMMIT_MSG}\n👤 Autor: ${COMMIT_AUTHOR}\n📅 ${COMMIT_DATE}\n⏱️ Início: ${DEPLOY_START}\n\n⏳ Fase: Build da imagem Docker..."
notify_email "🚀 Deploy Mentoria Iniciado" "<html><body style=\"font-family: Arial, sans-serif; color: #333;\">
<h2 style=\"color: #0ea5e9;\">🚀 Deploy Mentoria Iniciado</h2>
<table style=\"border-collapse: collapse; margin: 16px 0;\">
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📦 Commit:</td><td style=\"padding: 6px 12px;\"><code>${COMMIT_SHORT}</code></td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">💬 Mensagem:</td><td style=\"padding: 6px 12px;\">${COMMIT_MSG}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">👤 Autor:</td><td style=\"padding: 6px 12px;\">${COMMIT_AUTHOR}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📅 Data commit:</td><td style=\"padding: 6px 12px;\">${COMMIT_DATE}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">⏱️ Início:</td><td style=\"padding: 6px 12px;\">${DEPLOY_START}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">🏷️ Tag:</td><td style=\"padding: 6px 12px;\">${IMAGE_TAG}</td></tr>
</table>
<p>⏳ <strong>Fase:</strong> Build da imagem Docker...</p>
<hr style=\"border: none; border-top: 1px solid #ddd;\">
<p style=\"font-size: 12px; color: #888;\">Mentoria Deploy System</p>
</body></html>"
build_app
deploy_ecs

echo ""
echo "================================"
echo "🎉 Deploy finalizado!"
echo "================================"
echo ""
echo "📊 Status:  aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo "📝 Logs:    aws logs tail /ecs/${ECS_SERVICE} --follow --region ${AWS_REGION}"
echo ""

DEPLOY_END=$(date "+%d/%m/%Y %H:%M:%S")
notify_whatsapp "✅ *Deploy Mentoria concluído!*\n\n📦 Commit: \`${COMMIT_SHORT}\`\n💬 ${COMMIT_MSG}\n👤 Autor: ${COMMIT_AUTHOR}\n🏷️ Tag: ${IMAGE_TAG}\n⏱️ Início: ${DEPLOY_START}\n🏁 Fim: ${DEPLOY_END}\n\n🟢 Serviço estável no ECS"
notify_email "✅ Deploy Mentoria Concluído" "<html><body style=\"font-family: Arial, sans-serif; color: #333;\">
<h2 style=\"color: #22c55e;\">✅ Deploy Mentoria Concluído!</h2>
<table style=\"border-collapse: collapse; margin: 16px 0;\">
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">📦 Commit:</td><td style=\"padding: 6px 12px;\"><code>${COMMIT_SHORT}</code></td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">💬 Mensagem:</td><td style=\"padding: 6px 12px;\">${COMMIT_MSG}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">👤 Autor:</td><td style=\"padding: 6px 12px;\">${COMMIT_AUTHOR}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">🏷️ Tag:</td><td style=\"padding: 6px 12px;\">${IMAGE_TAG}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">⏱️ Início:</td><td style=\"padding: 6px 12px;\">${DEPLOY_START}</td></tr>
  <tr><td style=\"padding: 6px 12px; font-weight: bold;\">🏁 Fim:</td><td style=\"padding: 6px 12px;\">${DEPLOY_END}</td></tr>
</table>
<p>🟢 <strong>Serviço estável no ECS</strong></p>
<hr style=\"border: none; border-top: 1px solid #ddd;\">
<p style=\"font-size: 12px; color: #888;\">Mentoria Deploy System</p>
</body></html>"
