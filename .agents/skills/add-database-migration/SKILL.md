---
name: add-database-migration
description: Make safe, reversible Prisma schema changes with reviewed SQL against Supabase PostgreSQL.
---

# add-database-migration

## name
add-database-migration

## description
Workflow for changing the Prisma schema and creating a reviewed, reversible migration against the `<PROJECT_NAME>` Supabase PostgreSQL database.

## when_to_use
Use when the data model must change (new/changed table, column, index, enum, or relation). Do NOT use for pure query changes or RLS-only changes (see `add-rls-policy`).

## inputs
- The requested schema change and its business motivation.
- Current `prisma/schema.prisma`.
- The migration and apply commands from `AGENTS.md` §4 (`<TODO: verify commands>`).
- Whether the target database is local, shared, or production.

## outputs
- Updated `prisma/schema.prisma`.
- A generated migration file with reviewed SQL.
- Impact assessment: destructive operations, data loss, locking, and rollback.
- Updated seed data and tests.

## steps
1. Explain the requested change and its impact on data, queries, and existing code.
2. Update `prisma/schema.prisma` per `.agents/rules/prisma.md`.
3. Generate a migration using the Prisma migrate command (`<TODO: confirm in AGENTS.md §4>`).
4. Review the generated SQL BEFORE applying it; NEVER apply unreviewed SQL.
5. Identify destructive operations (dropping/renaming columns or tables, type changes), data loss, and locking risks, and define a rollback strategy.
6. Update seed data and affected tests (`.agents/rules/testing.md`).
7. Ask for explicit approval before applying migrations to shared or production databases.

## guardrails
- NEVER modify the Prisma schema or run destructive database commands without explicit user approval (`AGENTS.md` §2, §6).
- NEVER hardcode `<DATABASE_URL>`, credentials, or production values; use environment configuration only.
- STOP and ask the human before any irreversible migration, table/column drop, or change that affects production data.
- Prefer additive, backward-compatible changes; keep the migration small and reviewable.

## verification
- [ ] Generated SQL reviewed line by line; destructive operations confirmed with the human.
- [ ] Rollback strategy documented and tested where feasible.
- [ ] Seed data and tests updated and passing (`.agents/rules/testing.md`).
- [ ] Prisma client regenerated; type-check passes.
- [ ] No secrets or production values committed (`AGENTS.md` §2).
