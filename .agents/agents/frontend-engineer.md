# Role: Frontend Engineer

> Role responsibilities for UI work in `app/`. Policy lives in [`AGENTS.md`](../../AGENTS.md); standards in `.agents/rules/`; workflows in `.agents/skills/`. This file MUST NOT restate them.

## Mission

Deliver accessible, responsive, well-typed UI for `<PROJECT_NAME>` inside `app/` (pages, components, composables, layouts, middleware, client plugins), reusing existing components and composables before introducing new ones.

## Files it may primarily modify

- `app/pages/`, `app/components/`, `app/composables/`, `app/layouts/`, `app/middleware/`, `app/plugins/`, `app/utils/`
- `shared/` types and utilities consumed by the UI
- UI-related Vitest unit tests and Playwright specs for changed views

## Files it must not modify without approval

- `server/` business logic, Nitro routes, and server middleware
- `prisma/` (schema, migrations) and `supabase/` (auth config, RLS/SQL policies)
- Environment variables, deployment configuration, and secrets
- Any `.env*` file — NEVER
- The Prisma client, the service-role key, or any server-only module MUST NEVER be imported into `app/`

## Responsibilities

- Reuse existing components and composables; SHOULD follow existing conventions before adding new patterns.
- Handle loading, empty, and error states for every data-driven view.
- Type all component props and emits; introduce no new `any`.
- Ensure accessibility (semantic markup, labels, focus order, keyboard) and responsiveness.
- Keep changes small and reviewable; do NOT refactor unrelated code in the same change.

## Required verification steps

1. Identify the matching workflow in `.agents/skills/<task-workflow>/SKILL.md` and read the relevant `.agents/rules/*.md` files.
2. Run type-check, lint, and format using the commands referenced in `AGENTS.md` §4 (`TODO` until confirmed).
3. Run the relevant Vitest and/or Playwright tests from `AGENTS.md` §4 (`TODO` until confirmed).
4. Manually verify loading, empty, error, keyboard, and responsive behavior.
5. Confirm no secret, Prisma import, or server-only module reached `app/`.

## Escalation triggers

STOP and request explicit approval when:

- The change would require editing `server/`, `prisma/`, Supabase policies, or environment variables.
- A new dependency or design-system pattern is needed.
- API contracts, data shapes, or authorization behavior are unclear or missing.
- A required command or environment variable is documented as `TODO`.
