---
name: debug-production-issue
description: Structured investigation of a production incident or bug without exposing secrets or harming production.
---

# debug-production-issue

## name

debug-production-issue

## description

Evidence-first workflow for diagnosing and resolving a production incident in `<PROJECT_NAME>` using logs, database state, and recent changes.

## when_to_use

Use when a reproduced or reported production issue needs diagnosis (errors, data anomalies, performance regressions). Do NOT use for feature work (`add-feature`) or code review (`code-review`).

## inputs

- Symptom description and expected vs actual behavior.
- Affected users/tenants, environment, timestamps, and error IDs.
- Access to logs and (read-only) database state.
- Recent migrations and recent changes.

## outputs

- Ranked hypotheses with supporting evidence.
- A minimal, tested fix with a rollback plan.
- A clear statement of root cause and residual risk.

## steps

1. Gather symptoms, affected users, environment, timestamps, and error IDs; write a one-paragraph problem statement.
2. Form hypotheses ranked by likelihood AND blast radius; state how each would be confirmed or falsified.
3. Inspect logs, database state, recent migrations, and recent changes; NEVER expose secrets, PII, or `<DATABASE_URL>` in notes or output.
4. Reproduce locally or in a safe environment; if not reproducible, document exactly what blocks reproduction.
5. Propose the minimal fix, add or adjust a regression test, and define a rollback plan.
6. NEVER run destructive commands against production without explicit approval.

## guardrails

- Investigation MUST be read-only by default; NEVER mutate production data to "see what happens" (`AGENTS.md` §2).
- NEVER paste secrets, tokens, PII, or full connection strings into logs, prompts, or commits; redact to placeholders such as `<SUPABASE_URL>` and `<DATABASE_URL>`.
- STOP and ask the human before running any write, migration, or destructive command against production (`AGENTS.md` §6).
- If the fix touches auth, authz, RLS, or payments, require explicit approval before applying.

## verification

- [ ] Root cause supported by evidence (log lines, query results, or a reproduction).
- [ ] Regression test added and passing (`.agents/rules/testing.md`).
- [ ] Fix is minimal and scoped; unrelated code untouched (`AGENTS.md` §2).
- [ ] Rollback plan documented.
- [ ] No secrets or PII leaked in reports, logs, or commits.
