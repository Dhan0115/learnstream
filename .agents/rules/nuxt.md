# Nuxt 4 Rules

> Standards for the Nuxt 4 app layer (`app/`) and the Nitro server (`server/`).
> Policy lives in the root [`AGENTS.md`](../../AGENTS.md). Multi-step workflows live in `.agents/skills/` — reference the matching skill path instead of duplicating it here.

**Related skill:** `.agents/skills/<TODO: skill-name>/SKILL.md` (confirm the exact skill name against the repository).

## Directory conventions

- MUST place all Vue UI under `app/`: `app/pages/`, `app/components/`, `app/composables/`, `app/layouts/`, `app/middleware/`, `app/plugins/`, `app/utils/`.
- MUST place server-only code under `server/`: routes in `server/api/`, cross-cutting logic in `server/middleware/`, helpers in `server/utils/`.
- MUST place environment-agnostic code shared by app and server under `shared/`.
- `shared/` MUST NOT import Node-only or browser-only APIs.
- NEVER create top-level `pages/`, `components/`, or `composables/` outside `app/`.

## Routing and naming

- File paths define routes; MUST rely on Nuxt file-based routing rather than hand-rolled router config.
- Component files MUST use `PascalCase.vue`; composables MUST use `useSomething.ts`; pages and server routes MUST use `kebab-case` matching the URL segment.
- Dynamic segments MUST use `[param]`; catch-all MUST use `[...param]`; nested layouts MUST be expressed through `app/pages` + `definePageMeta`.

## Data fetching

- SHOULD use `useFetch`/`useAsyncData` in components and pages for SSR-aware, deduplicated data.
- SHOULD use `$fetch` only for event-driven or client-only calls, never as the primary SSR loader.
- MUST keep secrets, database access, and third-party privileged calls inside `server/api/` routes; the client MUST call those routes.
- MUST handle SSR-safe access: guard browser-only APIs (`window`, `document`, `localStorage`) so they run client-side only.

## Components and composables

- Component names MUST be multi-word and descriptive; props MUST be typed with `defineProps<Props>()`.
- Emits MUST be declared and typed with `defineEmits<Emits>()`; slots SHOULD be documented where a component is reused.
- MUST forward `v-bind="$attrs"` / use `inheritAttrs` deliberately when wrapping native elements.
- Composables MUST start with `use`, return a typed object, and encapsulate a single concern.

## Server-only boundaries

- `app/` MUST NOT import the Prisma client, Supabase service-role key, or any module from `server/`.
- MUST read secrets via runtime config / server-only env access inside `server/`; NEVER reference them in `app/`.
- MUST treat anything prefixed for public exposure as non-secret.

## UX: errors, loading, empty states

- MUST surface loading state for any async data and prevent flash-of-empty content.
- MUST render an explicit empty state when a collection is legitimately empty.
- MUST show user-facing error messages that are actionable and free of stack traces, internal IDs, or secret values.
- SHOULD use `app/error.vue` / `createError` for route-level errors with correct HTTP status codes.

## Checklist

- [ ] Files are in the correct `app/`, `server/`, or `shared/` directory.
- [ ] No server-only import leaks into `app/`; no secret reaches the client.
- [ ] Data loading uses `useFetch`/`useAsyncData` (SSR-aware) and handles loading/empty/error.
- [ ] Props, emits, and composables are fully typed.
- [ ] User-facing errors are safe and actionable.
