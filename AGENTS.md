# AGENTS.md

> Policy hub for AI agents and contributors working in this repository.
> This file contains **policy only**. Standards live in `.agents/rules/`, workflows in `.agents/skills/`, and role responsibilities in `.agents/agents/`.

---

## 1. Project overview

`<PROJECT_NAME>` is `<TODO: one-sentence product purpose — what it does and why it exists>`. It serves `<TODO: primary users, e.g. "small teams of 2–20">`, and its core domains are `<TODO: core domains, e.g. "accounts, workspaces, projects, billing">`. `<PROJECT_NAME>` is a production-grade web application built on Nuxt 4 (Vue 3 + TypeScript), Prisma ORM, and Supabase (PostgreSQL, Auth, Storage), tested with Vitest and Playwright.

---

## 2. Non-negotiable rules

These apply to every agent, on every task, without exception.

1. **NEVER commit secrets** — service-role keys, database URLs, Supabase anon keys, API tokens, or any `.env*` file.
2. **NEVER expose the Supabase service-role key to the browser.** It MUST live in server-only code.
3. **NEVER trust client input.** Validate and authorize every server mutation.
4. **NEVER modify the Prisma schema or run destructive database commands** without explicit user approval.
5. **Prefer small, reviewable changes.** Do NOT refactor unrelated code in the same change.
6. **Follow existing conventions before introducing new patterns.**

---

## 3. Tech stack and boundaries

| Path | Owns |
|---|---|
| `app/` | Vue UI: pages, components, composables, layouts, middleware, client plugins |
| `server/` | Nitro API routes, server middleware, server-only business logic |
| `shared/` | Code shared between the Vue app and the Nitro server |
| `prisma/` | Prisma schema, migrations, and database-related scripts |
| `supabase/` | Supabase configuration, SQL policies, functions, local dev files (where applicable) |

**Hard boundaries**
- `app/` MUST NOT import the Prisma client, the service-role key, or any server-only module.
- `shared/` MUST stay environment-agnostic — no Node-only or browser-only APIs.
- Anything that touches secrets or the database runs in `server/`.

---

## 4. Commands

> Confirm each command against the repository before use. Treat every `TODO` as unverified.

| Purpose | Command |
|---|---|
| Install dependencies | `TODO` |
| Run development server | `TODO` |
| Type-check | `TODO` |
| Lint | `TODO` |
| Format | `TODO` |
| Run unit tests (Vitest) | `TODO` |
| Run E2E tests (Playwright) | `TODO` |
| Create a Prisma migration | `TODO` |
| Apply Prisma migrations | `TODO` |
| Generate the Prisma client | `TODO` |
| Run Supabase local development (if applicable) | `TODO` |

---

## 5. Definition of done

A change is complete only when **all** of the following hold:

- [ ] TypeScript passes (strict mode, no new `any`).
- [ ] Lint passes.
- [ ] Relevant tests pass (unit and/or integration and/or E2E).
- [ ] New or changed server routes enforce authentication **and** authorization.
- [ ] Database changes include a reversible migration plan or a documented rollback approach.
- [ ] No secrets are added to source control.
- [ ] UI is accessible and responsive.
- [ ] Documentation is updated when architecture or workflows change.

---

## 6. When to ask the human

STOP and request explicit approval before:

- Deleting data or tables.
- Changing authentication, authorization, RLS policies, or payment logic.
- Introducing a new dependency.
- Changing environment variables or deployment configuration.
- Making irreversible database migrations.
- Handling personally identifiable information (PII), credentials, or production data.

---

## 7. Where to look next

| Need | Location |

|---|---|
| Coding standards | `.agents/rules/` |
| Task workflows | `.agents/skills/` |
| Agent role responsibilities | `.agents/agents/` |
| New-session orientation | `docs/agent-onboarding.md` |

**Rule precedence:** the human's explicit instruction > this `AGENTS.md` > the specific rule file > general convention. When rules conflict, surface the conflict instead of guessing.
