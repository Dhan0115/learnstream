---
name: add-feature
description: Deliver a vertical feature slice across Prisma, Supabase, Nitro server routes, and the Nuxt app UI for <PROJECT_NAME>.
---

# add-feature

## name

add-feature

## description

End-to-end workflow for adding one vertical feature slice (schema → RLS → API → UI → tests) to `<PROJECT_NAME>` without breaking existing conventions.

## when_to_use

Use when a user asks to add, build, or extend a product feature (new capability, screen, or data flow). Do NOT use for isolated bug fixes (see `debug-production-issue`), schema-only changes (`add-database-migration`), or reviews (`code-review`).

## inputs

- Feature request with user roles, acceptance criteria, and affected domains.
- Target module/screen name (`<TODO: module/screen>`).
- Existing patterns discovered in step 2.
- Confirmation of the Nuxt/Prisma/Supabase conventions in `.agents/rules/` and `AGENTS.md`.

## outputs

- Updated `prisma/schema.prisma` and a migration (if the data model changed).
- RLS policies and Supabase Storage rules (if applicable).
- Server service logic and Nitro route(s) under `server/`.
- UI under `app/` plus validation, authorization, and loading/empty/error states.
- Tests and a summary of files changed, migration impact, risks, and follow-up work.

## steps

1. Clarify scope, user roles, data model, and acceptance criteria; record unresolved questions as `TODO` and ask the human.
2. Inspect existing patterns in `app/`, `server/`, `shared/`, and `prisma/`; follow `.agents/rules/nuxt.md`, `.agents/rules/api.md`, and `.agents/rules/code-style.md` before writing code.
3. Update `prisma/schema.prisma` and create a migration per `add-database-migration` and `.agents/rules/prisma.md`.
4. Add or update RLS policies and Supabase Storage rules per `add-rls-policy` and `.agents/rules/supabase.md` (if applicable).
5. Implement server-side service logic and the Nitro API route per `add-api-endpoint` and `.agents/rules/api.md`.
6. Implement the UI in `app/` using existing components and composables; follow `.agents/rules/nuxt.md`.
7. Add validation, authorization, error/loading/empty states; `app/` MUST NOT import Prisma or server-only modules.
8. Add tests per `.agents/rules/testing.md` (happy path plus authorization and failure cases).
9. Run type-check, lint, and tests; perform the manual verification listed under `verification`.
10. Summarize files changed, migration impact, risks, and follow-up work.

## guardrails

- Every mutation MUST validate input server-side and enforce authentication AND authorization; NEVER trust client input (`AGENTS.md` §2).
- NEVER expose the Supabase service-role key, `<DATABASE_URL>`, or other secrets to `app/` or the browser.
- STOP and ask the human before deleting data, changing auth/authz/RLS/payments, adding a dependency, or changing env vars (`AGENTS.md` §6).
- Keep the change small and reviewable; do NOT refactor unrelated code (`AGENTS.md` §2).

## verification

- [ ] Type-check, lint, and tests pass (`.agents/rules/testing.md`, `.agents/rules/code-style.md`).
- [ ] Migration reviewed and reversible (`add-database-migration`).
- [ ] Authentication and authorization enforced on every new/changed route (`add-api-endpoint`).
- [ ] UI loading/empty/error states and accessibility verified.
- [ ] No secrets committed; `AGENTS.md` §5 definition of done satisfied.
