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

`theme.css` requires Tailwind v4 (`@theme inline`). If an app is still on
Tailwind v3, import `tokens.css` only and map colors manually in
`tailwind.config.js` via `theme.extend`.

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

- **Brand color conflict.** CHP's `--color-brand` is `#1d4ed8`; RVP's
  `--blue-primary` was `#1E40AF`. `tokens.css` currently defaults to CHP's
  value and aliases `--blue-primary` to it. This means RVP's header
  gradient will shift slightly once RVP adopts this package. Needs a call
  from whoever owns visual identity for both products.
- **Tailwind version.** RVP is currently on Tailwind v3; `theme.css` in
  this package assumes v4. RVP needs to migrate before it can use
  `theme.css` (it can still use `tokens.css` standalone in the meantime).
  This is a Tailwind-version gap only — both apps are Next.js, so no
  framework migration is needed for `MarkdownContent` or the hooks.
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
   blocks with the import shown under "Tokens (CSS)" above, then do a
   visual QA pass — especially around the brand color decision.
