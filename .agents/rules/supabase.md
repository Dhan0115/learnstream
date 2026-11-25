# Supabase Rules

> Standards for Supabase keys, Auth, Row Level Security, and Storage.
> Policy lives in the root [`AGENTS.md`](../../AGENTS.md). Workflows live in `.agents/skills/` — reference the matching skill path instead of duplicating it here.

**Related skill:** `.agents/skills/<TODO: skill-name>/SKILL.md` (confirm the exact skill name against the repository).

## Key separation

- MUST keep the public anon key (`<SUPABASE_ANON_KEY>`) and the service-role key (`<SUPABASE_SERVICE_ROLE_KEY>`) in separate, clearly named variables.
- The anon key MAY be used in the client; the service-role key MUST NEVER be exposed to the browser.
- MUST confirm the exact variable names against the repo — placeholders here are illustrative.

## Service-role key usage

- MUST use the service-role key only in trusted server-side code (Nitro `server/`), never in `app/`.
- MUST treat any use of the service-role key as bypassing RLS, and therefore MUST re-check authorization explicitly.

## Auth vs data

- MUST use Supabase Auth for identity (sessions, tokens) and Prisma/PostgreSQL for application data, unless a documented exception applies.
- Any exception MUST be recorded with a rationale in the change's PR description.

## Row Level Security

- RLS MUST be enabled on every table holding user or tenant data and is the primary database-level authorization boundary.
- MUST write explicit policies per operation rather than relying on `USING (true)`.

### RLS policy checklist (per table)

- [ ] **Read** — who may `SELECT`, and under what ownership/role condition?
- [ ] **Insert** — who may `INSERT`, and is the owner/tenant column forced to the caller?
- [ ] **Update** — who may `UPDATE`, including which columns, and is row ownership re-asserted?
- [ ] **Delete** — who may `DELETE`, and is ownership/role asserted?
- [ ] **Ownership/role condition** — the exact predicate (e.g. `auth.uid() = owner_id`) is stated.
- [ ] **Cross-tenant prevention** — a predicate prevents reading or writing another tenant's rows.

## Server-side authorization

- MUST validate authorization in Nitro server routes even when RLS is enabled — RLS and service-role access are not a substitute for route-level checks.
- MUST treat the authenticated user as untrusted input for ownership checks.

## Storage and uploads

- MUST define each bucket's access model (public vs private) explicitly; default to private.
- MUST validate file type, size, and ownership before upload.
- MUST serve private files through time-limited signed URLs; NEVER expose private object paths publicly.
- MUST scope storage policies to the owning user/tenant like table RLS.

## Secret hygiene

- NEVER place Supabase credentials in client bundles, committed `.env*` files, logs, or error messages.
- MUST load credentials from server-only environment configuration.
- NEVER log the service-role key, JWTs, or full connection strings.

## Checklist

- [ ] Anon and service-role keys are separated; service-role stays server-only.
- [ ] RLS enabled and per-operation policies documented via the checklist above.
- [ ] Server routes re-validate authorization regardless of RLS.
- [ ] Buckets are private by default; private files served via signed URLs.
- [ ] No credentials in client bundles, Git, logs, or errors.
