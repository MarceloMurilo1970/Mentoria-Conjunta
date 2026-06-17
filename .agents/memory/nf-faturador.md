---
name: NF Automática - Faturador API
description: Integração com faturador.marcelomurilo.com.br para emissão automática de NFS-e quando pagamento é confirmado
---

# NF Automática via Faturador API

## Regra
Quando admin muda `paymentStatus` para `"pago"`, o sistema aciona `triggerNfEmission()` em background (não-bloqueante) que chama `emitNF()` em `server/nf.ts`.

**Why:** Cliente pediu emissão automática de NFS-e ao confirmar pagamento.

**How to apply:** Alterações no flow de pagamento devem preservar o call a `triggerNfEmission`. O helper usa `FATURADOR_API_KEY` (secret) + `companyId=4` (Mentoria MM Treinamentos Ltda, CNPJ 66.142.918/0001-83).

## Detalhes técnicos
- API base: `https://faturador.marcelomurilo.com.br/api/external`
- companyId: 4 (Mentoria MM Treinamentos Ltda)
- Secret: `FATURADOR_API_KEY` (configurado no Replit Secrets)
- Campos NF no schema: `nfId` (integer), `nfStatus` (text), `nfPdfUrl` (text), `nfEmittedAt` (timestamp), `nfNumber` (text)
- Idempotência: se `registration.nfId` já existe e é > 0, skip emissão
- Erro não-bloqueante: falha de NF salva `nfStatus='error'` mas não impede resposta de pagamento
- Re-emissão manual: `POST /api/registrations/:id/emit-nf`
- Cancelamento: `POST /api/registrations/:id/cancel-nf` com body `{ justificativa: "min 15 chars" }`

## Formatos de resposta da API

### Emissão (POST /invoices)
Resposta em `data.invoice` — campos usados: `id`, `status`, `focusNfeNumero`, `pdfUrl`, `issuedAt`

### Cancelamento (POST /invoices/:id/cancel)
Resposta FLAT (sem wrapper `invoice`):
```json
{ "success": true, "status": "cancelled", "message": "NFS-e cancelada com sucesso..." }
```
- NF pendente: cancela sem justificativa
- NF emitida: requer `justificativa` com 15+ chars
- NF de outro app: retorna 403
- Parser correto: `data.invoice?.status ?? data.status ?? "cancelled"`

## Status display no admin
- `issued` / `authorized` → verde + link PDF + botões "Re-emitir" e "Cancelar NFS-e"
- `processing` / `pending` → amarelo "Processando..."
- `error` → vermelho + botão "Re-emitir NFS-e"
- `cancelled` → cinza "Cancelada #N" + botão "Nova NFS-e"
- sem nfStatus + pago → botão azul "Emitir NFS-e"
- sem nfStatus + não pago → cinza "Aguardando pagamento"

## Botão Cancelar NFS-e
Usa `window.prompt()` para pedir justificativa (mín 15 chars). A mutation passa `{ id, justificativa }` para o endpoint.
