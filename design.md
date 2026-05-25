# Observatory `/ai` — Hero-Panel Visual System

Companion to [`redesign.md`](./redesign.md). `redesign.md` covers the broader
FlowX token migration and table/card primitives. **This file is the visual
system for pages that lead with a hero panel** — the pattern established on
the home dashboard (`/ai/home`) and Agent Evaluations (`/ai/insights`), and
the template for upcoming page redesigns under `/ai/*`.

> Reference source: the "V4 Bold" handoff bundles from Claude Design
> (`obs-hero/project/variations.jsx`, `obs-hero/project/evaluations.jsx`).
> Sizes diverge from the reference where the home page already set a
> tighter scale — **the home page is the source of truth**, the reference
> is only a starting point.

---

## TL;DR

Every page in scope opens with **one rounded outer panel** containing a
**hero band** (title + scope/selectors on a soft blue radial gradient)
followed by **content bands** (filters, etc.) — separated by hairline
`neutrals-100` dividers. Below that, page-specific **sub-cards** stack on
the gray canvas. Both pages now follow the same rhythm; future pages
should match.

```
─────────────────────────────────────────
│  HERO BAND   (gradient, title, scope) │
│  ─────────────────────────────────────│  ◄── hero panel (radius 24, no border)
│  CONTENT BAND (filters, key, etc.)    │
─────────────────────────────────────────

┌────────────────┐  ┌────────────────┐
│  SUB-CARD      │  │  SUB-CARD      │     ◄── sub-cards (radius 20, no border)
│  · 24px pad    │  │  · 24px pad    │         24px title→content gap
│  · 24px gap    │  │  · 24px gap    │         24px between sections
│                │  │                │
│  [ tile  tile  │  │  [ row  row    │     ◄── internal tiles
│    tile  tile ]│  │    row  row ] │         (radius 12, neutrals-100 border)
└────────────────┘  └────────────────┘
```

---

## The hero panel

**One outer card** wraps a hero band on top and one or more content bands
below.

| Property | Value |
|---|---|
| Radius | `var(--flowx-radius-24, 24px)` |
| Border | `none` |
| Shadow | `var(--flowx-shadow-xs)` light · `0 2px 12px rgba(0,0,0,0.35)` dark |
| Background | `var(--flowx-surface-primary)` |
| Bottom margin | 32px (then sub-cards / next section) |

### Hero band (top)

| Property | Value |
|---|---|
| Padding | `36px 40px 32px` desktop · `24px 24px 20px` ≤768px |
| Layout | `display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 32px` |
| Bottom border | `1px solid var(--flowx-neutrals-100)` (separates from the content band) |
| Background — light | Two radial gradients: `radial-gradient(900px 320px at -10% -40%, var(--flowx-blue-100) 0%, rgba(176,209,243,0) 60%)` over `radial-gradient(700px 280px at 110% 130%, var(--flowx-blue-50) 0%, rgba(230,240,251,0) 60%)` |
| Background — dark | Rebuild with translucent saturated blue: `rgba(51,137,224,0.30)` at the upper-left stop, `rgba(51,137,224,0.18)` at the lower-right stop |

**Title**

| Property | Value |
|---|---|
| Element | `h1` |
| Font | Open Sans 42/1.05/800, letter-spacing `-0.02em` |
| Color | `var(--flowx-text-primary)` |
| Accent | The second word wrapped in `<span class="text-accent">` (color `var(--flowx-interactive)`) — `Welcome to <span>Observatory</span>`, `Agent <span>Evaluations</span>` |
| Mobile | Drop to 32px under 768px |

**Subtitle**

16/24/regular, `var(--flowx-text-secondary)`, 12px below the title. Single
sentence with a trailing period. Don't restate the title.

**Right-side control** (selectors, segmented control, etc.)

The element on the right of the hero must `justify-self: end` so its
right edge aligns vertically with the right edge of every content
section below. The hero's right padding (40px) matches the content
band's right padding (40px) — anchoring this manually with
`justify-self: end` is what guarantees alignment when the title shrinks.

### Content band (below the hero band)

| Property | Value |
|---|---|
| Padding | `24px 40px` desktop · `20px 24px` ≤768px (matches the hero's horizontal padding so all edges align) |
| Multiple sections | Separated by another `1px solid var(--flowx-neutrals-100)` divider |

Holds: filter rows, API-key bars, anything that conceptually belongs
to the page-level context (not page-level data).

### Hero is **excluded** from the sub-card rules below

Every later rule about "24px uniform padding" and "24px title gap"
explicitly does not apply to the hero panel — it has its own internal
padding scheme (hero band 36/40/32, content band 24/40 or 20/32).

---

## Sub-cards

The cards that stack below the hero (project cards, score overview,
health status, trends, alerts, cost forecast, execution history, etc.).

| Property | Value |
|---|---|
| Radius | `var(--flowx-radius-20, 20px)` |
| Border | `none` |
| Shadow | `var(--flowx-shadow-xs)` light · `0 2px 8px rgba(0,0,0,0.30)` dark |
| Padding | **`24px` on all four sides — uniform** |
| Background | `var(--flowx-surface-primary)` |

> **The 24px-everywhere rule is non-negotiable.** Headers and content
> sections inside the same card each get 24px padding so the divider
> between them spans full card width while every piece of content sits
> 24px from the card edge.

### Card title

Inside a sub-card. Always icon + title, separated by 8px.

| Property | Value |
|---|---|
| Font | Open Sans 16/1.2/700, letter-spacing `-0.005em` |
| Color | `var(--flowx-text-primary)` |
| Icon | 18px, `var(--flowx-text-secondary)` |
| **Margin to body** | **24px** |

If the card has a control row (segmented control, link, "View All") next
to the title, wrap title + control in a flex row and set
`margin-bottom: 24px` on the row (not on the inner title — set
`margin-bottom: 0` on the inner `.card-title` so it doesn't double up).

---

## Internal tiles

Tiles that live inside a sub-card (KPI tiles, health rows, cost forecast
tiles, alert rows, etc.).

| Property | Value |
|---|---|
| Radius | `12px` standard · `14px` for cost-style tiles · `10px` for compact pills |
| Border | `1px solid var(--flowx-neutrals-100)` light · `rgba(255,255,255,0.06)` dark |
| Padding | `14px 16px` standard · `12px 14px` compact |
| Background | `var(--flowx-surface-primary)` |
| Hover | Border-color steps to `var(--flowx-neutrals-200)` (optional) |

> **Use `neutrals-100`, not `neutrals-50`.** `neutrals-50` (`#f7f8f9`)
> sits at the same value as the page background and visually disappears.
> `neutrals-100` (`#e3e8ed`) is the smallest visible step.

---

## Typography scale

All numerals use `font-variant-numeric: tabular-nums`.

| Token | Family | Size / line | Weight | Tracking | Used for |
|---|---|---|---|---|---|
| Hero title | Open Sans | 42 / 1.05 | 800 | `-0.02em` | Welcome to Observatory · Agent Evaluations |
| Hero subtitle | Open Sans | 16 / 24 | 400 | — | tagline |
| Section header | Open Sans | 22 / 1 | 800 | `-0.01em` | "Projects" outside any card |
| Sub-card title | Open Sans | 16 / 1.2 | 700 | `-0.005em` | "Score Overview", "Health Status", … |
| Hero KPI value | Open Sans | 40 / 1 | 800 | `-0.025em` | the three big numbers in the welcome panel |
| Sub-card KPI value | Open Sans | 22 / 1 | 800 | `-0.025em` | project KPI tile · eval KPI tile · cost tile |
| Gauge center value | Open Sans | 28 / 1 | 800 | `-0.02em` | donut percentages |
| Tile label (overline) | Open Sans | 10 / 12 | 700 | `0.08em` uppercase | uppercase secondary label above every value |
| Body | Open Sans | 14 / 24 | 400 | — | default text |
| Meta / tertiary | Open Sans | 12-13 / 16 | 400-500 | — | "last run", "7 day", timestamps |
| Mono | JetBrains Mono | 12-15 / 1 | 600 | `0.02em` | API key value, project ID |

When porting the design reference, **stay at 22px for sub-card KPI
values even when the reference uses 26**. The home page set the scale
first; the rest of the app harmonizes around it.

---

## Color & tinting

### Brand accent

- Light: `var(--flowx-blue-500)` (`#006bd8`) — used for the title accent,
  primary buttons, active tabs, active segmented control.
- Dark: lifts to `--flowx-blue-400`/`-300` (`#3389e0` / `#549ce5`).

### Status palette (tinted tiles)

| Tone | Light bg | Light fg | Dark bg | Dark fg |
|---|---|---|---|---|
| Info / brand | `--flowx-blue-50` | `--flowx-blue-600` | `rgba(51,137,224,0.18-0.20)` | `--flowx-blue-300` |
| Success | `--flowx-green-50` | `--flowx-green-600/700` | `rgba(0,128,96,0.20-0.25)` | `--flowx-green-300` |
| Warning | `--flowx-yellow-50` | `--flowx-yellow-600/700` | `rgba(254,185,19,0.18-0.22)` | `--flowx-yellow-300/400` |
| Danger | `--flowx-red-50` | `--flowx-red-500/600` | `rgba(230,34,0,0.18-0.22)` | `--flowx-red-300` |

Light pastels (`*-50`) become illegible on the dark slate — always
provide the dark counterpart explicitly. See CLAUDE.md for the binding
rule.

### Pill chips (score badges, status pills)

| Property | Value |
|---|---|
| Radius | `999px` |
| Padding | `4px 10px` |
| Font | Open Sans 13/1/700, tabular-nums |
| Border | `1px solid` in the same tint family (`*-100` or `*-200`) |
| Background | `*-50` (light) · translucent saturated (dark) |
| Color | `*-600/700` (light) · `*-300` (dark) |

### Side-stripe borders

Allowed **only** on alert/notice rows where the left tint conveys
severity. Use `border-left: 4px solid` with the saturated step
(`-500`), combined with a 1px `neutrals-100` perimeter on the other
three sides and a saturated `-50` background. Never use side-stripe
borders elsewhere.

---

## Borders & dividers

| Surface | Color |
|---|---|
| Main cards (hero panel, sub-cards) | **No border** |
| Internal tiles | `1px var(--flowx-neutrals-100)` light · `rgba(255,255,255,0.06)` dark |
| Card section dividers (hero↔filters, header↔body) | `1px var(--flowx-neutrals-100)` light · `rgba(255,255,255,0.06)` dark |
| Progress track | `var(--flowx-neutrals-100)` light · `rgba(0,0,0,0.28)` dark (track recedes behind the fill) |
| Pill chip border | Saturated `-100` or `-200` in the same tint family |

Card elevation comes from `shadow-xs`, not from a perimeter line.

---

## Spacing rhythm

| Context | Gap |
|---|---|
| Card content padding (all sides) | **24px** |
| Card title → first body element | **24px** |
| Hero band internal padding | `36px 40px 32px` (desktop) |
| Content band padding | `24px 40px` (desktop) |
| Sub-cards in a grid row | `20px` |
| Tile-to-tile inside a card grid | `10–12px` |
| Hero panel → next section block | `32px` |
| Section block → next section block | `32px` |

Don't introduce values outside this scale. If you need something in
between, ask first.

---

## Layout & alignment

- **Page background** (`.layout-main-container:has(.ai-page)`,
  `:has(.home-page)`) is set globally to `var(--flowx-surface-secondary)`
  with `40px` outer padding and the `4rem` topbar offset. **Do not modify
  per-page.**
- The hero panel + sub-cards all live inside that 40px outer padding —
  their `40px` internal right padding lines up with the surface's right
  edge.
- For the hero band's two-column layout, use **grid + `justify-self: end`**
  on the right-side control rather than `flex space-between`. Grid columns
  `minmax(0, 1fr) auto` guarantee the right element sits at the column
  edge regardless of the title's intrinsic width.

---

## PrimeNG component treatments

We never change PrimeNG markup or behavior. The patterns below restyle
chrome via `::ng-deep` scoped under a component-local wrapper class.

### `<p-select>` (Org / Workspace / Project / Agent / Period)

Inherits FlowX theme defaults. Inside a hero band, wrap each select in a
column of `label` + `<p-select>` with a 6px gap. Label is the **overline**
(10/12/700 uppercase, 0.08em letter-spacing, secondary color).

> **Always set `appendTo="body"` on hero-filter `<p-select>` instances.**
> The hero panel uses `overflow: hidden` to clip the gradient at the
> rounded corners. Without `appendTo="body"`, an opened dropdown panel
> ends up inside that clipping context and either gets cropped or — in
> some PrimeNG layouts — pushes card content out of position. The
> `appendTo="body"` portal renders the panel as a floating overlay so it
> sits above the page regardless of card overflow. This is the
> established project convention (see `roi.component.html`,
> `assessments.component.html`). Same advice for any `<p-select>` inside
> a rounded card with `overflow: hidden`.

### `<p-selectButton>` as a segmented control

Used for the environment scope (All / Dev / Prod) and the trends
granularity (Per Run / Hourly / Daily / Weekly).

```scss
::ng-deep .{scope}-class .p-selectbutton {
  display: inline-flex;
  background: var(--flowx-surface-secondary);
  border: 1px solid var(--flowx-neutrals-100);
  border-radius: 10px;
  padding: 4px;
  gap: 2px;

  .p-togglebutton, .p-button {
    background: transparent !important;
    border: none !important;
    color: var(--flowx-text-secondary) !important;
    padding: 0 16px !important;          // 0 12 for compact
    height: 32px !important;             // 28 for compact
    border-radius: 7px !important;
    font-weight: 600 !important;
    font-size: 13px !important;          // 12 for compact
    line-height: 1 !important;
    box-shadow: none !important;
    transition: background-color 120ms ease, color 120ms ease;

    &.p-togglebutton-checked, &.p-highlight {
      background: var(--flowx-blue-500) !important;
      color: #ffffff !important;
    }
  }
}
```

Dark: pill bg `rgba(255,255,255,0.04)`, border
`rgba(255,255,255,0.08)`, active fill `--flowx-blue-400`.

### `<p-tabs>` (Trends metric tabs)

Flat underline style.

```scss
::ng-deep .{scope}-class .p-tabs {
  .p-tablist, .p-tablist-tab-list {
    border-bottom: 1px solid var(--flowx-neutrals-100);
    padding: 0;
    gap: 0;
  }
  .p-tab {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--flowx-text-secondary);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;

    &.p-tab-active, &[aria-selected="true"] {
      color: var(--flowx-blue-500);
      font-weight: 700;
      border-bottom-color: var(--flowx-blue-500);
    }
  }
  .p-tablist-active-bar { display: none; }
}
```

### `<p-table>`

Use the existing `tokens.table-modern` mixin from
`_shared/ai-design-tokens.scss`. Don't add new table styling — only
restyle row pills (score, status) via `.eval-score-badge`-style classes.

### `<p-dialog>`, `<p-drawer>`, `<p-toast>`

Untouched.

---

## Specific patterns ported in this session

### Gauge (donut)

| Property | Value |
|---|---|
| Diameter | 168px |
| Stroke | 14px |
| Track | `var(--flowx-neutrals-100)` light · `rgba(255,255,255,0.08)` dark |
| Center value | 28/1/800 tabular-nums |
| Center label | Overline (10/12/700 uppercase, 0.08em letter-spacing), 4px below value, max-width 100px |

### Health row tile

- White bordered tile (`.eval-health__item`), padding 14/16, radius 12
- Row: 10px status dot with 4px halo + 15px icon + 14/600 label + tinted status text
- Below: 6px progress track on `neutrals-100`, fill in the dot color

### Quality metric row

- 18px gap between rows
- Header: 14/600 label primary + 14/700 value (tinted by score)
- 6px pill bar (`neutrals-100` track, fill in the value color)

### Alert row

- Side-stripe (`border-left: 4px`) + saturated `-50` background +
  `neutrals-100` perimeter — radius 10
- Icon tile 36×36, radius 10, tinted bg + fg in the same tint family
- Title 15/1.2/700, meta 13 secondary, details 12 secondary

### Score / status pill (in tables)

See **Pill chips** above. Same body, different tint families.

---

## Dark mode (complements CLAUDE.md)

CLAUDE.md is the binding rule (always ship the dark counterpart in the
same change). This file documents the specific tints adopted in this
session:

| Light | Dark equivalent |
|---|---|
| `var(--flowx-blue-50)` icon-tile bg | `rgba(51,137,224, 0.18-0.20)` |
| `var(--flowx-blue-100)` hero gradient stop | `rgba(51,137,224, 0.30)` |
| `var(--flowx-green-50)` tile bg | `rgba(0,128,96, 0.20-0.25)` |
| `var(--flowx-yellow-50)` tile bg | `rgba(254,185,19, 0.18-0.22)` |
| `var(--flowx-red-50)` tile bg | `rgba(230,34,0, 0.18-0.22)` |
| `var(--flowx-neutrals-100)` border | `rgba(255,255,255, 0.06)` |
| `var(--flowx-shadow-xs)` card shadow | `0 2px 8-12px rgba(0,0,0, 0.30-0.35)` |
| `var(--flowx-blue-500)` primary CTA | `var(--flowx-blue-400)` (then `-500` hover, `-600` pressed) |

For Chart.js / canvas-based widgets, follow CLAUDE.md: read
`document.documentElement.classList.contains('flowx-dark')` at render
time and rebuild options on `LayoutService.configUpdate$`.

---

## Non-destructive redesign rules

When restyling an existing page, always:

1. **Never change PrimeNG component markup, attributes, or event
   bindings.** `<p-select>`, `<p-button>`, `<p-table>`, `<p-tabs>`,
   `<p-dialog>`, etc. all stay byte-for-byte. Restyle only via
   component-scoped SCSS and surgical `::ng-deep` where unavoidable.
2. **Keep every `*ngIf` / `@if`, `*ngFor` / `@for`, `[(ngModel)]`,
   `(onChange)`, `pTooltip` — anything that drives behavior.** The
   redesign is visual only.
3. **Rewrap, don't rename existing functional classes.** When you need
   a new wrapper for layout (`<section class="eval-hero">`), introduce
   it; when you need to scope styles away from a global class that
   carries `!important` rules (`.filters-bar`, `.page-header`), give the
   wrapper a new name (`.eval-hero__filters`) rather than fighting the
   cascade.
4. **Keep the page background.** Don't touch
   `.layout-main-container:has(.ai-page)` /  `:has(.home-page)` rules in
   `flowx-theme.scss`.
5. **Keep dialogs / drawers / toasts.** These live outside the redesign
   scope and continue to use the FlowX theme defaults.

---

## Anti-patterns

- Borders on the hero panel or sub-cards — let `shadow-xs` carry the
  surface.
- `neutrals-50` borders on internal tiles — visually invisible on the
  page background; always `neutrals-100`.
- Nested cards (a card inside a card inside another card). Tiles inside
  a sub-card are allowed; a sub-card inside a sub-card is not.
- Decorative blue gradients outside the hero band. Sub-cards stay flat
  white.
- Side-stripe borders (`border-left: 4px`) outside alert rows.
- `flex justify-content: space-between` for hero-band alignment when the
  right-side content can shrink — use grid + `justify-self: end` so the
  right edge anchors regardless of intrinsic width.
- Hardcoded hex values outside `#ffffff` (white text on a filled button)
  and the rgba tints listed above. Everything else is a FlowX token.
- Per-page typography overrides on `.card-title`, `.page-header__title`,
  `.section-header__title` — the scale is set here and in `redesign.md`.
- Increasing KPI value font size beyond 22px in sub-cards because a
  reference design uses 26 or 30 — the home page is the source of truth.

---

## Pages on this system

| Page | File | Status |
|---|---|---|
| Home dashboard | `src/app/ai/home/home.component.{html,scss}` | ✅ done |
| Project card | `src/app/ai/home/components/app-details/app-details.component.{html,scss}` | ✅ done |
| Agent Evaluations | `src/app/ai/insights-dashboard/insights.component.{html,scss}` | ✅ done |
| Drift Monitor | `src/app/ai/drift/drift.component.{html,scss}` | ✅ done |
| Datasets, Runs, RSI, Dashboard, … | — | pending |

When picking up another `/ai/*` page, read this file first plus
`redesign.md` and CLAUDE.md, then follow the hero-panel / sub-card /
internal-tile rhythm above.
