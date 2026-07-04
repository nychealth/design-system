# @nychealth/design-system

Shared design tokens, hooks, and components for NYC Health web products.
Built by reconciling two existing apps — `community-health-profiles` (CHP)
and `respiratory-virus-data-pages` (RVP) — into a single source of truth.

Status: **v0.1.2 in progress** (v0.1.0 and v0.1.1 are published on GitHub
Packages; v0.1.1 has a known layout-breaking bug — see "Known issues" — and
should not be installed). CHP has the fix verified locally and is otherwise
integrated; confirm the `v0.1.2` Actions run succeeds and CHP has actually
pulled it before treating this as done. RVP has not adopted the package yet
— see "Known issues" and "Open decisions" below before RVP integrates or
before cutting v1.0.0.

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

Published to GitHub Packages.

```
npm install @nychealth/design-system
```

Requires a `.npmrc` with the GitHub Packages registry configured:

```
@nychealth:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

`NPM_TOKEN` needs `read:packages` scope for installing (this repo's own
publish workflow uses a separate token with `write:packages` — don't reuse
that one in consuming app repos).

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

## Known issues

- **Do not register `--spacing-*` inside `theme.css`'s `@theme inline`
  block.** Confirmed via live bisection in CHP (2026-07-04): exposing named
  `--spacing-{xs..3xl}` keys as a Tailwind theme namespace broke Tailwind
  v4's `max-w-*`/container utility resolution — `max-w-xl` collapsed to a
  near-zero width, which showed up as a header whose subtitle text wrapped
  one word per line and inflated the header to 5-10x its normal height.
  Root cause wasn't fully isolated (suspected collision in how Tailwind
  v4.2.2 resolves named scale entries that share suffixes with its
  `--container-*`/`--text-*` namespaces, but not proven), but toggling just
  that block reproduced and fixed the bug reliably. Fix, currently in place:
  `--spacing-*` values still live in `tokens.css` as plain CSS custom
  properties (so `var(--spacing-md)` etc. keep working everywhere they're
  already used) but are **not** re-declared in `theme.css`, so no
  `p-md`/`gap-2xl`-style Tailwind utility classes exist for them. If you
  need those utility classes in the future, don't just re-add the block —
  set up a real Tailwind v4 build (native lightningcss binary matching your
  OS/arch) and verify `max-w-*` still resolves correctly before shipping it.
  Cost 3 broken package versions (`0.1.1`, an aborted `0.1.2` attempt) to
  find — package versions jump from `0.1.0` to `0.1.2` in the registry
  history for this reason.
- **`--gray-900` is mislabeled.** It resolves to `#1f2937`, which is
  actually Tailwind's `gray-800` value — true `gray-900` is `#111827`. CHP's
  original `--color-text-primary` used `#111827` directly and is currently
  kept as a local override in CHP's `globals.css` specifically to avoid
  inheriting this wrong value. Fixing `--gray-900` here would also change
  `--footer-bg`, `--header-title-color`-adjacent surfaces, `--card-title-color`,
  and anything else that references `var(--gray-900)` — worth a deliberate
  pass with visual QA in both apps, not a quick edit.

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
- **RVP's dark mode.** RVP's original `src/styles/tokens.css` has a full
  `[data-theme="dark"]` block (dark-mode overrides for header, tooltip,
  chip colors, etc.) that never made it into this package's `tokens.css` —
  CHP has no dark mode, so it wasn't missed until RVP's turn came up. If RVP
  drops its local `tokens.css` in favor of this package as-is, it silently
  loses dark mode. Port that block into this repo's `tokens.css` before RVP
  fully switches over.
- **Header/Footer/Modal/TopBar component alias tokens are RVP-only in
  practice.** `--header-bg`, `--footer-bg`, `--modal-bg`, `--top-bar-*`,
  `--card-*` in `tokens.css` are consumed by RVP's `Header`/`Footer`/
  `TopBar`/`InfoModal` components; CHP has no equivalently-named components
  (it has `PageHeader`, `IntroModal`, `CategoryHeader` instead) and consumes
  none of these vars. Not a bug, but don't assume this layer is
  cross-app-tested just because it exists in the shared file.

## Integration status

- [x] Repo pushed to `github.com/nychealth/design-system`.
- [x] `NPM_TOKEN` (`write:packages`) added to this repo's Actions settings;
      publish workflow (`.github/workflows/publish.yml`) confirmed working
      for `v0.1.0`. `v0.1.1` published successfully but contains the
      spacing bug (see "Known issues") — don't install it. `v0.1.2` has the
      fix committed; confirm its Actions run is green before relying on it.
- [x] **CHP**: `.npmrc` + `NPM_TOKEN` (`read:packages`) added,
      `globals.css` imports `tokens.css`/`theme.css`, `data-brand="chp"` set
      on the root `<html>` element, spacing bug fix verified locally. One
      local override kept in `globals.css` (`--color-text-primary`) pending
      the `--gray-900` fix above. [ ] Still needs: confirm CHP has actually
      installed the published `v0.1.2` (not just the local hand-edited
      workaround) and re-verify clean.
- [ ] **RVP**: not started. Before RVP adopts this package: port RVP's dark
      mode block into `tokens.css` (see "Open decisions"), and expect to
      trim `theme.extend.colors` out of RVP's `tailwind.config.js` once its
      `globals.css`/`index.css` imports `theme.css`.
- [ ] Visual QA pass in both apps once RVP is wired up.
