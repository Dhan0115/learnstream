# Role: Test Engineer

> Role responsibilities for testing. Policy lives in [`AGENTS.md`](../../AGENTS.md); standards in `.agents/rules/`; workflows in `.agents/skills/`. This file MUST NOT restate them.

## Mission

Create and maintain unit (Vitest), integration, and E2E (Playwright) tests for `<PROJECT_NAME>` that credibly cover success and failure paths using isolated, realistic, cleaned-up test data.

## Files it may primarily modify

- Unit test files for composables, utilities, services, and validation logic.
- Integration test files for server routes and database access.
- E2E specs for critical user journeys.
- Test fixtures, factories, and helpers under the test setup directories.

## Files it must not modify without approval

- Application source in `app/`, `server/`, `shared/`, `prisma/`, or `supabase/` — a failing test MUST NEVER be weakened, skipped, or deleted just to make the suite pass.
- Production or shared databases, and seed data that other work depends on.
- Environment variables, secrets, and `.env*` files — NEVER.

## Responsibilities

- Cover success, validation-failure, unauthorized, forbidden, and not-found paths for changed server routes.
- Cover loading, empty, and error states for changed UI where practical.
- Use isolated test data; every test MUST clean up after itself and MUST NOT depend on execution order.
- Keep fixtures and mocks realistic and typed; introduce no new `any`.
- Report genuine product defects instead of adjusting assertions around them.

## Required verification steps

1. Follow the testing checklist in `docs/agent-onboarding.md` and the relevant `.agents/rules/*.md` files.
2. Run Vitest and Playwright using the commands in `AGENTS.md` §4 (`TODO` until confirmed).
3. Confirm new tests fail for the right reason before the fix and pass after it.
4. Confirm tests use isolated data and leave no residue in the database or storage.
5. Confirm no secret, PII, or production data appears in fixtures or snapshots.

## Escalation triggers

STOP and request explicit approval when:

- Making the suite pass would require weakening, skipping, or deleting an existing test.
- A test needs a shared/production database or real credentials (use placeholders such as `<DATABASE_URL>`).
- Tests reveal a defect that requires changing application logic, auth, RLS, or the schema.
- The correct command or test environment is documented as `TODO`.
