# Observatory `/ai` FlowX Redesign — context for future updates

Light-mode visual restyle of every page under `/ai/*` to align Observatory with the FlowX Design System and the Runtime prototype at <https://bogdandraghici.github.io/Runtime_exploration/runtime-prototype.html>. Landing pages (`src/app/landing/**`) and the layout shell (`app.topbar`, `app.sidebar`) are intentionally out of scope.

## Source of truth

- **Tokens & components**: `~/.claude/skills/flowx-design-system/references/foundations/*.json` and `references/components/*.json`. Never approximate — read the JSON.
- **Visual reference**: the Runtime prototype (above). Inline `<style>` in that page uses the same `--flowx-*` tokens.
- **Theme entry point**: `src/app/ai/_shared/flowx-theme.scss` (~1000 lines). Tokens, primitives, and the PrimeNG bridge live here. SCSS-variable mirror in `src/app/ai/_shared/ai-design-tokens.scss`.

## Conventions established

- **Cards float on the gray canvas**: `border: none`, `border-radius: var(--flowx-radius-12)`, `box-shadow: var(--flowx-shadow-xs)`. Hover lifts via shadow only (`--flowx-shadow-m` + `translateY(-2px)`). Applies to `.stat-card`, `.card`, `.surface-card`, `.content-card`, `.table-container`, `.filters-bar`.
- **24px padding** on every card via the `.stat-card` primitive. No inner `<div class="p-4">` wrappers (they double-pad to 40px).
- **Icon + title section headers** match the prototype's `.axis-header` pattern:
  - Icon swatch: 32×32, `radius-8`, `neutrals-50` background, `neutrals-500` glyph (the bare `.stat-card__icon` default).
  - Title: 18/28/700, `letter-spacing: -0.01em` (the global `.stat-card__title`).
  - 12px gap, forced via a global `:is(.stat-card, .card, .surface-card) .flex:has(> .stat-card__icon):has(> .stat-card__title) { gap: var(--flowx-space-12) !important; }` rule — overrides Tailwind `gap-2`/`gap-1` in templates without per-file edits.
- **KPI tiles keep colored icons**: when `.stat-card__icon` is paired with `.stat-card__value` (not `.stat-card__title`), the color modifier (`--blue` / `--green` / `--amber`) is meaningful and preserved. The context-aware sweep distinguishes the two patterns.
- **FlowX has no purple**: the `--purple` icon variant was retired. Any new purple usage should map to `--flowx-blue-*` per the skill rule.
- **Page header**: `.page-header__title` is 24/38/700 (page H1). `.stat-card__title` is 18/28/700 (in-card section). Don't override either per-page.
- **Segmented controls**: PrimeNG `<p-selectButton>` is globally styled as the FlowX `segmented-button` — neutrals-100 pill track, h36, segments radius-6 h28, selected blue-500+white, no hover wash on active. No template change needed; just emit `<p-selectButton>` and it inherits.
- **Raw HTML inputs** (`<input type="text|date|number|search|email|url">`, `<textarea>`) are matched to `.p-inputtext` via a `:not([class*="p-"])` block inside `.ai-page` — 36px height, neutrals-100 border, radius-8, FlowX blue focus ring.
- **No hardcoded hex/rgba in pages** except: white text on filled buttons, alpha tints of FlowX semantic colors for status backgrounds (FlowX tokens don't ship alpha variants). Any other literal hex is drift — replace with a token.
- **Stacked stat-cards**: use `.stat-card stat-card--stacked` instead of inline `style="flex-direction: column; align-items: stretch;"`.
- **Tables are tight and prototype-inspired**: `.p-datatable` (and the `table-modern` mixin) emit 10px uppercase header tags, 12px body rows, 11–12 × 14 padding, `neutrals-100` hairline dividers, 60ms hover, pointer rows, JetBrains Mono 11px for inline `code`/`.mono` in cells, and the last row drops its bottom border. Selected row uses `.p-highlight` (blue-50); add `.is-anchor` on a `<tr>` to spotlight an erroring/current row in yellow-50. Source: `flowx-theme.scss` `.p-datatable` block + `table-modern` mixin in `ai-design-tokens.scss`.
- **Tab content panels are transparent**: Aura paints `.p-tabpanels` / `.p-tabpanel` with `{content.background}` (white) by default — the `.ai-page` block nulls them to `transparent` so the gray canvas shows through. The tab strip and tab buttons were already transparent. Don't add `background` on tab panels per page.
- **The "borderless card" rule is global, not scoped**: it applies inside `.ai-page` (already enforced in `flowx-theme.scss`) AND in the home dashboard cards (`.api-key-card`, `.stat-card`, `.getting-started__card` in `home.component.scss`) AND in the dual-mode analytics + dataset cards (light-mode branch only — dark-mode glass borders remain). The `@mixin card-base` in `ai-design-tokens.scss` also drops its border.
- **Assistant FAB**: dark slate fill (`#2A313A`) + custom yellow-bar sparkles SVG at `assets/fab-sparkles.svg`, sized 16×19.2 inside the 40×40 button. The PrimeIcons sparkles (`pi pi-sparkles`) is no longer used for the open state. The close-state `pi pi-times` stays.

## Reusable primitives added (in `flowx-theme.scss`)

| Primitive | Use for |
|---|---|
| `.card-head` + `.card-body` | Per-card top header bar with title + meta (24px padding, neutrals-100 bottom border). |
| `.kpi-card` (+ `__eyebrow` / `__value` / `__sub` / `__trend--up/--down`) | Borderless KPI card with uppercase eyebrow + 24/28/700 tabular value. |
| `.state-pill` (+ `--running` / `--waiting` / `--failed` / `--completed` / `--terminated`) | Status pill with optional colored dot. |
| `.chip` (+ `.active`) | Filter-bar pill toggle. |
| `.banner` (+ `--alert` / `--info`) | Inline announcement with left accent + colored dot. |
| `.stat-card__icon--neutral` | Explicit alias for the default neutral swatch (same as bare `.stat-card__icon`). |
| `.stat-card--stacked` | Vertical layout, replaces inline flex-direction overrides. |

## Patterns to avoid

- Don't add `border: 1px solid …` to cards — let elevation + radius carry the surface. This includes the home dashboard cards and the analytics/dataset cards' light-mode branch — they were retro-fitted to match.
- Don't restore the bigger 14px / 24-line table cells or 12 × 16 padding on `.p-datatable` — the new style is 12px body + 11 × 14 padding. Per-component table overrides should be deleted in favor of the global rule.
- Don't paint `.p-tabpanels` / `.p-tabpanel` with a `background` per component — the global rule keeps them transparent so they sit on the canvas like everything else.
- Don't put a `<div class="p-4">` (or `p-3`/`p-5`) directly inside a `.stat-card` — the primitive already supplies 24px padding. Wrap content directly.
- Don't use `--purple` icon modifier or `#7e22ce` etc. — purple has no FlowX equivalent.
- Don't override `.stat-card__title` size in component-local SCSS — it should stay 18/28/700 everywhere.
- Don't add per-page styles for `<p-selectButton>` — the global theme covers it. The old `.period-selector` override in `llm-calls.component.scss` was removed for this reason.
- Don't apply the colored icon modifier (`--blue` / `--green` / `--amber`) to icons paired with `.stat-card__title` — the prototype's section-header pattern is neutral.
- Don't write inline `style="background: rgba(…); color: …"` on `.stat-card__icon` for section headers — strip it; the neutral default already handles the look.

## Areas left as-is (not touched intentionally)

- Dark mode (`.flowx-dark` block) — light-mode focused redesign. Dark mirrors most of light but the colored-icon-on-dark variants haven't been re-audited against the new neutral default.
- Landing pages (`src/app/landing/**`, `src/app/ai/landing/**` marketing parts) — keep the gold/rose marketing palette.
- Layout shell (`app.topbar`, `app.sidebar`, `app.layout`) — separate redesign track if needed.
- PrimeNG version bump or `@primeuix/themes` preset changes in `main.ts`.
- Most page-level `.scss` files — they were audited and found clean (no hardcoded colors / font-family / non-token radius outside the justified status-tint exceptions in `insights-dashboard`).

## Quick verification commands

```sh
# Build clean (only pre-existing Sass @import deprecation warnings)
npm run build

# No off-palette icon variants
grep -Rn "stat-card__icon--purple" src/app/ai/                  # → no matches
grep -Rn "text-gold" src/app/ai/                                # → only ai-design-tokens.scss legacy alias

# No double-padding wrappers inside stat-cards
grep -RnE 'class="stat-card[^"]*">\s*<div class="p-[2-5]' src/app/ai/   # → no matches

# Inline-styled section-header icons should be zero (KPI tiles can keep theirs)
# Spot-check by reading any page; an icon with `style="background: rgba(…)"` followed by `.stat-card__title` should not exist.
```
