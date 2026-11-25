# API Rules

> Standards for Nitro REST routes under `server/api/`.
> Policy lives in the root [`AGENTS.md`](../../AGENTS.md). The end-to-end workflow lives in the matching skill — reference it instead of duplicating steps here.

**Related skill:** `.agents/skills/add-api-endpoint/SKILL.md` (confirm the exact skill name against the repository).

## Routes and methods

- MUST keep routes under `server/api/` with resource-oriented, plural, `kebab-case` paths (e.g. `/api/<resource>`).
- MUST map HTTP methods by intent: `GET` read, `POST` create, `PATCH` partial update, `PUT` replace, `DELETE` remove.
- SHOULD nest sub-resources (e.g. `/api/<resource>/[id]/<subresource>`) and use query params for filters.
- NEVER use a mutating method for a read or a `GET` for a write.

## Validation

- MUST validate every request body, query, and route param with a typed schema library (`TODO: confirm the repo's validation library`) using a single schema per route.
- MUST reject unknown/extra fields and coerce types explicitly.
- MUST return a validation error before touching the database.

## Response shapes

- MUST return consistent shapes: success returns the resource/payload; errors return an object with a stable machine-readable `code` and a human `message`.
- MUST use correct status codes: `200`/`201` success, `400` validation error, `401` unauthorized, `403` forbidden, `404` not found, `429` rate limited, `500` server error.
- NEVER return stack traces, internal IDs, or secret values in error responses.

## Authentication and authorization

- MUST require authentication for every mutating endpoint and re-check authorization (ownership/role) server-side.
- MUST treat client-supplied IDs and roles as untrusted input.

## Operational conventions

- MUST rate-limit sensitive or expensive endpoints where relevant and return `429` with retry guidance.
- MUST make retryable mutations idempotent (e.g. idempotency key) where duplication would be harmful.
- SHOULD paginate list endpoints and support explicit `filter`/`sort` params with validated values.
- MUST cap page size to a sane maximum.

## Logging

- MUST log structured, correlated events (request id) for failures.
- NEVER log secrets, tokens, passwords, or sensitive personal data, including in error paths.

## Checklist

- [ ] Route path and HTTP method match the resource intent.
- [ ] Input validated with a typed schema before any DB access.
- [ ] Success and error responses use consistent shapes and correct status codes.
- [ ] Every mutating endpoint enforces authentication and authorization.
- [ ] Rate limiting / idempotency / pagination applied where relevant.
- [ ] Logs contain no secrets or sensitive personal data.
