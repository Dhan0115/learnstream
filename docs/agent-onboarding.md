# Agent Onboarding

Orientation for a new agent session in the `<PROJECT_NAME>` repository. Read this after [`AGENTS.md`](../AGENTS.md).

---

## 1. Quick-start checklist (every session)

- [ ] Read `AGENTS.md` (policy, boundaries, definition of done).
- [ ] Read the rule files relevant to your task in `.agents/rules/`.
- [ ] Find the skill matching your task in `.agents/skills/` and follow its steps.
- [ ] Confirm scope and acceptance criteria with the human if anything is ambiguous.
- [ ] Write a short plan; keep the change small and reviewable.
- [ ] Implement behind the correct boundary (`app/` / `server/` / `shared/`).
- [ ] Run type-check, lint, and the relevant tests.
- [ ] Update docs if architecture or workflows changed.

---

## 2. Repository map

| Path | Belongs here |
|---|---|
| `app/pages/` | Route components (file-based routing) |
| `app/components/` | Reusable Vue components |
| `app/composables/` | Reusable reactive logic |
| `app/layouts/` | Page layouts |
| `app/middleware/` | Route middleware |
| `app/plugins/` | Client plugins |
| `app/utils/` | Client-side helpers |
| `server/api/` | Nitro API route handlers |
| `server/middleware/` | Server middleware |
| `server/` (services) | Server-only business logic and Prisma access |
| `shared/` | Types/utilities used by both app and server |
| `prisma/` | `schema.prisma`, migrations, seed scripts |
| `supabase/` | Supabase config, SQL/RLS policies, functions, local dev |
| `docs/` | Project and process documentation |

---

## 3. Decision tree — where does this code go?

- **Is it UI?** (rendering, interaction, layout)
  - Route-level → `app/pages/`
  - Reusable → `app/components/`
  - Stateful logic reused by components → `app/composables/`
- **Does it need secrets, Prisma, the service-role key, or run server-side?**
  - HTTP endpoint → `server/api/`
  - Cross-cutting server concern → `server/middleware/`
  - Business logic / data access → server service/repository module
- **Used by both `app/` and `server/`, with no environment-specific APIs?** → `shared/`
- **Database schema or migration?** → `prisma/`
- **Auth, RLS, or storage?** → Supabase (see `.agents/rules/supabase.md`)

**NEVER import Prisma or the service-role key into `app/`.**

---

## 4. Security checklist

- [ ] No secrets, keys, tokens, or `.env*` values committed.
- [ ] Service-role key used only in server-only code; never sent to the client.
- [ ] Every mutating endpoint validates input and checks authentication **and** authorization.
- [ ] RLS covers the table; server routes still enforce authorization independently.
- [ ] Storage buckets and signed URLs respect public/private intent.
- [ ] Logs and error messages contain no secrets, tokens, passwords, or PII.

---

## 5. Migration checklist

- [ ] Change is described and its impact explained.
- [ ] `prisma/schema.prisma` updated.
- [ ] Migration generated and the **SQL reviewed** before applying.
- [ ] Destructive operations, data-loss and locking risks identified.
- [ ] Rollback / reversibility plan documented.
- [ ] Seed data and tests updated.
- [ ] Explicit approval obtained before applying to shared/production databases.

---

## 6. Testing checklist

- [ ] Unit tests for new composables, utilities, services, and validation logic.
- [ ] Integration tests for new/changed server routes and database access (isolated data).
- [ ] E2E tests for changed critical user journeys.
- [ ] Tests cover success, validation failure, unauthorized, forbidden, and not-found paths.
- [ ] Fixtures/mocks are realistic and cleaned up after runs.
- [ ] No failing test was weakened to make the suite pass.

---

## 7. Glossary

| Term | Meaning |
|---|---|
| `<PROJECT_NAME>` | `<TODO: product name>` |
| `<TODO: domain term>` | `<TODO: definition>` |
| Workspace / tenant | `<TODO: define the tenant boundary used for RLS, if any>` |
| RLS | Row Level Security — Postgres authorization by row |
| Service-role key | Supabase key with elevated privileges; server-only |
| Anon key | Supabase public key; safe for the browser under RLS |
| Nitro | Nuxt's server runtime powering `server/` routes |
| Vertical slice | A feature implemented end-to-end across UI, API, and DB |
