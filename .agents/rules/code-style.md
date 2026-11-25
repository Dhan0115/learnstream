# Code Style Rules

> Cross-cutting standards for TypeScript, naming, errors, accessibility, and collaboration.
> Policy lives in the root [`AGENTS.md`](../../AGENTS.md). Workflows live in `.agents/skills/` — reference the matching skill path instead of duplicating it here.

**Related skill:** `.agents/skills/<TODO: skill-name>/SKILL.md` (confirm the exact skill name against the repository).

## TypeScript

- MUST keep TypeScript `strict` with no `any`; prefer `unknown` and narrow it.
- MUST declare explicit return types for exported functions, composables, and server services.
- SHOULD prefer `type` imports and precise generics over casts; NEVER silence errors with `@ts-ignore` (use `@ts-expect-error` with a reason only as a last resort).

## Naming

- MUST name Vue components/pages in `PascalCase.vue` and other files in `kebab-case`.
- MUST prefix composables with `use` (`useSomething.ts`).
- MUST name server routes `kebab-case` matching the resource URL.
- MUST name database tables in the repo's established convention (`TODO: confirm snake_case vs model mapping`).
- MUST name Prisma models in `PascalCase` and fields in `camelCase`, with explicit `@map`/`@@map` when the physical name differs.

## Error handling and logging

- MUST handle errors at boundaries, return safe user-facing messages, and never swallow errors silently.
- MUST log with structure and enough context to diagnose, but NEVER log secrets, tokens, passwords, or sensitive personal data.
- SHOULD throw typed/domain errors inside services and translate them to HTTP status codes at the route boundary.

## Accessibility

- MUST use semantic HTML elements for structure and controls.
- MUST ensure full keyboard operability with a visible focus state.
- MUST associate every input with a label and mark errors programmatically.
- MUST meet color-contrast requirements and not convey meaning by color alone.

## Commits and pull requests

- MUST write commit messages in a conventional style (`type(scope): summary`), imperative and concise.
- A PR description MUST state what changed, why, and how it was verified, and MUST flag any migration, config, or secret-related change.
- NEVER commit or push unless explicitly requested (`AGENTS.md` non-negotiable rules).

## Checklist

- [ ] TypeScript strict passes with no `any`; exported functions have return types.
- [ ] Names follow file, composable, route, table, and model conventions.
- [ ] Errors handled at boundaries; logs are structured and secret-free.
- [ ] UI is semantic, keyboard-accessible, labeled, and contrast-compliant.
- [ ] Commit messages are conventional; PRs describe change, rationale, and verification.
