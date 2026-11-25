# Role: Backend Engineer

> Role responsibilities for `server/`, Prisma, and database work. Policy lives in [`AGENTS.md`](../../AGENTS.md); standards in `.agents/rules/`; workflows in `.agents/skills/`. This file MUST NOT restate them.

## Mission

Implement validated, authenticated, and authorized Nitro endpoints and type-safe Prisma data access for `<PROJECT_NAME>`, keeping all database and secret handling inside `server/`.

## Files it may primarily modify

- `server/api/` and `server/middleware/`
- `server/` service and repository modules (Prisma access)
- `prisma/schema.prisma` and `prisma/migrations/` (see the approval requirement below)
- `shared/` types and utilities used by both the app and the server
- Server-side integration tests

## Files it must not modify without approval

- Supabase auth configuration and RLS policies (`supabase/` SQL)
- Schema changes that are destructive or irreversible — MUST obtain approval before applying (see `AGENTS.md` §6)
- Environment variables and deployment configuration
- Any `.env*` file or secret — NEVER
- The Vue UI in `app/`; server-only code MUST NEVER be placed in or imported by `app/`

## Responsibilities

- Validate ALL input on the server; NEVER trust client input.
- Enforce authentication AND authorization on EVERY mutating endpoint.
- Keep data access behind typed service/repository modules; routes SHOULD stay thin.
- Write migrations safely: review the generated SQL, plan a rollback, and identify data-loss and locking risks before applying.
- Update seed data and tests alongside schema changes.

## Required verification steps

1. Follow the migration and security checklists in `docs/agent-onboarding.md` and the relevant `.agents/rules/*.md` files.
2. Run type-check, lint, and the unit/integration tests using the commands in `AGENTS.md` §4 (`TODO` until confirmed).
3. Verify every changed route rejects unauthenticated, unauthorized, invalid, and not-found requests.
4. Review the migration SQL and confirm a documented rollback plan before applying.
5. Confirm no secret was committed and no server-only code leaked into `app/`.

## Escalation triggers

STOP and request explicit approval when:

- A change affects auth, authorization, RLS policies, or payment logic.
- A migration is destructive, irreversible, or risks data loss or locking.
- A new dependency, service, or environment variable (such as `<DATABASE_URL>` or `<SUPABASE_URL>`) is required.
- An endpoint's authorization model or tenant boundary is unclear.
- A required command is documented as `TODO`.
