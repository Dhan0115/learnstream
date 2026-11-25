---
name: add-api-endpoint
description: Add a Nitro API endpoint with typed validation and enforced authentication/authorization.
---

# add-api-endpoint

## name

add-api-endpoint

## description

Workflow for adding a single Nitro API endpoint under `server/api` in `<PROJECT_NAME>`, including typing, validation, authorization, and tests.

## when_to_use

Use when adding a new HTTP endpoint or changing an existing route's contract. Do NOT use to change the database schema (`add-database-migration`) or to build UI (see `add-feature`).

## inputs

- Target resource and HTTP method.
- Authentication requirement (public vs authenticated) and the authorization rule.
- Request/response shape and validation rules.
- Existing route conventions found in `server/api`.

## outputs

- A typed, validated endpoint under `server/api`.
- Service/repository functions under `server/`.
- Tests covering success, validation failure, unauthorized, forbidden, and not-found.
- Endpoint documentation when public or externally consumed.

## steps

1. Identify the resource, HTTP method, authentication requirement, and the authorization rule (who may call it and on which records).
2. Define request/response TypeScript types and a validation schema in `shared/` (environment-agnostic, `AGENTS.md` §3); follow `.agents/rules/api.md`.
3. Implement the route under `server/api/**` following the layout/naming conventions already used by existing routes (`.agents/rules/api.md`).
4. Access Prisma ONLY through a service/repository layer under `server/` (`.agents/rules/prisma.md`); NEVER import Prisma into `app/`.
5. Add tests for success, validation failure, unauthorized access, forbidden access, and not-found, per `.agents/rules/testing.md`.
6. Document the endpoint (path, method, auth, request/response, errors) if it is public or externally consumed.

## guardrails

- Every endpoint MUST authenticate when required and MUST authorize per-record access; NEVER trust client input (`AGENTS.md` §2).
- `app/` MUST NOT import Prisma or server-only modules; keep secret handling inside `server/` (`AGENTS.md` §3).
- STOP and ask the human before adding a new dependency, changing auth/authz behavior, or exposing a new public endpoint (`AGENTS.md` §6).
- Return generic error messages; NEVER leak internal errors, stack traces, or secrets to clients.

## verification

- [ ] Route enforces authentication and authorization; unauthorized/forbidden cases return correct status codes.
- [ ] Request validation rejects malformed input (validation-failure test passes).
- [ ] Tests cover success, validation failure, unauthorized, forbidden, and not-found.
- [ ] Type-check and lint pass (`.agents/rules/code-style.md`).
- [ ] Documentation updated when the endpoint is public or externally consumed.
