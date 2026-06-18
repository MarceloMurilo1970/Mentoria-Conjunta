---
name: Turma Config System
description: Per-turma financial configuration table driving commission and DRE calculations
---

## What was built
`turma_configs` table (Drizzle, PostgreSQL) with: turmaId (unique), name, active, taxRate, card5FeeRate, card10FeeRate, vendorCommissionRate, mmRate, hfRate, card5PaymentLink, card10PaymentLink, batches (jsonb → BatchPricingItem[]).

Prices in batches are in **R$ (float)**, not centavos — to match existing BATCH_CONFIG_BASE convention.

## How it plugs in
`resolveConfig(reg, turmaConfigsList, taxRate)` in AdminPage.tsx returns the **same shape** as `typeof BATCH_CONFIG[0]`, so `calculateCommissions(reg, batchConfig)` signature did not change. All call sites replaced with `rc(reg)` (a closure around resolveConfig defined inside MentorshipRegistrationsSection).

**Why same shape:** avoids updating 20+ call sites in the component.

## Seed data (seeded once on startup)
- turma_2: vendorCommissionRate=0.05 (legacy 5%), active=false
- turma_3: vendorCommissionRate=0.1667, active=true, with payment links
- turma_4: vendorCommissionRate=0.1667, active=true

## Critical: Drizzle jsonb typing quirk
`db.insert(turmaConfigs).values(data as any)` and `.set(data as any)` required because Drizzle's `jsonb().$type<T[]>()` strict array type doesn't match plain TS arrays at compile time. Safe to cast — the runtime behavior is correct.

**Why:** TypeScript infers `pop()` return type as `unknown` on the internal array type, breaking the generic constraint.

## Admin UI
Tab "Turmas" in AdminPage → `TurmaConfigsSection` component with:
- Cards per turma showing all rates at a glance
- Edit dialog with rate fields, batch pricing table (editable rows), waterfall preview table
- "Nova Turma" button clones rates from most recent turma
- Waterfall preview updates live from form values
