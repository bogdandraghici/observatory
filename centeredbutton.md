# Icon-only button — off-center icon fix

## Symptom

An icon-only PrimeNG `p-button` (e.g. the Refresh button on the Evaluators
card) rendered with its icon pushed **left of center** instead of centered in
the box.

## Root cause

The FlowX base button rule sets a flex `gap`:

```scss
.p-button {
  gap: var(--flowx-space-6); // 6px
}
```

This rule is **non-layered**, so it overrides PrimeNG's own `@layer` style that
sets `gap: 0` for icon-only buttons.

PrimeNG renders invisible **zero-width flex siblings** alongside the icon on an
icon-only button — an `::after` pseudo-element (`content: " "; visibility:
hidden; width: 0`) and a hidden `.p-button-label`. With the leaked 6px gap, flex
inserts spacing between those phantom siblings, so the centered group is wider
than the icon alone and the icon lands left of true center.

## Fix

Add an icon-only rule in `src/app/ai/_shared/flowx-theme.scss` (right after the
base `.p-button` block) that makes the button a square and zeroes the gap:

```scss
.p-button.p-button-icon-only {
  width: 36px;   // Medium button height per button.json
  height: 36px;
  padding: 0;
  gap: 0;        // kill the phantom gaps from the base .p-button gap

  .p-button-icon { margin: 0; }
  .p-button-label { display: none; }
}
```

`gap: 0` is the key line — it removes the spacing between the icon and the
invisible siblings so the icon centers. The rule is dimensions-only (no color
literals), so it works in both light and dark themes; the secondary button's
colors still come from the existing `.p-button-secondary` light/dark bridges.

## Notes

- PrimeNG version: `21.1.8`. Class `p-button-icon-only` is auto-applied when the
  button has an icon and no label, and it lands on the inner `<button>` that
  also carries `.p-button`, so `.p-button.p-button-icon-only` matches.
- This fix is global: any icon-only FlowX button now renders square and
  centered.

---

# Applying the secondary box style to existing icon buttons

When converting a borderless/round icon button to the FlowX **secondary** box
(white fill + border, dark icon), in the template:

```html
<!-- before -->
<p-button icon="pi pi-refresh" [rounded]="true" [text]="true" ... />
<!-- after -->
<p-button icon="pi pi-refresh" severity="secondary" pTooltip="..." ... />
```

Drop `[rounded]`, `[text]`, and `size="small"`. The box chrome comes from the
existing `.p-button-secondary` bridge in `flowx-theme.scss` (light + dark), and
the square + centering comes from the global `.p-button-icon-only` rule above.
A label, if any, becomes a `pTooltip`.

## Lesson 1 — component-scoped `::ng-deep` can suppress the global chrome

On the home project cards (`app-details.component.html` / `.scss`), setting
`severity="secondary"` produced **no visible box**. Cause: a component-scoped
`::ng-deep .project-card__actions .p-button-icon-only` block deliberately forced
`background: transparent; border: none` to keep the buttons "quiet". Component
`::ng-deep` styles are injected after the global theme and won the cascade.

Fix: change that scoped rule itself to carry the boxed secondary chrome (it is
the right place to override), rather than fighting it from the global sheet.
Per-button accents stay as small overrides — e.g. the default-project star keeps
a gold icon, the trash icon turns red on hover.

## Lesson 2 — `display: grid` breaks **vertical** centering of icon-only buttons

The same scoped rule used `display: grid; place-items: center`. Once the box
became visible, the icon sat **above** the vertical center. Cause: PrimeNG's
phantom zero-width `::after` (and hidden label) are extra grid items; with
`grid-auto-flow: row` they each get their own row, so the icon lands in the top
row and `place-items: center` only centers it within that half-height cell.

Fix: use flex centering and kill the pseudo-element:

```scss
.p-button-icon-only {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  &::after { display: none !important; }
}
```

Rule of thumb: for icon-only PrimeNG buttons prefer **flex** centering, not
grid — grid auto-flow turns the phantom `::after`/label into extra rows and
throws off vertical alignment.

## Dark mode

Box chrome uses literal colors, so it needs a `.flowx-dark` /
`:host-context(.flowx-dark)` counterpart per `CLAUDE.md`. FlowX dark secondary
(from `button.json`): fill `transparent`, stroke `#5b6a7e`, icon `#ffffff`,
hover fill `#475263`.
