# Observatory Web — Working Notes

## Dark mode is always in scope

The app ships **two themes**: a `.flowx-light` (default) and a `.flowx-dark` toggle on `<html>`. Whenever a styling change is requested in light mode, **also produce the dark-mode counterpart in the same change**. Do not finish a styling task that only covers one mode.

Rules of thumb:

- **CSS** — if you write a rule that uses a literal color, raster image, gradient, or alpha tint, add a `.flowx-dark` (or `:host-context(.flowx-dark)` in component SCSS) override unless the color is already a theme-aware token like `var(--flowx-text-primary)` / `var(--flowx-surface-primary)` / `var(--flowx-interactive)`.
- **Canvas / Chart.js** — Chart.js doesn't react to a class change on `<html>`. Always:
  1. Read the active mode at render time (`document.documentElement.classList.contains('flowx-dark')`) and branch the stroke/fill/text color accordingly.
  2. Subscribe to `LayoutService.configUpdate$` (debounce ~25ms) and rebuild chart options/data so colors refresh when the user toggles themes. The token-usage / endpoints-card components are the existing patterns to copy.
- **FlowX semantic palette in dark** — primary blue lifts from `blue-500 (#006bd8)` to `blue-400 (#3389e0)`; success / error / warning tokens keep their light-mode hex but their *fills* should be translucent (`rgba(..., 0.25–0.45)`) so the dark surface shows through instead of a washed-out pastel.
- **Light pastels stop reading on dark** — `green-50`, `blue-100`, `yellow-100`, etc. tend to look gray on the dark slate. Prefer a translucent version of the *saturated* palette step (e.g. `rgba(0, 128, 96, 0.25)` instead of solid `#e6f2ef`) for surfaces that need to feel tinted in both modes.
- **Verify visually** — after any styling work, mentally run through both modes. If the user is reviewing only one mode, still ship the matching dark-mode rule.

## Existing references

- `src/app/ai/_shared/flowx-theme.scss` — the FlowX token + component-bridge file. Light values live at the top under `.layout-wrapper, .ai-page`; dark overrides live under `.flowx-dark .layout-wrapper, .flowx-dark .ai-page, .flowx-dark .home-page` further down. New per-component dark behavior usually slots into one of those existing blocks.
- `redesign.md` — the broader /ai redesign context; useful before touching layout or shared primitives.
