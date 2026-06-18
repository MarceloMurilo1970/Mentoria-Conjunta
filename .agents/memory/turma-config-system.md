---
name: Turma Config System
description: Per-turma financial config — BatchPricingItem now uses flexible PaymentPlan[] instead of fixed pixPrice/card5Total fields
---

## Current Design (as of June 2026)

`BatchPricingItem` has **`plans: PaymentPlan[]`** — each plan has:
- `id`: "pix", "installments", "installments10", or custom
- `label`, `totalAmount`, `installments`, `feeRate` (0..1 decimal), `paymentLink`

This replaced the old fixed `pixPrice / card5Total / card5Installments / card10Total / card10Installments` fields.

## Seed Values (turma_3 & turma_4, Lote 3)
- PIX: R$9,952.18 — 0% fee
- 5x Cartão: R$11,054.50 — 8.80% fee
- 10x Cartão: R$12,000.00 — 15.06% fee

These produce identical net (R$8,782.80) after taxes (11.75%) + gateway fee. Verified against official financial waterfall.

## resolveConfig (AdminPage.tsx)
- Detects new format via `bpAny.plans` existence
- Falls back to legacy `pixPrice/card5Total` reading for old data
- Returns same BATCH_CONFIG shape so all calculateCommissions call sites unchanged

## Storage Seed Auto-migration
- On startup, if existing data lacks `plans` key → deletes all turma_configs rows → re-seeds with new format
- Detection: `firstBatches[0].plans` check

## DB Columns
- `card5FeeRate`, `card10FeeRate`, `card5PaymentLink`, `card10PaymentLink` still exist in DB for backward compat
- `buildPayload` derives these from the last batch's plans before sending to API

## Admin UI (TurmaConfigsSection)
- Cards per turma showing rates + last batch prices (PIX, 5x, 10x)
- Edit dialog: 4-column rate grid (imposto, vendedor, MM, HF) + flexible batch/plan editor
- Per-batch plan table: id, label, totalAmount, installments, feeRate (%), paymentLink
- Waterfall preview: dynamic columns per plan (not hardcoded PIX/5x/10x)
- "Nova Turma" clones rates + batches/plans from most recent config

## Drizzle jsonb typing quirk
`db.insert(turmaConfigs).values(data as any)` required — Drizzle's jsonb strict array type doesn't match plain TS arrays.

**Why flexible plans:** Fee rates now vary per batch (lote), not globally per turma. Plans[] enables any number of payment options per lote with independent fee rates.
