# Sass Rule — Design → Sass for Every Page & Component

> **This is a rule, applied to every page and every Vue component.**
> Each Vue page/component's design **must be translated into Sass** inside its own `<style scoped lang="scss">` block, following the [BEM convention](./bem-convention.md) and drawn only from the [specified design](./design_layout.md).

---

## 1. Scope

- **Applies to:** every SFC — pages (`src/pages/*.vue`) and components (`src/components/*.vue`).
- **Output:** the component's design lives in its own `<style scoped lang="scss">` block.
- **Syntax:** **SCSS** (`.scss`, brace syntax). Never the indented `.sass` syntax unless agreed.
- **Source of truth:** the design the owner provides. Do not invent values — see [design_layout.md](./design_layout.md).
- **Naming:** all selectors follow BEM — see [bem-convention.md](./bem-convention.md).
- **Division of labour:** Sass owns a component's *identity* (colour, type, borders, states); Tailwind owns *layout and spacing*.

---

## 2. Enable Sass (one-time setup)

1. Add the compiler:

   ```bash
   pnpm add -D sass
   ```

2. Create the shared Sass layer:

   ```
   src/assets/scss/
     _tokens.scss      # Nuxt UI + design tokens as Sass variables/maps
     _functions.scss   # px→rem, spacing helpers
     _mixins.scss      # breakpoints, focus-ring, truncate
     main.scss         # @use the partials once, globally
   ```

3. Load the global layer **once** in `src/main.ts`:

   ```ts
   import './assets/css/main.css'   // Tailwind + Nuxt UI (keep as-is)
   import './assets/scss/main.scss'  // project Sass layer (add-only)
   ```

4. Every SFC then declares Sass on its style block:

   ```vue
   <style scoped lang="scss">
   /* component design here */
   </style>
   ```

---

## 3. Design → Sass conversion (methodology)

Run these steps for **every** page/component.

1. **Read the provided design.** It is the only source of layout, spacing, type and colour.
2. **Split it into one block** named after the component/route (`VideoCard.vue` → `.video-card`).
3. **Map the parts to elements** → `&__thumb`, `&__title`, `&__meta`.
4. **Map the variants to modifiers** → `&--featured`, `&--compact`.
5. **Reuse tokens.** Pull colours/radii/shadows from `_tokens.scss`; add new tokens only if the design introduces them.
6. **Translate the look in Sass**, keeping layout/spacing in Tailwind utilities.
7. **Add all states** — hover, focus-visible, disabled, loading, empty.
8. **Add responsiveness** with the `up()` mixin (mobile-first).
9. **Verify** the class list matches the template and the design exactly.

---

## 4. Sass + BEM pattern

Nest with `&` so the compiled CSS stays flat and readable.

```scss
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.video-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;

  &__thumb {
    aspect-ratio: 16 / 9;
    border-radius: $radius-sm;
    object-fit: cover;
  }

  &__title {
    font-weight: 600;
    color: $color-text;
  }

  &__badge {
    font-size: 0.75rem;

    &--level { text-transform: uppercase; color: $color-primary; }
  }

  &--featured {
    box-shadow: 0 0 0 2px $color-primary;
  }

  &.is-loading { opacity: 0.6; }

  @include up(md) {
    border-radius: $radius-lg;
  }
}
```

Rules:

- Nest with `&__` / `&--` — **never chain** (`&__body__title` is banned).
- Keep nesting **≤ 2 levels** deep.
- Use `is-*` / `has-*` for runtime state, `--` for design variants.

---

## 5. Tokens — Nuxt UI → Sass

Tokens bridge Nuxt UI's CSS variables into Sass. The variables stay **live**, so theming still works.

```scss
// src/assets/scss/_tokens.scss
$color-primary: var(--ui-primary);
$color-surface: var(--ui-bg);
$color-text:    var(--ui-text);
$color-border:  var(--ui-border);

$radius-sm: 0.5rem;
$radius-md: 0.75rem;
$radius-lg: 1rem;

$space: (xs: 0.25rem, sm: 0.5rem, md: 1rem, lg: 1.5rem, xl: 2rem);
```

- Colours **must** wrap the Nuxt UI variables (`var(--ui-*)`).
- Group related tokens (spacing, radii) into **maps**, not dozens of loose variables.
- Never hardcode a hex value that a Nuxt UI token already covers.

---

## 6. Breakpoints & mixins

```scss
// src/assets/scss/_mixins.scss
@use 'sass:map';

$breakpoints: (sm: 640px, md: 768px, lg: 1024px, xl: 1280px);

@mixin up($name) {
  @media (min-width: map.get($breakpoints, $name)) { @content; }
}

@mixin focus-outline {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

@mixin focus-ring {
  &:focus-visible { @include focus-outline; }
}
```

Usage stays mobile-first:

```scss
.grid { grid-template-columns: 1fr; @include up(lg) { grid-template-columns: repeat(3, 1fr); } }
```

- Import partials with **`@use`** — never the deprecated `@import`.
- Prefer `@use '...' as *` for tokens/mixins so calls stay short.

---

## 7. Component template (copy for every new SFC)

```vue
<script setup lang="ts">
// props/logic
</script>

<template>
  <!-- Tailwind: layout + spacing. BEM: identity. -->
  <article class="video-card flex flex-col gap-2 p-3">
    <img class="video-card__thumb w-full" :src="thumb" :alt="title" />
    <h3 class="video-card__title">{{ title }}</h3>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.video-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;

  &__thumb { aspect-ratio: 16 / 9; object-fit: cover; }
  &__title { font-weight: 600; color: $color-text; }

  @include up(md) { border-radius: $radius-lg; }
}
</style>
```

---

## 8. Do / Don't

### ✅ Do

- Translate the **provided design** into Sass for every page/component, in its own `<style scoped lang="scss">`.
- Write selectors with BEM (`&__element`, `&--modifier`).
- Pull every colour/radius/shadow from `_tokens.scss` (which wraps `var(--ui-*)`).
- Use `@use` / `@forward` for partials.
- Put all design states in Sass: hover, focus-visible, disabled, loading, empty.
- Handle responsiveness with the `up()` mixin, mobile-first.
- Keep nesting to ≤ 2 levels and keep specificity flat.

### ❌ Don't

- **Don't invent styles.** Translate only the specified design; ask when it's silent.
- **Don't use `@import`** — it is deprecated in Dart Sass.
- **Don't hardcode** hex colours or bespoke pixel values that tokens/Tailwind already cover.
- **Don't chain or over-nest** (`&__body &__title`, 3+ levels).
- **Don't restyle Nuxt UI components** away from their theme, or add a second colour system.
- **Don't move layout/spacing into Sass** when a Tailwind utility already does it.
- **Don't duplicate tokens** per component — extend `_tokens.scss` instead.
- **Don't use global/unscoped Sass** to style one component, and don't alter shared global styles.
- **Don't touch existing pages' dimensions or the `.css`/global layer** to style a new page.

---

## 9. Checklist — run for every page/component

- [ ] The SFC has a `<style scoped lang="scss">` block.
- [ ] The design was translated **only** from the provided spec.
- [ ] Selectors follow BEM; no chained elements, no tag/descendant selectors, no IDs.
- [ ] Colours/radii/shadows come from `_tokens.scss` (`var(--ui-*)`), not hardcoded.
- [ ] Partials are pulled in with `@use`, not `@import`.
- [ ] Nesting is ≤ 2 levels deep.
- [ ] Hover, focus-visible, disabled and loading/empty states are covered.
- [ ] Responsive rules use the `up()` mixin.
- [ ] Layout/spacing stay in Tailwind utilities, not in Sass.
- [ ] No existing page, shared style or global `.css` was altered.
