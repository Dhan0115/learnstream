# LearnStream — Design Spec (Design of Record)

> **Status: APPROVED — design of record.** The owner approved this spec and the Slice 1 start.
> This file is the **design of record** referenced by
> [design_layout.md](./design_layout.md) §1: the single source of truth for structure, spacing,
> typography, colour, components, breakpoints and states.
>
> **Theme:** Nuxt UI (`@nuxt/ui` v4) — palettes from Nuxt UI only (`primary: indigo`,
> `secondary: teal`, `neutral: slate`). Every colour, radius and shadow comes from a
> Nuxt UI token. No custom palette, font or icon set is introduced.
>
> **Stack:** Vue 3 + Vite + TypeScript, `vue-router`, Tailwind 4, SCSS per [sass.md](./sass.md).
> **Naming:** BEM per [bem-convention.md](./bem-convention.md).

---

## 1. Design foundations

### 1.1 Colour

All colour is **Nuxt UI semantic tokens** — no hex values anywhere. Exact token availability is
confirmed against the installed `@nuxt/ui` version at the Step 1 gate.

| Role | Token | Used for |

|---|---|---|
| Primary | `var(--ui-primary)` | CTAs, active nav, links, focus ring, selected state |
| Secondary | `var(--ui-secondary)` | Accent highlights that must not compete with the primary CTA |
| Surface | `var(--ui-bg)` | Page and card background |
| Raised surface | `var(--ui-bg-elevated)` | Header on scroll, modals, dropdowns |
| Muted surface | `var(--ui-bg-muted)` | Section bands, inputs, skeleton placeholders |
| Text | `var(--ui-text)` | Body copy |
| Highlighted text | `var(--ui-text-highlighted)` | Headings |
| Muted text | `var(--ui-text-muted)` | Metadata, counts, helper text |
| Border | `var(--ui-border)` | Card edges, dividers, input outlines |
| Error | `var(--ui-error)` | Validation, destructive action |
| Success | `var(--ui-success)` | Upload success |
| Radius | `var(--ui-radius)` | Base corner radius, with Tailwind `rounded-*` steps |

### 1.2 Typography

Tailwind's default scale and the Nuxt UI font stack — **no new family, no new scale.**

| Element | Utilities | Notes |

|---|---|---|
| Hero headline | `text-3xl md:text-4xl font-bold` | `--ui-text-highlighted` |
| Page title | `text-2xl md:text-3xl font-bold` | Page block `__title` |
| Section heading | `text-xl md:text-2xl font-semibold` | `.section-header__title` |
| Card title | `text-base font-semibold` | `.video-card__title`, `.subject-card__title` |
| Body | `text-base` / `text-sm` | `--ui-text` |
| Meta | `text-sm` | `--ui-text-muted` |
| Badge / label | `text-xs uppercase tracking-wide` | `.video-card__badge` |

Line height stays Tailwind default (`leading-tight` for headings, `leading-relaxed` for descriptions).

### 1.3 Spacing, radius, elevation

- **Spacing:** Tailwind scale only (`p-4`, `gap-6`, `space-y-10`). No ad-hoc pixel values.
- **Vertical rhythm:** page sections `py-10 md:py-16`; card padding `p-3 md:p-4`.
- **Radius:** `rounded-md` controls, `rounded-lg` cards, `rounded-xl` hero/media surfaces.
- **Elevation:** borders first (`border border-[var(--ui-border)]`); shadow only on
  `--scrolled` header, dropdowns and modals — Nuxt UI defaults.
- **Container:** `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.

### 1.4 Breakpoints (mobile-first)

Tailwind defaults: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
Written with the `up()` mixin in Sass and `sm:`/`md:`/`lg:` utilities in templates.

### 1.5 Motion

`transition-colors duration-150` / `transition-transform duration-150` for hover and focus only.
No entrance animations, no gradients, no decorative motion. `prefers-reduced-motion` disables transitions.

---

## 2. Information architecture

| Route | Page block | Purpose |

|---|---|---|
| `/` | `.home` | Discover: hero, search, subjects, featured, recent, CTAs |
| `/browse` | `.browse` | All subjects grid |
| `/subjects/:slug` | `.browse` | One subject's lesson list |
| `/search?q=` | `.browse` | Search results across title/subject/tags/description |
| `/watch/:id` | `.watch` | Player + metadata + actions + related + comments |
| `/saved` · **account** | `.saved` | A learner's saved lessons, with the date each was saved |
| `/upload` · **account** | `.upload` | Guided upload flow (educator roles only) |
| `/dashboard` · **account** | `.dashboard` | Uploader stats, own videos, drafts |
| `/login` | `.auth` | Sign in to an account |
| `/signup` | `.auth` | Create an account |
| `/inbox` · **account** · **staff** | `.inbox` | A teacher's conversations with their students |
| `/404` (catch-all) | `.empty-state` | Friendly not-found page |

**account** routes are guarded (`meta.requiresAuth`): a visitor without a session is sent to
`/login?redirect=…` and returned to the page they asked for once they have an account. **staff**
routes add `meta.requiresStaff` and send anyone who cannot publish back to `/` — the inbox is the
other side of the student-facing `.chat-widget`. Watching, browsing and searching stay open to
everyone.

Every route carries a `title` and a `description` in its `meta` block, applied to the document head
on navigation (§4.8).

---

## 3. Global shell

### 3.1 `.app-header`

| Element | Content |

|---|---|
| `__logo` | Wordmark "LearnStream", links to `/` |
| `__nav` | Browse · Subjects · Saved, plus Dashboard and Inbox for educator accounts |
| `__account` | Signed in: `__avatar` + `__name` + `__signout`, and `__upload` for educators. Signed out: `__signin` and `__signup`. |

Modifiers: `--scrolled` (raised surface + border), `--menu-open` (mobile panel).
`__menu-toggle` is visible below `md` only. Sticky top, `z-40`.
`__signin`, `__signup` and `__signout` live in the mobile panel below `sm`.

The header carries **no search field** (decision 20): discovery belongs to the page, not the shell, so
the search bar lives in `.home__search` (§4.1) and in the `.browse` filters (§4.2).

### 3.2 `.app-footer`

`__brand`, `__columns` (Learn · Subjects · About), `__meta` (copyright, `--ui-text-muted`).
Regions are semantic `<header>` / `<nav>` / `<main>` / `<footer>` landmarks.

### 3.3 `.chat-widget`

The live-chat launcher — the widget is part of the shell, not of any page, so it is mounted once in
`src/App.vue` and survives navigation. It sits **bottom-left**, opposite the reading edge, and is
`position: fixed; z-50`.

| Element | Content |
|---|---|
| `__toggle` | Icon-only round button, `--ui-primary` fill. `aria-label` names the action, `aria-expanded` mirrors the panel, `aria-controls` points at the panel's id, and the `.icon` glyph is `chat` (open) / `close` (open state) |
| `__badge` | Unread count on the toggle. Renders only when the count is above zero, and the count is repeated in the button's `aria-label` so it is not colour-only |
| `__panel` | Anchored card above the toggle: `22rem` wide, `$color-surface-elevated`, `1px $color-border`, `$radius-xl`, elevated shadow |
| `__head` | `h2` title ("Chat with us" / "Your inbox") + `__close` icon button |
| `__list` | The message log, oldest first, scrolled to the newest line. `role="log"`, `aria-busy` while loading |
| `__item` | One message: `__meta` (`__author` + relative time) above `__text`. Modifier `--own` right-aligns and tints what the viewer wrote |
| `__empty` | "No messages yet" placeholder before the first line |
| `__error` | `role="alert"` sentence when the thread or a send fails |
| `__form` | `__input` (single-line `<input>`, real `<label>` for assistive tech only) + `__send` icon button, disabled while empty or in flight |
| `__signin` | Signed-out state: a sign-in link, replacing the form |
| `__staff-inbox` | For staff, the thread area is replaced by a link to `/inbox` — staff answer from the page, never from the widget |

Modifier `--open` on the block toggles the panel. Below `sm` the panel spans the viewport width
minus the gutters rather than a fixed `22rem`; the toggle is never hidden, so a student can always
reach support.

---

## 4. Page specifications

### 4.1 `.home`

| Order | Region | Contents |

|---|---|---|
| 1 | `__hero` | Headline "Learn any subject through clear, engaging video lessons.", one-line subcopy, CTA row: **Browse Subjects** (solid), **Start Learning** (outline), **Upload a Video** (ghost → gated) |
| 2 | `__search` | Full-width `.search-bar` with placeholder "Search videos, subjects, topics…" |
| 3 | `__subjects` | `.section-header` + grid of `.subject-card`: Mathematics, Science, Programming, History, Languages, Business, Art, Test Preparation |
| 4 | `__featured` | `.section-header` ("Popular Lessons") + grid of `.video-card` |
| 5 | `__recent` | `.section-header` ("Recently Uploaded") + grid of `.video-card --compact` |
| 6 | `__cta` | Teacher band: "Share what you know" + **Upload a Video** |

Grid: 1 col → `sm:2` → `lg:4` for subjects; 1 → `sm:2` → `lg:3` for videos.

### 4.2 `.browse`

`__heading` (subject name or "Results for “q”"), `__filters` — **Subject**, **Uploaded**
(Any time · Past week · Past month · Past year) and **Sort by** (Newest · Most viewed · Most liked ·
Top rated) — `__grid` of `.video-card`, `__count`. Filters combine: subject ∩ upload date ∩ search.
Empty result → `.empty-state`. Pagination: `__pagination` (12 per page). The grid shows
`.video-skeleton` placeholders while results resolve.

**Top rated** ranks by like share (likes ÷ all votes), then by like count, so a lesson with a single
vote cannot outrank a strongly rated one with many.

### 4.3 `.watch`

| Region | Contents |

|---|---|
| `__player` | `.video-player` — play/pause, volume/mute, fullscreen, speed (0.5×–2×), seek bar, captions toggle |
| `__title` | Video title |
| `__channel` | Uploader name + avatar + subscribe-style follow button |
| `__actions` | `.watch__action` buttons: Like (`count`), Dislike (`count`), Save (toggles), Share |
| `__description` | Expandable (`is-expanded`), shows what the viewer will learn |
| `__chapters` | Named sections of a longer lesson (`0:00 Introduction`), each seeking the player; rendered only when the uploader added chapters |
| `__transcript` | Every caption cue with its start time, each seeking the player; rendered only when a caption track was uploaded |
| `__tags` | `.tag-list` — subject badge + keyword tags |
| `__meta` | View count · published date · duration |
| `__related` | "More videos in this subject" — `.video-card --compact` list |
| `__comments` | `.comment-section` — list + form; `--empty` when none |

Layout: single column below `lg`; player full width; `lg` → player + related in a 2/3 + 1/3 grid.

View counting: opening a lesson counts one view, recorded as a `View` row and folded into the
lesson's `viewCount` in the same transaction. The row carries a salted hash of the viewer's address
and user agent, never the address itself, and a repeat view of the same lesson inside a 30-minute
window — a refresh, a back-and-forth, or a second tab — is ignored, so rapid reloads cannot inflate
`__meta`. The count the API returns is the one rendered; the page never adds a local `+1`.

States: `loading` (a `.watch__loading` status line), `missing` (the lesson is unknown, or is still
processing and the viewer is neither its uploader nor an administrator → 404, shown through `.empty-state`), and `error`
(the request itself failed, with a retry path). The related rail loads separately, so a failure
there leaves the lesson playable.

Actions: Like, Dislike and Save belong to an account. For a signed-out visitor the click is a
sign-in prompt — the router sends them to `/login?redirect=/watch/:id` and returns them here — and
one account holds at most one reaction per lesson (`@@unique([videoId, userId])`), so choosing the
other replaces it rather than adding a second vote. Each action is a server call; a failure is
shown in `__action-error` (`role="alert"`) instead of being swallowed, and the counts on screen come
from the response.

Video management: the uploader and administrators see **Edit video** and **Delete video** below
the title. `PUT /api/videos/:id` replaces the title, description, subject (`subjectSlug`) and tags
and returns the updated `video`. It cannot replace the media or transfer ownership. Deletion asks
for confirmation; `DELETE /api/videos/:id` returns 204 and removes the lesson, dependent records
and local media. Both routes require a session (401), verify ownership or admin status (403),
and reject missing lessons (404). Invalid edit fields return 400.

### 4.4 `.upload` (gated: `role === 'teacher' || 'admin'`)

| Step | Element | Requirements |
|---|---|---|
| 1 | `__dropzone` (`.dropzone`) | Drag-and-drop or browse; accepts MP4/WebM; rejects others with `has-error` + message |
| 2 | `__progress` | `.progress-bar` driven by the upload's own byte progress |
| 3 | `__fields` | **Title** (required, 3–140), **Description** (required, 10–5000), **Subject** (required select), Tags (optional, max 8), Thumbnail (optional), Chapters (optional), Captions (optional) |
| 4 | `__preview` | Preview panel: thumbnail, title, description, subject, tags |
| 5 | `__status` | `is-uploading` / `is-success` / `has-error` messages |

The form is sent as one multipart request to `POST /api/videos`, which is the single authority on
what is acceptable: it rejects a payload over 256 MB with **413**, a file that is not MP4 or WebM
with **415**, and an account without an educator role with **403**. The page mirrors the field rules
(title ≥ 3, description ≥ 10, subject chosen) so a visitor cannot spend a long upload only to be
refused at the end, and it shows the server's own sentence for anything the server rejects.

The server writes the file to the media root, creates the lesson as `processing`, then flips it to
`published`; a failure anywhere removes the file it wrote. Afterwards `__status` names where the
lesson now appears (dashboard, browse, search).

Enhancements (decision 16): a caption file travels in the same request as the `transcript` part and
must be WebVTT or SubRip (**415** otherwise), and the chapter list travels as the `chapters` text
field, one section per line. Both are parsed on the server into `Caption` and `Chapter` rows; a
caption file with no timed cues, or chapter text that names no section, is refused with **400**
before it is stored. The page mirrors the chapter format so a mis-typed list is caught before the
video is sent.

Auto-thumbnail: if no image is provided, the poster is derived from the video's first frame.
An account without an educator role sees `.empty-state` explaining the requirement; a visitor
without a session is sent to sign in before the page renders.

### 4.5 `.dashboard`

`__profile` (avatar, name, role, saved-count link, Upload CTA when the role allows), `__stats`
(lessons, total views, total likes, total dislikes), `__tabs` (My Videos · Drafts), `__videos`
(`.video-card` grid with status badge), `__empty`. The lessons come from
`GET /api/videos?uploader=me`, which includes ones still processing and is scoped by the session, so
a dashboard can only ever show its owner's work. Published uploads appear in search and browse
immediately. A learner's saved lessons live on `.saved` (§4.6).

### 4.6 `.saved`

`__heading` (`.page-heading`, "Saved lessons" + lesson count), `__grid` of `.video-card` — thumbnail,
title, subject badge, and a `__note` line reading "Saved {relative date}" — plus `__error`
(`role="alert"`) and `.empty-state` when nothing is saved. `.video-skeleton` placeholders cover the
grid while it resolves.

The saved list is held as ids with the date each was kept, so each card is fetched from the API. A
lesson that no longer resolves is dropped quietly; only an all-fail result is reported as a
connection error, so one removed lesson never looks like an outage. The route is guarded, so a
visitor without a session signs in first.

### 4.7 `.auth` (serves `/login` and `/signup`)

One narrow centered card, `max-width: 26rem`. Regions:

| Element | Contents |

|---|---|
| `__title` | "Welcome back" or "Create your account" |
| `__subtitle` | One line on what an account is for |
| `__error` | `role="alert"` message from `useSession`, shown above the form |
| `__form` | `__field` (label + input) for **Email** + **Password**, plus **Display name** on sign-up |
| `__roles` | Sign-up only: a `fieldset`/`legend` of two `__role` radio rows — Learner · Educator |
| `__submit` | `UButton size="lg"`, full width, `:loading` while the request is in flight |
| `__switch` | Link across to the other route (`/login` ⇄ `/signup`) |
| `__hint` | Password rule: at least 8 characters, stored as a salted hash |

After success the account exists in the database and the server returns an HTTP-only session cookie,
so the visitor lands on `redirect` (the guarded page they asked for) or `/dashboard`. The password is
never echoed or logged; validation errors come from the API so the page and the server cannot
disagree.

### 4.8 Page metadata (SEO)

The site is a single-page application, so the head is written from the client, and every route must
still say what it is. `src/composables/usePageMeta.ts` owns two tags:

| Tag | Source |
|---|---|
| `<title>` | the route's `meta.title`, or the view's own subject once its data has loaded |
| `<meta name="description">` | the route's `meta.description`, likewise replaced by the view's own |

Rules:

- Every route in the table (§2) declares both. A view whose content comes from the API — a lesson, a
  search, a subject list — calls `setPageMeta` again once that content has resolved, so the specific
  title always beats the generic route wording.
- The title reads `{page} · LearnStream`; a page with no title falls back to the site name alone.
- The description is collapsed to single spaces and clipped to 160 characters at a word boundary
  with an ellipsis, because that is roughly what a search result shows.
- The lesson page is the one most likely to be reached from a search: its title names the lesson and
  its subject, and its description names the uploader and opens with the lesson description.
- A lesson that cannot be shown sets "Lesson not found" rather than leaving a stale title.

Honest limitation: this is a client-rendered head. Crawlers that execute JavaScript index it; ones
that do not see only the shell in `index.html`. Making the head server-rendered would mean rendering
the app on Nitro, which this slice does not do (§8.13).

### 4.9 `.inbox` (gated: `role === 'teacher' || 'admin'`)

The staff side of the chat (§3.3). Two columns above `lg`, a stacked list-then-thread below it.

| Area | Element | Requirements |

|---|---|---|
| Heading | `.page-heading` | Title "Inbox", subtitle naming how many conversations are waiting |
| Conversation list | `__conversation` | `__who` (student name), `__preview` (last line, truncated to one line), `__when` (relative), `__unread` (count pill). `--active` marks the open thread, `--unread` raises an unread row |
| Thread | `__thread` | `__thread-head` (student name), `__messages` (`role="log"`), `__message` with `__meta` + `__text`, `__form` with `__input` + `__send` |
| Empty | `__empty` | "No conversations yet" before any student has written; "Pick a conversation" in the thread pane |
| Failure | `__error` | `role="alert"` paragraph — a list that cannot load is never a blank pane |

Opening a conversation marks it read for staff; the unread pill then clears, and the student's own
badge clears when they open the widget. The order of the list is `lastMessageAt` descending, so the
newest question is always at the top.

---

## 5. Component inventory (BEM blocks)

Existing blocks from [bem-convention.md](./bem-convention.md) §4 are **reused**; new blocks follow the same rules.

| Block | Elements | Modifiers / state |

|---|---|---|
| `.app-header` | `__logo` `__nav` `__account` `__upload` `__identity` `__avatar` `__name` `__signin` `__signup` `__signout` `__menu-toggle` | `--scrolled` `--menu-open` |
| `.app-footer` | `__brand` `__columns` `__meta` | — |
| `.skip-link` | — | — |
| `.icon` | — | — |
| `.search-bar` | `__input` `__icon` `__submit` | `--compact` `has-error` |
| `.subject-card` | `__icon` `__title` `__tagline` `__count` | `--active` |
| `.video-card` | `__thumb` `__thumb-fallback` `__body` `__title` `__meta` `__badge` `__note` `__status` | `--featured` `--compact` |
| `.video-skeleton` | `__thumb` `__line` | `__line--short` |
| `.video-player` | `__stage` `__controls` `__seek` `__caption` `__poster-fallback` | `--fullscreen` `--muted` `is-playing` |
| `.comment-section` | `__list` `__item` `__form` `__signin` | `--empty` |
| `.section-header` | `__title` `__action` | — |
| `.tag-list` | `__item` | — |
| `.empty-state` | `__icon` `__title` `__text` `__action` | — |
| `.dropzone` | `__input` `__hint` `__preview` `__clear` | `is-dragging` `has-error` `--compact` |
| `.progress-bar` | `__track` `__fill` `__value` | `--success` `--error` |
| `.stat-tile` | `__value` `__label` `__icon` | — |
| `.page-heading` | `__title` `__subtitle` `__count` | — |
| `.auth` | `__card` `__title` `__subtitle` `__error` `__form` `__field` `__label` `__input` `__hint` `__roles` `__legend` `__role` `__role-text` `__role-label` `__role-hint` `__radio` `__submit` `__switch` `__switch-link` | `__role--active` |
| `.chat-widget` | `__toggle` `__badge` `__panel` `__head` `__title` `__close` `__list` `__item` `__meta` `__author` `__text` `__empty` `__error` `__form` `__input` `__send` `__signin` `__staff-inbox` | `--open` `__item--own` |
| `.inbox` | `__list` `__conversation` `__who` `__preview` `__when` `__unread` `__thread` `__thread-head` `__messages` `__message` `__meta` `__text` `__form` `__input` `__send` `__empty` `__error` | `__conversation--active` `__conversation--unread` `__message--own` |

Every block ships with default, hover, `focus-visible`, disabled and loading/empty states.

Server-backed views each carry their own state elements, named after the block they belong to:
`.watch__loading` · `.watch__action-error`, `.browse__error`, `.saved__error`, `.dashboard__status`.
Each is a plain message — an `aria-busy` status line while loading, a `role="alert"` paragraph on
failure — never a silent no-op.

---

## 6. Accessibility

- Semantic landmarks; one `<h1>` per page; ordered heading levels; skip-to-content link.
- All images have `alt`; decorative icons `aria-hidden`.
- Player: keyboard-operable controls, visible focus ring (`--ui-primary`), captions toggle,
  transcript panel below the player.
- Icon-only buttons have `aria-label`.
- Contrast meets WCAG AA via Nuxt UI tokens; state is never colour-only (icon + text).
- Touch targets ≥ 44px on mobile; forms have real `<label>`s and inline error text with `aria-describedby`.
- Respect `prefers-reduced-motion`.
- Lesson grids render `.video-skeleton` placeholders inside a list marked `aria-busy` with a label;
  the skeleton itself is `aria-hidden`, and its pulse stops under `prefers-reduced-motion`.
- The chat widget is reached by one labelled toggle (`aria-expanded` / `aria-controls`); `Escape`
  closes the panel and focus returns to the toggle. Both message logs are `role="log"`, so an
  arriving reply is announced without moving focus. An unread count is also spoken, never conveyed by
  colour alone.
- Chat messages obey the same `prefers-reduced-motion` rule and the same 44px touch targets as the
  rest of the app.

---

## 7. Data model

The catalog lives in a real database. `prisma/schema.prisma` is the schema of record; SQLite is the
development provider (`DATABASE_URL=file:./dev.db`), and moving to PostgreSQL is a provider swap plus
a migration. `prisma/seed.ts` (`pnpm db:seed`) reproduces the seeded catalog from `src/data/*.ts`,
which hold the seed source in the same shape the API serves. Beyond the one `teacher` account per
seeded uploader, the seed also creates a single `admin` (`admin@learnstream.test`, development
password) — sign-up deliberately never offers that role, so this is the only way one exists.

| Model | Fields | Notes |

|---|---|---|
| `User` | `id, email (unique), name, passwordHash, role, createdAt` | `role` is `learner` \| `teacher` \| `admin`. SQLite has no enums, so it is a string validated at the API boundary |
| `Session` | `id, userId, createdAt, expiresAt` | `id` **is** the opaque token in the HTTP-only cookie; deleting the row signs the account out |
| `Subject` | `id, slug (unique), name, icon, tagline` | `videoCount` is **derived** from the catalog, never stored |
| `Tag` | `id, slug (unique), name` | Many-to-many with `Video` |
| `Video` | `id, title, description, status, viewCount, likeCount, dislikeCount, createdAt, updatedAt, subjectId, uploaderId` | counters are denormalised so the database can sort by popularity; every write to a counter happens in the same transaction as the row it counts |
| `VideoMetadata` | `videoId, storageKey, fileName, mimeType, sizeBytes, thumbnailUrl, thumbnailKey, durationSec, width, height` | kept apart so listing the catalog never reads blob-ish columns |
| `View` | `id, videoId, userId?, viewerKey, createdAt` | `viewerKey` is a salted hash of address + user agent; indexed on `(videoId, viewerKey, createdAt)` for the dedupe window |
| `Reaction` | `id, videoId, userId, kind, createdAt, updatedAt` | `kind` is `like` \| `dislike`; `@@unique([videoId, userId])` allows one vote per person per lesson |
| `SavedVideo` | `id, videoId, userId, savedAt` | `@@unique([videoId, userId])` |
| `Comment` | `id, videoId, userId?, authorName, body, createdAt` | `authorName` is snapshotted so a comment keeps its author's name |
| `Caption` | `id, videoId, position, start, end, text` | timed cues, ordered by `position`, never by timestamp |
| `Chapter` | `id, videoId, position, startSec, title` | named sections of a longer lesson |
| `Conversation` | `id, userId (unique), createdAt, updatedAt, lastMessageAt, studentReadAt?, staffReadAt?` | one support thread per account, so a learner never picks which one to open; `lastMessageAt` orders the staff inbox without joining messages, and the two read markers are what an unread count is computed from |
| `ChatMessage` | `id, conversationId, authorId, authorName, fromStaff, body, createdAt` | one line of a support conversation; `authorName` is snapshotted like a comment's, and `fromStaff` is the side the line came from, which is what makes "unread for me" answerable |

Nothing in the browser is authoritative any more. `localStorage` keeps the theme preference and
nothing else; identity travels as the session cookie, and every list, count and reaction is read
from and written to the database.

---

## 8. Decisions (confirmed)

1. **Video sources.** Confirmed: **placeholder + poster.** Seeded lessons carry an empty placeholder
   `src` and render the generated 16:9 poster; the player shows an explicit "demo lesson" state.
   No sample MP4s are added to the repo.
2. **Primary hue.** Confirmed (**changed by owner, 2026-11-18**): Nuxt UI `primary: 'indigo'` with
   `secondary: 'teal'` and `slate` neutrals, set through the `ui()` plugin in `vite.config.ts`
   (`ui({ ui: { colors: { primary: 'indigo', secondary: 'teal', neutral: 'slate' } } })`).
   The hues are still Nuxt UI palettes — no custom palette, hex value or CSS override is added.
3. **Site name** "LearnStream" (from `package.json`).
4. **Dark mode.** Confirmed: **included** as a header toggle, persisted to `localStorage`.
5. **Container width** `max-w-7xl` (equivalent to Nuxt UI's `--ui-container: 80rem`).
6. **Comments** are rows in the database, posted through the API and listed per lesson. `authorName`
   is snapshotted at post time. A signed-out visitor sees the list and a sign-in prompt instead of
   the form.
7. **Subject icons.** Subject tiles use a **monogram** tile (the subject's initial) instead of an
   SVG icon set, so the app depends on no icon collection. Recorded as `.subject-card__icon`.
8. **Iconography.** A single dependency-free `.icon` block renders every inline SVG the UI needs —
   search, menu, close, sun, moon, play, pause, volume, maximize, chevrons, clock, eye, upload, user,
   check, alert, bookmark, heart, thumbs-down, share, lock, sparkles, composite, mic and captions.
   No iconify collection is added. Sign in / sign up are worded buttons, not icons.
9. **Catalog reads.** Every list is asked of the API, so the screen and the database can never
   disagree. The browser keeps one small read cache (`useCatalog.videoCache`) so a lesson already on
   screen — a list card, an open detail page, a related rail — can be read synchronously and its
   counters patched after a vote, instead of being refetched. It is a cache, not a source of truth.
10. **Accounts.** Confirmed (**owner, 2026-11-18**): **sign-in is required** for `/saved`, `/upload`
    and `/dashboard`; browsing, searching and watching stay open. Accounts are created through
    `/signup` and stored in the `User` table. The header role switcher is gone — a role comes from the
    account: `learner` watches and saves, `teacher` and `admin` also publish.
11. **Password and session handling.** A password is never stored, echoed, prefilled or logged. It is
    hashed with **scrypt** and stored as `salt:hash`; sign-in compares with a timing-safe check. The
    session is 256 bits of random token, held only as an HTTP-only cookie (`learnstream_session`), so
    no script can read it. This is server-side authentication, unlike the earlier browser-only demo.
12. **Backend shape.** Confirmed (**owner, 2026-11-18**): the API is **Nitro route handlers in this
    repository** (`server/api/…`), reading and writing through Prisma. There is no external backend
    service and no browser-side service key. The frontend calls `/api/*` same-origin.
13. **Storage and streaming.** Confirmed (**owner, 2026-11-18**): uploaded files are written to a
    **media root on local disk**. Storage keys are generated by the server, never taken from the
    request, so a key cannot escape the root. `server/routes/media/[...key].ts` serves them back with
    **HTTP range** support, which is what makes seeking work; no video byte passes through the API
    handlers. Swapping the media root for object storage later changes `server/utils/storage.ts` only.
14. **Uploads.** One multipart request to `POST /api/videos`. The server is the only authority: size
    (256 MB), type (MP4/WebM) and every field are validated server-side, and the role gate is applied
    there too. The lesson is created as `processing`, flipped to `published` once the file is safely
    written, and the file is removed again if anything fails.
15. **View dedupe window.** 30 minutes per hashed viewer key (§4.3).
16. **Enhancements in scope.** Confirmed (**owner, 2026-11-18**): of the "if time permits" list,
    **captions / transcript upload** and **video chapters** are in scope. Playlists, progress
    tracking, quizzes, creator analytics and moderation tooling are not.
17. **SEO is client-rendered.** Recorded honestly in §4.8: the head is written after the app renders.
    Server-rendering the head would mean rendering the SPA on Nitro, which is not part of this work.
18. **Live chat.** Confirmed (**owner, 2026-11-23**): a student talks to the teacher through one
    floating launcher (§3.3) and the teacher answers from `/inbox` (§4.9). Real time travels over
    **Server-Sent Events** on `GET /api/chat/stream` — a one-way push over the Nitro server that
    already runs here, so the feature adds **no dependency, no second server and no configuration
    change**, which a WebSocket transport would have required. Sending is an ordinary `POST`. The
    event bus is in-process, so it reaches every request served by the same Nitro instance; running
    several instances behind a load balancer would need a shared bus (or Postgres
    `LISTEN`/`NOTIFY`), which this slice deliberately does not add.
19. **Who may chat.** Confirmed (**owner, 2026-11-23**): a conversation belongs to a **signed-in
    account** — there is no guest identity to invent or police. Staff are the existing `teacher` and
    `admin` roles, so chat introduces no new role and no change to the authorization model.
20. **No search in the header.** Confirmed (**owner, 2026-11-23**): the shell's search field is
    **removed** (§3.1) — the header is identity and navigation only, and the account cluster is
    pushed right by its own `margin-left: auto` rather than by a flexible search field. Discovery
    still works, because the search bar is where a searcher already is: `.home__search` on `/`
    (§4.1) and the `.browse` filters on `/browse` and `/search` (§4.2). `.search-bar` itself is
    unchanged and both its uses remain.
21. **The multipart reader behind the upload.** Recorded (**owner, 2026-11-24**): `POST /api/videos`
    (§4.4) reads its body with h3's `readFormData` — the native, streaming multipart parser — and no
    longer with `readMultipartFormData`. h3 1.15's own parser holds every byte of the file in a
    JavaScript array and then copies it again to build the part, so a lesson-sized video threw
    `Invalid array length` and the endpoint answered **500 "Server Error"** while the file was still
    well inside the declared 256 MB limit. The limit itself is unchanged, as are the
    `content-length` pre-check and the per-file check that both answer **413** with a readable
    sentence. Verified with a 150 MB and a 250 MB upload, both of which now publish.
22. **Where a lesson's duration comes from.** Recorded (**owner, 2026-11-24**): the length under a
    thumbnail was showing **0:00** because `POST /api/videos` (§4.4) never wrote `durationSec`, so
    `VideoMetadata.durationSec` fell back to its schema default of `0` for every upload. The browser
    already measures the true value in `Upload.vue`'s `readDuration()`, so the upload form now sends
    it as a `durationSec` part; the endpoint validates it with the upload-only `durationField` (a
    whole, non-negative number of seconds, capped at 24 h, and `0` when a client sends nothing) and
    stores it. It is deliberately **not** part of `videoFieldsSchema`, which the edit endpoint reuses
    with `.strict()` and where duration is never typed. The nine lessons already on disk were
    back-filled from their own files. Verified: an upload sending `212` returned `durationSec: 212`,
    and an upload sending nothing still returned `0`.

---

## 9. Build slices (after approval)

1. **Slice 1 — foundations + shell + Home.** `src/assets/scss/` layer, `@` Vite alias, `.app-header`,
   `.app-footer`, `/` with all six regions, seeded data layer, generated image assets.
2. **Slice 2 — discovery.** `/browse`, `/subjects/:slug`, `/search`, `.subject-card` + `.video-card` states.
3. **Slice 3 — watch.** `/watch/:id`, `.video-player`, actions, related, `.comment-section`, transcript.
4. **Slice 4 — upload + dashboard.** `.dropzone`, progress, preview, validation, `/dashboard`, gating.
5. **Slice 5 — engagement + accounts.** Palette and view counting, Top rated / upload-date filters,
   `.video-skeleton` loaders, `/saved`, `.auth` sign-up and sign-in with guarded routes (§4.7).

Slices 1–5 above are the interface built on the in-browser data layer described in the original
brief. Slices 6 onward replace that layer with the real backend (decisions 12–15).

6. **Slice 6 — schema and database.** `prisma/schema.prisma` for every model in §7, the SQLite
   datasource, generated client, and `prisma/seed.ts` so `pnpm db:seed` reproduces the catalog.
7. **Slice 7 — server foundation.** Nitro `srcDir: server`, Prisma singleton, error helper with one
   JSON error shape, `zod` validation schemas, serialisers (`toVideoDto`, `toSubjectDto`,
   `toCommentDto`), scrypt password helpers, subject/video read helpers.
8. **Slice 8 — auth API.** `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/auth/signout`,
   `GET /api/me`. Session rows, the HTTP-only cookie, and the role gate helper.
9. **Slice 9 — catalog API.** `GET /api/subjects`, `GET /api/videos` (subject, search, sort, range,
   uploader), `GET /api/videos/:id`, `GET /api/videos/:id/related`, `GET /api/health`.
10. **Slice 10 — engagement and upload API.** `POST /api/videos/:id/views`, `PUT …/reaction`,
    `PUT …/saved`, `GET`/`POST …/comments`, plus `POST /api/videos` (multipart) and
    `GET /media/<key>` with range streaming.
11. **Slice 11 — frontend integration.** Every composable and page that read `localStorage` now calls
    the API: `useSession`, `useLibrary`, `useCatalog`, and the Home, Browse, Watch, Upload, Saved,
    Dashboard, Auth and header screens, each with its own loading and error state. `usePending.ts`
    and the browser-side stores are gone.
12. **Slice 12 — SEO.** `usePageMeta` and route metadata for every route; the lesson, search and
    subject views replace the generic wording once their data resolves (§4.8).
13. **Slice 13 — verification.** This document brought up to date, `pnpm type-check` and `pnpm build`
    clean, and the acceptance criteria walked end to end against a running server.
14. **Slice 14 — enhancements (decision 16).** Transcript / caption upload on the upload flow, and
    chapters for longer lessons (`Caption` and `Chapter` already exist in the schema).
15. **Slice 15 — live chat (decisions 18–19).** `Conversation` and `ChatMessage`; the chat API
    (`GET`/`POST /api/chat/messages`, `GET /api/chat/conversations`, `POST /api/chat/conversations/:id/read`,
    `GET /api/chat/stream`); the `.chat-widget` launcher mounted once in the shell, and the gated
    `.inbox` page where staff answer.

Each slice runs the [Skill.md](./Skill.md) §3 verification (per-step + per-rulebook + cross-artifact)
and reports its gates before the next begins.
