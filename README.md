# @nychealth/design-system

Shared design tokens, hooks, and components for NYC Health web products.
Built by reconciling two existing apps — `community-health-profiles` (CHP)
and `respiratory-virus-data-pages` (RVP) — into a single source of truth.

Status: **v0.1.0, working draft.** Not yet published. See "Open decisions"
below before publishing v1.0.0.

## What's here

```
tokens/
  tokens.css   — CSS custom properties: colors, spacing, radius, shadow
  theme.css    — Tailwind v4 `@theme inline` layer (maps tokens.css → utility classes)
  tokens.js    — JS tokens: chart/Vega colors, virus accent colors, health direction
  index.js     — JS tokens re-export
hooks/
  useAnimatedNumber.js  — smooth rAF-based number animation (from RVP)
  useIsMobile.js        — matchMedia-based mobile breakpoint hook (from RVP)
components/
  MarkdownContent.jsx   — styled markdown renderer (from CHP), uses next/dynamic
```

Both CHP and RVP are Next.js apps (not Vite, despite an earlier assumption in
this repo's history) — `MarkdownContent` relies on that and uses
`next/dynamic` to code-split `react-markdown`, matching CHP's original
implementation.

## Install

Not yet published to GitHub Packages (see "Remaining manual steps"). Once
published:

```
npm install @nychealth/design-system
```

Requires a `.npmrc` with the GitHub Packages registry configured:

```
@nychealth:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

## Usage

### Tokens (CSS)

In your app's CSS entry point, **import tokens.css before theme.css**:

```css
@import "tailwindcss";
@import "@nychealth/design-system/tokens.css";
@import "@nychealth/design-system/theme.css";
```

`theme.css` requires Tailwind v4 (`@theme inline`). Both CHP and RVP are
already on v4, but via different patterns: CHP is CSS-first (`@theme inline`
only), while RVP still loads a JS `tailwind.config.js` via `@config` for its
`theme.extend.colors` block. Tailwind v4 merges both sources, so RVP can add
the two imports above alongside its existing `@config` line without
conflict — but once it does, the color mappings inside
`tailwind.config.js` (`blue-primary`, `gray-100`, etc.) become redundant
with `theme.css` and should be deleted to avoid two sources of truth for
the same utility classes.

### Brand variants

Different apps use different brand blues (CHP `#1d4ed8`, RVP `#1E40AF`), and
more apps are expected to join this design system over time, so brand color
is handled as a named variant inside `tokens.css` rather than a value each
app forks locally. Set `data-brand` on your app's root element:

```jsx
// e.g. CHP's root layout
<html data-brand="chp">
```

```jsx
// e.g. RVP's root layout
<html data-brand="rvp">
```

`tokens.css` has a `[data-brand="chp"]` / `[data-brand="rvp"]` block that
overrides `--color-brand` for that subtree. Everything else (`--header-bg`,
`--blue-primary`, button/tab active states, etc.) already references
`--color-brand` via `var()`, so it repaints automatically — no per-component
changes needed. An app that doesn't set `data-brand` falls back to the
`:root` default (CHP's value).

**Adding a new app:** add one `[data-brand="yourapp"] { --color-brand: ...; }`
block to `tokens.css` in this repo — don't fork the file. If a future app
needs more than just its brand blue to differ (e.g. its own `--color-action`),
add those vars to its block too, following the same pattern.

### Tokens (JS — charts, Vega specs)

```js
import { tokens, virusAccentColors } from "@nychealth/design-system/tokens";

tokens.health.worse       // "#b91c1c"
tokens.colorScales.covid  // ["#520583", ..., "#8739B7", ...]
virusAccentColors["Flu"]  // "#387781"
```

### Hooks

```jsx
import { useAnimatedNumber, useIsMobile } from "@nychealth/design-system/hooks";

const displayValue = useAnimatedNumber(count);
const isMobile = useIsMobile();
```

### Components

```jsx
import { MarkdownContent } from "@nychealth/design-system/components";

<MarkdownContent content={markdownString} />
```

`MarkdownContent` only renders — it doesn't fetch files or extract sections.
Keep app-specific content loading (CHP's flyout `.md` fetches, RVP's
`## Section` extraction via `resolveContentPath`/`interpolateTokens`) in
each app, and pass the resolved string in as `content`.

## Open decisions (resolve before v1.0.0)

- **RVP's `tailwind.config.js`.** Both apps are on Tailwind v4, so no version
  migration is needed. RVP does still carry a JS config (loaded via
  `@config`) with its own `theme.extend.colors` mapping — once RVP adopts
  `theme.css`, that block duplicates what the package now provides and
  should be trimmed down or removed to keep one source of truth.
- **StatCard.** Both apps have a StatCard-shaped component but the
  implementations diverge more than tokens/hooks/MarkdownContent did — not
  extracted yet. Worth a closer look once the token layer has settled in
  both apps.

## Remaining manual steps

These require GitHub/npm access this environment doesn't have:

1. Push this repo's initial commit to `github.com/nychealth/design-system`.
2. Add an `NPM_TOKEN` secret (a token with `write:packages`) to this repo's
   Actions settings, then tag a release (e.g. `v0.1.0`) to trigger
   `.github/workflows/publish.yml`.
3. In each consuming app repo (CHP, RVP), add the `.npmrc` block above and
   an `NPM_TOKEN` secret with `read:packages`, then `npm install
   @nychealth/design-system`.
4. In CHP's `globals.css` and RVP's `index.css`, replace the local token
   blocks with the import shown under "Tokens (CSS)" above, add
   `data-brand="chp"` / `data-brand="rvp"` to each app's root element (see
   "Brand variants"), then do a visual QA pass.
