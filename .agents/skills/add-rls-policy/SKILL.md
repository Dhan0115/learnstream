---
name: add-rls-policy
description: Add or update Supabase Row Level Security policies with a safe tenant/ownership model.
---

# add-rls-policy

## name

add-rls-policy

## description

Workflow for enabling and writing Supabase Row Level Security policies on a table, ensuring the tenant/ownership boundary is enforced at the database layer in `<PROJECT_NAME>`.

## when_to_use

Use when a table needs row-level access control, or when adding a table that holds tenant- or user-scoped data. Do NOT use to change the schema (`add-database-migration`) or to implement application logic alone.

## inputs

- Target table name (`<TODO: table name>`).
- Roles involved and the ownership model.
- Tenant boundary definition (how rows map to a tenant/user).
- Whether RLS is currently enabled on the table.
- Supabase policy/apply command (`<TODO: verify in AGENTS.md §4>`).

## outputs

- RLS enabled (where appropriate) on the target table.
- Policies for SELECT, INSERT, UPDATE, and DELETE.
- Test results across representative user roles.
- Documented assumptions and security limitations.

## steps

1. Identify the table, roles, ownership model, and tenant boundary; confirm the current RLS state.
2. Enable RLS on the table where appropriate (`.agents/rules/supabase.md`).
3. Write separate policies for SELECT, INSERT, UPDATE, and DELETE; scope every policy to the ownership/tenant rule.
4. Test policies using representative user roles (owner, member, outsider, anonymous).
5. Ensure application-level authorization complements—not replaces—RLS.
6. Document assumptions (e.g. `<TODO: assumption>`) and security limitations.

## guardrails

- RLS is a required defense-in-depth layer but MUST NOT be the only authorization check; server routes MUST also authorize (`AGENTS.md` §2).
- NEVER use the Supabase service-role key in policy logic or client code; policies MUST evaluate against the caller's identity.
- STOP and ask the human before enabling or changing RLS/authz on an existing table with production data (`AGENTS.md` §6).
- Default to deny; NEVER write a policy that grants broader access than the ownership model requires.

## verification

- [ ] RLS enabled and every policy covers SELECT, INSERT, UPDATE, and DELETE.
- [ ] Tests confirm cross-tenant/cross-user access is blocked for representative roles.
- [ ] Server-side authorization still enforced alongside RLS.
- [ ] Assumptions and limitations documented.
- [ ] Change reviewed against `.agents/rules/supabase.md`.
