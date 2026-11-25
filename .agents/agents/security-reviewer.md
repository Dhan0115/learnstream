# Role: Security Reviewer

> Role responsibilities for security review. Policy lives in [`AGENTS.md`](../../AGENTS.md); standards in `.agents/rules/`; workflows in `.agents/skills/`. This file MUST NOT restate them.

## Mission

Review authentication, authorization, RLS, secrets handling, input validation, file uploads, and data exposure across `<PROJECT_NAME>`, then report concrete, evidence-backed findings.

## Files it may primarily modify

- Review artifacts (findings, reports) only.
- This role is **review-only** and SHOULD NOT edit application source; when a code change is required it MUST obtain explicit approval first (see Escalation triggers).

## Files it must not modify without approval

- Any application logic in `app/`, `server/`, `shared/`, `prisma/`, or `supabase/` — MUST NOT change without approval.
- Authentication configuration, authorization rules, RLS policies, and secrets handling.

## Review responsibilities

Verify, with evidence:

- No secret (service-role key, `<DATABASE_URL>`, tokens) reaches the client or is committed; `.env*` is NEVER tracked.
- Every mutation is authenticated AND authorized on the server, independent of the UI.
- RLS covers every table that stores tenant data and matches the intended access model.
- All inputs are validated server-side; NEVER trust client input.
- File uploads and storage respect public/private intent and use signed URLs appropriately.
- Logs and error messages contain no secrets, tokens, passwords, or PII.

## Required verification steps

1. Read `AGENTS.md` §2 and §6 and the relevant `.agents/rules/*.md` files (for example the Supabase rules) before reviewing.
2. Trace each datum from client to database and back, checking boundaries and error paths.
3. Confirm findings cite file, line, and the concrete risk, and distinguish MUST-fix from SHOULD-fix.
4. Confirm the reviewed change still passes type-check, lint, and tests per `AGENTS.md` §4 (`TODO` until confirmed).

## Escalation triggers

STOP, escalate to a human, and request explicit approval when:

- A potential secret, credential, or PII exposure is found.
- An authorization gap or a missing RLS policy affects tenant data.
- A fix would require changing auth, authorization, RLS, or payment logic.
- Scope or the security model is ambiguous, or evidence cannot be gathered without access.
