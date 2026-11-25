# Prisma Rules

> Standards for the Prisma schema, migrations, and database access.
> Policy lives in the root [`AGENTS.md`](../../AGENTS.md). Workflows live in `.agents/skills/` — reference the matching skill path instead of duplicating it here.

**Related skill:** `.agents/skills/<TODO: skill-name>/SKILL.md` (confirm the exact skill name against the repository).

## Schema organization

- MUST keep all models in `prisma/schema.prisma` (or the split files the repo already uses — follow the existing layout).
- Model names MUST use `PascalCase`; fields MUST use `camelCase`; the physical mapping MUST use `@map`/`@@map` consistently if the repo uses snake_case tables.
- MUST document every model with `///` comments describing its purpose and ownership.
- NEVER add a model or field without confirming it against the actual domain (no invented tables).

## Migrations

- MUST follow the repo's migration workflow: create → review generated SQL → apply locally → update seed data → verify types.
- MUST review the generated SQL before applying; NEVER run a destructive migration without explicit human approval (`AGENTS.md` §6).
- NEVER edit an already-applied migration file — create a new migration to change applied schema.
- MUST keep seed data in sync with schema changes and confirm the seed script path (`TODO: seed command`) against the repo.

## Transactions

- MUST wrap multi-step writes in `prisma.$transaction` when partial completion would corrupt consistency.
- SHOULD keep transaction bodies small and free of network/HTTP calls.

## Queries

- MUST select only required fields (`select`) rather than returning whole rows by default.
- MUST avoid N+1 queries — use `include`/nested reads or batch lookups instead of per-row queries in loops.
- SHOULD paginate list queries and avoid unbounded `findMany` on large tables.

## Indexes

- MUST add an index for columns used in frequent `where` filters, foreign keys, and `orderBy` sort fields.
- MUST justify composite index column order in the migration.

## Consistency

- MUST apply soft deletes consistently (e.g. a `deletedAt` timestamp) where the domain requires retain-and-hide; exclude soft-deleted rows in queries.
- MUST include `createdAt`/`updatedAt` timestamps on mutable models via `@default(now())` / `@updatedAt`.
- MUST enforce uniqueness with `@unique`/`@@unique` at the database level, not only in application code.
- MUST declare relations with explicit `onDelete` behavior.

## Access layer

- MUST keep Prisma access behind typed server-side service/repository functions in `server/`.
- NEVER import the Prisma client from `app/` or from Vue components; go through a Nitro route or server service.

## Checklist

- [ ] Schema follows naming and mapping conventions; no invented tables.
- [ ] New migration reviewed (SQL + types) and applied only after approval for destructive changes.
- [ ] No previously applied migration was edited.
- [ ] Multi-step writes are transactional; queries select only needed fields and avoid N+1.
- [ ] Indexes exist for filters, FKs, and sort fields.
- [ ] Prisma is accessed only through typed server-side services.
