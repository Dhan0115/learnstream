# Testing Rules

> Standards for unit, integration, and end-to-end tests (Vitest + Playwright per root [`AGENTS.md`](../../AGENTS.md)).
> Workflows live in `.agents/skills/` — reference the matching skill path instead of duplicating it here.

**Related skill:** `.agents/skills/<TODO: skill-name>/SKILL.md` (confirm the exact skill name against the repository).

## Unit tests

- MUST cover composables, utility functions, server-side services, and validation logic.
- MUST test behavior and edge cases, not implementation details.
- SHOULD keep each test focused on a single unit with clear arrange/act/assert separation.

## Integration tests

- MUST cover server routes and database access against an isolated test database.
- MUST create and seed test data per test (or per isolated transaction) and MUST NOT depend on shared mutable state.
- MUST run against test-only environment configuration; NEVER point tests at production credentials.

## End-to-end tests

- MUST cover critical user journeys (the paths whose failure blocks real users).
- SHOULD keep E2E tests few, stable, and independent; prefer unit/integration coverage for edge cases.

## Naming, fixtures, mocks, cleanup

- MUST name tests with the file under test plus a descriptive case (e.g. `<unit>.test.ts`, `describe`/`it` describing the scenario).
- MUST colocate or place tests by the repo's existing convention (`TODO: confirm test directory layout`).
- SHOULD use shared fixtures/builders instead of copy-pasted literals.
- MUST mock external services (network, third-party APIs) rather than calling them; NEVER mock the unit under test's core logic.
- MUST clean up created records, mocks, and timers after each test so runs are repeatable.

## Integrity

- NEVER weaken, skip, or delete a failing test merely to make the suite pass.
- MUST fix the underlying defect; if a test is genuinely wrong, MUST document why in the PR and get review.

## Checklist

- [ ] Unit tests exist for composables, utilities, services, and validation.
- [ ] Integration tests isolate data and never touch production.
- [ ] Critical journeys have E2E coverage.
- [ ] Tests are named clearly, use fixtures/mocks appropriately, and clean up.
- [ ] No test was weakened or skipped to pass the suite.
