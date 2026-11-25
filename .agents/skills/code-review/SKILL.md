---
name: code-review
description: Review a change for correctness, security, authorization, data integrity, performance, accessibility, and tests.
---

# code-review

## name

code-review

## description

Structured review of a pull request or diff in `<PROJECT_NAME>`, producing classified, actionable findings against project rules.

## when_to_use

Use when the user asks to review a PR, branch, commit, or diff. Do NOT use for implementing changes (`add-feature`) or incident diagnosis (`debug-production-issue`).

## inputs

- The diff, branch, or PR under review.
- Relevant `.agents/rules/` files (`nuxt.md`, `prisma.md`, `supabase.md`, `api.md`, `testing.md`, `code-style.md`) and `AGENTS.md`.
- Context on intent and acceptance criteria.

## outputs

- Classified findings: blocker, important, suggestion, question.
- Concrete, actionable diffs or examples for each finding.
- An explicit approve / request-changes verdict.

## steps

1. Check correctness, security, authorization, data integrity, performance, accessibility, and test coverage.
2. Identify violations of project conventions (`AGENTS.md` §3 and `.agents/rules/*`).
3. Classify every finding as blocker, important, suggestion, or question.
4. Provide concrete, actionable diffs or examples; cite the file and line.
5. Do NOT approve changes that expose secrets, bypass authorization, or weaken tests.

## guardrails

- Authorization and secret-handling findings are MUST-fix blockers; NEVER approve a change that bypasses authz or exposes secrets (`AGENTS.md` §2).
- NEVER approve changes that delete or disable tests without documented justification.
- STOP and ask the human when intent is unclear or when a finding requires a product or security decision (`AGENTS.md` §6).
- Do NOT request unrelated refactors; keep scope to the change under review (`AGENTS.md` §2).

## verification

- [ ] Every finding is classified and actionable, with file/line references.
- [ ] Security, authorization, and data-integrity checks are explicitly covered.
- [ ] Test coverage for new/changed behavior confirmed (`.agents/rules/testing.md`).
- [ ] `AGENTS.md` §5 definition of done assessed.
- [ ] Clear approve/request-changes verdict given with blocking items listed.
