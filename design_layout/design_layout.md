# Layout Design Rule — Locked to the Specified Design

> **This is a hard rule, not a guideline.**
> The layout design of this project is **based only on the design the project owner specifies**, with its theme derived from the **Nuxt UI** design system.
> The purpose of this rule is to **prevent the project's design from being changed, replaced or "improved"** by anyone (human or AI) without an explicit instruction.

---

## 1. The single source of truth

1. The **only** valid source for layout, spacing, typography, colour and component usage is the design **explicitly provided by the project owner** (e.g. a Figma file, mockups, screenshots, or a written spec).
2. The **theme layer is Nuxt UI.** All colours, radii, shadows, focus rings and component behaviour must come from the Nuxt UI theme — never from a custom palette invented on the spot.
3. If a detail is **not covered** by the provided design, the default is to **ask the owner** — not to invent a value.
4. When the provided design and any other reference disagree, **the provided design wins**.

---

## 2. What this rule covers

| Area | Locked because |

|---|---|
| **Page structure** | Section order, layout regions, grid and column counts |
| **Spacing scale** | Padding, margin, gaps, vertical rhythm |
| **Typography** | Font family, size scale, weight, line-height, casing |
| **Colour** | Backgrounds, text, borders, states — all via Nuxt UI tokens |
| **Components** | Which Nuxt UI component is used, and its size/variant |
| **Breakpoints** | Where layouts reflow, and mobile-first order |
| **States** | Default, hover, focus-visible, disabled, loading, empty |

---

## 3. Theme is Nuxt UI

- Use the **Nuxt UI** theme and its CSS variables only: `var(--ui-primary)`, `var(--ui-bg)`, `var(--ui-text)`, `var(--ui-border)`, etc.
- Use Nuxt UI components (`UButton`, `UInput`, `UCard`, `UModal`, …) **as shipped** — do not restyle them into a different-looking component.
- Theme customisation happens **only** through the Nuxt UI theme config, and **only** when the owner specifies it.
- Do **not** introduce a second colour system, a custom icon set, or an external design system alongside Nuxt UI.

---

## 4. Do / Don't

### ✅ Do

- Reproduce the owner's design faithfully — same structure, spacing, type and colour.
- Map every colour/shadow/radius to a **Nuxt UI token** instead of a hardcoded value.
- Use the Nuxt UI component that matches the design, with its built-in size/variant props.
- Ask the owner when the design is ambiguous or silent.
- Keep existing pages untouched unless the owner asks for that page specifically.
- Note any design decision you had to make (even a small one) so it can be reviewed.

### ❌ Don't

- **Don't redesign.** No "better" layout, spacing or hierarchy than what was specified.
- **Don't "polish" unasked.** No new colours, gradients, fonts, shadows or animations.
- **Don't swap components** for ones you prefer, or restyle Nuxt UI components away from their theme.
- **Don't hardcode** hex colours, pixel spacing or font stacks that bypass the Nuxt UI theme.
- **Don't change breakpoints, grid or responsive behaviour** that the design did not call for.
- **Don't apply a change to a shared/global stylesheet** to restyle one page.
- **Don't edit dimensions or behaviour of existing pages** while building a new one.
- **Don't fill in missing design details with your own taste** — ask first.

---

## 5. Change control

A design change is allowed **only** when it is:

1. **Explicitly requested** by the project owner, and
2. **Scoped** to the exact page/component named in the request.

Anything else is out of scope. If you believe a change is needed, **propose it and wait for approval** — never apply it directly.

When an approved change is made, record **what changed, where, and why**.

---

## 6. Verification checklist (run for every new page)

- [ ] Layout matches the owner's design section-by-section and region-by-region.
- [ ] All spacing uses the specified scale (Nuxt UI / Tailwind scale), not ad-hoc values.
- [ ] Typography matches the specified family, size, weight and line-height.
- [ ] Every colour, radius and shadow maps to a **Nuxt UI token**.
- [ ] Components are Nuxt UI components at the specified size/variant — unmodified.
- [ ] No new colour, font, shadow or motion was introduced that the design did not specify.
- [ ] Existing pages, dimensions and shared/global styles were **not** altered.
- [ ] Any ambiguity was raised with the owner instead of being guessed.
