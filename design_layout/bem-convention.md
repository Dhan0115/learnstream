# BEM Convention — CSS Rulebook

> Rule to follow **every time you build a new page or component** in LearnStream.
> Goal: a stylesheet that is modular, reusable and easy to scale.

---

## 1. Scope & stack

- **Applies to:** every new page (`src/pages/*.vue`) and component (`src/components/*.vue`).
- **Stack:** Vue 3 SFC + Vite, `@nuxt/ui`, Tailwind 4 (`src/assets/css/main.css`).
- **Where component styles live:** inside each SFC's `<style scoped>` block.
- **Division of labour (hybrid model):**
  - **BEM** owns a component's *identity*: structure, colours, typography, variant looks.
  - **Tailwind utilities** own *layout and spacing*: flex/grid, gaps, padding, width, responsive breakpoints.

If a declaration describes *how a component looks as a thing* → BEM. If it describes *where it sits or how it flows* → Tailwind.

---

## 2. BEM building blocks

BEM = **B**lock, **E**lement, **M**odifier.

| Concept | Meaning | Syntax | Example |

|---|---|---|---|
| **Block** | A standalone, reusable component | `.block` | `.video-card` |
| **Element** | A part that only makes sense inside its block | `.block__element` | `.video-card__title` |
| **Modifier** | A variant or state of a block/element | `.block--modifier`<br>`.block__element--modifier` | `.video-card--featured`<br>`.video-card__badge--level` |

Separators are fixed:

- Element = double underscore `__`
- Modifier = double hyphen `--`
- Word separator = single hyphen `-`

---

## 3. Naming rules

1. **One block per component.** `VideoCard.vue` → block `.video-card`. `SubjectCard.vue` → `.subject-card`.
2. **lowercase-kebab-case only.** `.video-card`, never `.videoCard`, `.VideoCard` or `.video_card`.
3. **Elements are always prefixed by their block.** `.video-card__title`, not `.title`.
4. **Never chain elements.** `.video-card__title` — not `.video-card__body__title`.
5. **Name by meaning, not appearance.** `--danger`, `--large`, `--featured` — not `--red`, `--big`.
6. **Modifiers are optional flags; the base class is always present.** Always emit `.video-card` alongside `.video-card--featured`.
7. **Blocks are globally unique.** Two components must never share a block name.
8. **Style with single class selectors.** Keep specificity flat and predictable.

---

## 4. Role and convention (project components)

Reuse these established blocks before inventing new ones.

| Block | Role | Key elements | Common modifiers |

|---|---|---|---|
| `.app-header` | Global top navigation shell | `__logo`, `__nav`, `__search`, `__account`, `__upload`, `__identity`, `__signin`, `__signup`, `__signout` | `--scrolled`, `--menu-open` |
| `.search-bar` | Reusable search input | `__input`, `__icon`, `__submit` | `--compact` |
| `.video-card` | Lesson thumbnail card | `__thumb`, `__body`, `__title`, `__meta`, `__badge` | `--featured`, `--compact` |
| `.subject-card` | Subject tile | `__icon`, `__title`, `__tagline`, `__count` | `--active` |
| `.video-player` | Custom media player | `__stage`, `__controls`, `__seek`, `__caption` | `--fullscreen`, `--muted` |
| `.comment-section` | Per-video comments | `__list`, `__item`, `__form`, `__signin` | `--empty` |
| `.auth` | Sign-in / sign-up page | `__card`, `__title`, `__subtitle`, `__error`, `__form`, `__field`, `__roles`, `__role`, `__submit`, `__switch`, `__note` | `__role--active` |

**Page blocks** are named after the route, e.g. `.home`, `.browse`, `.watch`, `.dashboard`.

---

## 5. Methodology — applying a design to a new page

1. **Split the design into blocks.** Each visually distinct, self-contained area is one block. Name it after the component/route.
2. **List the parts inside each block** → these become elements (`__thumb`, `__title`).
3. **Spot the variants.** Anything that looks different in another context (state, size, theme) → a modifier (`--featured`, `--compact`).
4. **Map colours/spacing to tokens.** Use existing CSS variables (`var(--ui-primary)`, `var(--ui-bg)`, `var(--ui-text)`); never hardcode hex/brand values.
5. **Write layout with Tailwind, look with BEM.** Put `flex`/`grid`/`gap`/`p-*`/`md:*` in `class`; put colours, borders, radius, fonts in the scoped `<style>`.
6. **Keep nesting shallow.** At most one level of nesting (for `&:hover`, `&::before`, media queries).
7. **Show all states.** Style default, hover, focus-visible, disabled, and loading/empty for each interactive block.
8. **Verify.** Every class in `<style>` must appear in the template, and every class in the template must be styled or be a Tailwind utility.

---

## 6. Working with Tailwind (the split)

```vue
<!-- src/components/VideoCard.vue -->
<template>
  <!-- Tailwind: layout, spacing, responsive -->
  <article
    class="video-card flex flex-col gap-2 p-3"
    :class="{ 'video-card--featured': isFeatured }"
  >
    <img class="video-card__thumb w-full" :src="thumb" :alt="title" />

    <div class="video-card__body flex flex-col gap-1">
      <h3 class="video-card__title">{{ title }}</h3>
      <span class="video-card__badge video-card__badge--level">{{ level }}</span>
    </div>
  </article>
</template>

<style scoped>
/* BEM: the component's identity and look */
.video-card {
  border-radius: 0.75rem;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
}
.video-card__thumb {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 0.5rem;
}
.video-card__title {
  font-weight: 600;
  line-height: 1.3;
  color: var(--ui-text);
}
.video-card__badge--level {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ui-primary);
}
.video-card--featured {
  box-shadow: 0 0 0 2px var(--ui-primary);
}
</style>
```

Rules for the split:

- **Never** re-implement a Tailwind value by hand (no `margin: 12px` when `m-3` exists).
- **Never** write a BEM modifier that only wraps one utility class — just use the utility.
- `@nuxt/ui` components (`UButton`, `UInput`, …) are used **as-is**; wrap them in a block only when you need custom look.

---

## 7. State, modifiers and theming

| Kind | Syntax | Use for | Example |

|---|---|---|---|
| Variant modifier | `--` | Design variants defined up front | `.video-card--featured` |
| State flag | `is-` / `has-` | Runtime boolean toggled by Vue | `.is-loading`, `.is-active`, `.has-error` |

- Bind state in the template, never by mutating classes in JS string-soup:

  ```vue
  <button class="video-card__action is-loading" :class="{ 'is-loading': loading }">
  ```

- Theming uses CSS variables, not duplicated colour classes:

  ```css
  .video-card { background: var(--ui-bg); color: var(--ui-text); }
  ```

---

## 8. File & folder structure

```
src/assets/css/main.css   → Tailwind import, design tokens, global resets
src/components/*.vue      → block styles inside <style scoped>
src/pages/*.vue           → page block styles inside <style scoped>
```

- Component/page-specific BEM lives **in the SFC**, not in a global file.
- Only truly global things (tokens, resets, `body`) go in `main.css`.
- Need to pierce into a child component? Use `:deep()` **sparingly**; prefer styling the child from within itself.

---

## 9. Do / Don't

### ✅ Do

- Use one block per component, named after the component (`VideoCard.vue` → `.video-card`).
- Use lowercase kebab-case everywhere.
- Prefix elements with their block: `.video-card__title`.
- Use `--` modifiers for variants and keep the base class present.
- Use `is-*` / `has-*` for runtime state toggled by Vue.
- Style with single class selectors to keep specificity flat.
- Reference design tokens (`var(--ui-*)`) for colours and radii.
- Let Tailwind handle layout, spacing and responsiveness.
- Keep `<style>` nesting to one level max.

### ❌ Don't

- **Don't chain elements:** `.video-card__body__title` → use `.video-card__title`.
- **Don't nest block names:** `.header__nav__item`, `.app-header__search__icon`.
- **Don't misuse separators:** `videoCard`, `video_card`, `video-card_title`, `video-card-title`.
- **Don't style by tag or descendant selectors:** `.video-card div`, `.video-card .title`.
- **Don't use IDs for styling:** `#video-title`.
- **Don't name by appearance:** `--red`, `--big`, `--right`.
- **Don't add a modifier without the base class:** `class="video-card--featured"` alone.
- **Don't hardcode values** already covered by Tailwind or tokens (`color: #6366f1`).
- **Don't over-nest Sass/`&`** to recreate the DOM tree.
- **Don't create a block for a one-off layout wrapper** — that's a Tailwind job.

### Before / after

❌ **Don't**

```html
<div class="card">
  <div class="card-body">
    <div class="card-body-title">Title</div>
  </div>
</div>
```

```css
#card .card-body .card-body-title { color: #6366f1; } /* ID + descendant */
.card > div > div { font-size: 12px; }                /* tag selectors */
.videoCard__Title { text-transform: uppercase; }      /* CamelCase */
```

✅ **Do**

```html
<article class="video-card">
  <div class="video-card__body">
    <h3 class="video-card__title">Title</h3>
  </div>
</article>
```

```css
.video-card__title { color: var(--ui-primary); }
```

---

## 10. New page checklist

- [ ] Each component/route area is exactly one block, named after it.
- [ ] Every element uses `block__element`, no chained elements.
- [ ] Variants are `--modifier`s that always ship with the base class.
- [ ] Runtime state uses `is-*` / `has-*`.
- [ ] Colours/radii come from `var(--ui-*)` tokens, not hardcoded values.
- [ ] Layout/spacing/responsive use Tailwind utilities.
- [ ] `<style scoped>` nesting is at most one level deep.
- [ ] Hover, focus-visible, disabled and loading/empty states are covered.
- [ ] No IDs, tag selectors or descendant selectors in CSS.
