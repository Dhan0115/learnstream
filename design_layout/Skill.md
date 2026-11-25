---
name: perfect-design
description: Use when building or editing the design of any page or component. Enforces, in strict order, every rule defined in the design_layout/ folder so the final UI is complete, consistent and visually polished. Produces spec-faithful design, BEM naming and Sass styles only — never invents design.
---

# Perfect Design — Master Rule

> **This is the entry-point rule for all design work.**
> Every design task must follow the steps below **in the exact order given**. Each step is gated: it must be verified against its rulebook before the next step begins, and the whole design must be re-verified at the end.
>
> **Goal:** produce a *perfect* design — **complete, consistent and visually polished** — that complies with **every** rule defined in the `design_layout/` folder.

---

## 1. Rule registry (the rulebooks this rule enforces)

| # | Rulebook | Governs | Status |

|---|---|---|---|
| 1 | [design_layout.md](./design_layout.md) | *What* the design is — locked to the owner's spec, Nuxt UI theme | Mandatory |
| 2 | [bem-convention.md](./bem-convention.md) | *How* styles are named and structured | Mandatory |
| 3 | [sass.md](./sass.md) | *How* the design is translated into Sass | Mandatory |

**Coverage rule:** before starting, list **every** `.md` file in `design_layout/`. All of them must be applied. If a new rulebook is added, it is automatically in scope and must be incorporated.

**Precedence (only when rules appear to conflict):**

1. The owner's specified design outranks everything.
2. `design_layout.md` (never alter the design) over `bem-convention.md` over `sass.md`.
3. When in doubt, **stop and ask the owner** — never guess.

---

## 2. The ordered pipeline

Run these steps **in order**. Do not skip, reorder, or start a step before the previous gate passes.

### Step 0 — Lock the context

- Read every `.md` file in `design_layout/` and load its rules.
- Obtain the owner's design (Figma, mockups, screenshots or written spec).
- **Gate:** all rule files enumerated; design source confirmed. *No design spec → stop.*

### Step 1 — Apply `design_layout.md` (define the design)

- Reproduce the specified design faithfully — structure, spacing, type, colour, components, breakpoints, states.
- Use the **Nuxt UI** theme and `var(--ui-*)` tokens only.
- Invent nothing; raise any gap with the owner.
- **Gate:** layout matches the spec region-by-region; all values map to Nuxt UI tokens; zero unrequested changes.

### Step 2 — Apply `bem-convention.md` (name the design)

- Split the design into one **block** per component/route.
- Map parts to **`__`elements** and variants to **`--`modifiers**; runtime state to `is-*`/`has-*`.
- Reuse the Role & Convention blocks before creating new ones.
- **Gate:** BEM naming rules satisfied — no chained elements, no tag/descendant/ID selectors, base class always present.

### Step 3 — Apply `sass.md` (write the design)

- Translate the design into Sass in each SFC's `<style scoped lang="scss">` block.
- Pull colours/radii/shadows from `_tokens.scss`; nest with `&__`/`&--` (≤ 2 levels); cover all states; handle responsiveness with `up()`.
- Keep layout/spacing in Tailwind; use `@use`, never `@import`.
- **Gate:** every SFC styles-scoped in Sass; tokens used; states and responsive rules present; naming matches Step 2.

### Step 4 — Full verification (prove the design)

- Verify **each step** and **each rulebook** against its own checklist (see §3).
- Cross-check consistency across artifacts (see §3).
- **Gate:** every item passes. Any failure returns to the owning step — the design is not "done" until all pass.

---

## 3. Verification protocol

For **every** step, verify against **every** relevant rulebook before proceeding:

1. **Step-level verification** — re-read the step's rulebook and confirm each of its rules was honoured in this step.
2. **Rulebook-level verification** — run the checklist at the end of the applicable `.md`:
   - [design_layout.md](./design_layout.md) — Verification checklist
   - [bem-convention.md](./bem-convention.md) — New page checklist
   - [sass.md](./sass.md) — Checklist (every page/component)
3. **Cross-artifact consistency:**
   - Design in Step 1 = selectors in Step 2 = Sass in Step 3 (same structure, same variants).
   - Every class in the template is styled or is a Tailwind utility; every Sass selector exists in the template.
   - Every colour/radius/shadow maps to a Nuxt UI token.
4. **No-regression check** — existing pages, dimensions and shared/global styles were not altered.

Record any item you could not verify as an **open question** for the owner — never mark it as passed.

---

## 4. Definition of "perfect design" (acceptance criteria)

- **Complete** — every region, element, variant and state in the spec is present.
- **Consistent** — one block per component, one naming convention, one theme (Nuxt UI), one Sass layer.
- **Visually polished** — faithful spacing, hierarchy, type scale and Nuxt UI theming; all interactive states styled.
- **Compliant** — every rule in every `design_layout/` rulebook passes its checklist.
- **Unchanged elsewhere** — nothing outside the requested scope was modified.

---

## 5. Do / Don't

### ✅ Do

- Follow the steps **in order**, gate by gate.
- Apply **all** rulebooks, including any newly added to `design_layout/`.
- Verify each step and each `.md` against its own rules before moving on.
- Keep the design faithful to the owner's spec and the Nuxt UI theme.
- Report the result of every gate to the owner.

### ❌ Don't

- **Don't** skip, reorder or merge steps.
- **Don't** proceed past a gate that hasn't passed.
- **Don't** mark unverified items as complete.
- **Don't** invent design, redesign, or "improve" anything unasked.
- **Don't** alter existing pages, dimensions or shared/global styles.
- **Don't** declare the design finished until **all** rulebooks pass.

---

## 6. Final checklist

- [ ] Every `.md` in `design_layout/` was read and applied.
- [ ] Step 1 gate passed — design matches the spec, Nuxt UI theme only.
- [ ] Step 2 gate passed — BEM naming rules satisfied.
- [ ] Step 3 gate passed — Sass rules satisfied.
- [ ] Step 4 passed — each rulebook's own checklist verified.
- [ ] Cross-artifact consistency confirmed (design = BEM = Sass).
- [ ] No existing page, dimension or global style was altered.
- [ ] Open questions (if any) raised with the owner before finishing.
