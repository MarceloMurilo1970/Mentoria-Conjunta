---
name: NF Automática - Faturador API
description: Integração com faturador.marcelomurilo.com.br para emissão automática de NFS-e quando pagamento é confirmado
---

# NF Automática via Faturador API

## Regra
Quando admin muda `paymentStatus` para `"pago"` (em qualquer dos dois endpoints), o sistema aciona `triggerNfEmission()` em background (não-bloqueante) que chama `emitNF()` em `server/nf.ts`.

**Why:** Cliente pediu emissão automática de NFS-e ao confirmar pagamento, sem webhook externo.

**How to apply:** Alterações no flow de pagamento devem preservar o call a `triggerNfEmission`. O helper usa `FATURADOR_API_KEY` (secret) + `companyId=4` (Mentoria MM Treinamentos Ltda, CNPJ 66.142.918/0001-83).

## Detalhes técnicos
- API base: `https://faturador.marcelomurilo.com.br/api/external`
- companyId: 4 (Mentoria MM Treinamentos Ltda)
- Secret: `FATURADOR_API_KEY` (já configurado no Replit Secrets)
- Campos NF no schema: `nfId` (integer), `nfStatus` (text), `nfPdfUrl` (text), `nfEmittedAt` (timestamp), `nfNumber` (text)
- Lógica de idempotência: se `registration.nfId` já existe e é > 0, skip emissão
- Erro não-bloqueante: falha de NF salva `nfStatus='error'` mas não impede resposta de pagamento
- Re-emissão manual: `POST /api/registrations/:id/emit-nf` (admin panel tem botão)

## Status display no admin
- `issued` / `authorized` → verde + link PDF + botão "Re-emitir"
- `processing` / `pending` → amarelo "Processando..."
- `error` → vermelho + botão "Re-emitir NFS-e"
- sem nfStatus + pago → botão azul "Emitir NFS-e"
- sem nfStatus + não pago → cinza "Aguardando pagamento"
