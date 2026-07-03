/**
 * @nychealth/design-system — tokens.js
 *
 * JS-side design tokens: chart/Vega colors, virus accent colors, and health
 * direction colors that need to be readable from JS (Vega-Lite specs, chart
 * theming) rather than just CSS.
 *
 * Sourced from respiratory-virus-data-pages' tokens.js, plus a `health`
 * export merged in from community-health-profiles' globals.css.
 *
 * WHO EDITS THIS FILE
 * ───────────────────
 * • Chart / sparkline / virus colors  → edit `colorScales` below
 * • Health direction (better/worse)   → edit `health` below; keep in sync
 *   with --color-health-* in tokens.css (same hex values, two formats)
 * • Font sizes                        → edit `typography.fontSize` below;
 *   keep in sync with the --font-size-* scale in tokens.css (same values,
 *   px numbers here instead of rem strings — see note above `fontSize`)
 * • UI colors (header, footer, links) → edit tokens.css instead
 */

// ── Grayscale ────────────────────────────────────────────────────────────
const colors = {
  white: "#FFFFFF",
  black: "#000000",
  gray100: "#F9FAFB",
  gray200: "#F3F4F6",
  gray300: "#E5E7EB",
  gray400: "#D1D5DB",
  gray500: "#9CA3AF",
  gray600: "#6B7280",
  gray700: "#4B5563",
  gray800: "#374151",
  gray900: "#1F2937",
  grayTransparent: "rgba(0, 0, 0, 0)",

  // Virus primary colours (card headers, icon tints)
  purplePrimary: "#8739B7", // COVID-19
  purpleAccent: "#BC6AEB",
  tealPrimary: "#387781", // Flu
  tealAccent: "#629FAA",
  orangePrimary: "#AA4C34", // RSV
  orangeAccent: "#D47056",

  // UI accent — mirrors --color-brand in tokens.css
  blueAccent: "#1d4ed8",

  // Semantic backgrounds
  bgLightBlue: "#08519C26",
  bgLightPurple: "#4A148624",
  bgLightGreen: "#00441A26",
  bgLightOrange: "#AA4C3466",
  bgLightRed: "#AF233F66",
  bgLightTeal: "#38778166",
  bgMutedPink: "#F4C4A5",
  bgMutedPurple: "#F5F3FF",
  bgMutedGray: "#ADAEBC",
  bgOrange: "#AA4C34",
  bgPurple: "#8739B7",
  bgTeal: "#387781",
  bgBlue: "#2248c5",
};

// ── Health direction ─────────────────────────────────────────────────────
// Mirrors --color-health-* in tokens.css. Kept as hex here (rather than
// referencing CSS vars) because Vega-Lite specs need literal color values.
const health = {
  better: "#15803d",
  worse: "#b91c1c",
  neutral: "#4b5563",
  betterBg: "#f0fdf4",
  worseBg: "#fef2f2",
  neutralBg: "#f9fafb",
  // Comparison highlight — confirmed to match RVP's chip-inc-text (#d97706),
  // so this is a single value shared by both apps already.
  comparison: "#d97706",
};

// ── Chart colour scales ──────────────────────────────────────────────────
// Each array is ordered dark→light. Index [2] is the primary display colour
// used for the page accent, card headers, and sparklines.
const colorScales = {
  covid: [
    "#520583", // [0] darkest
    "#1F003D", // [1] dark
    "#8739B7", // [2] primary ← drives page accent + chart line
    "#BC6AE8", // [3] light
    "#A020C8", // [4] lightest
  ],
  flu: [
    "#03515B",
    "#002B35",
    "#387781",
    "#629FAA",
    "#2F8F9D",
  ],
  rsv: [
    "#570000",
    "#812816",
    "#AA4C34",
    "#D47056",
    "#B5523A",
  ],
  ari: ["#26A69A"],
};

// ── Virus accent colours ─────────────────────────────────────────────────
// Single source of truth for per-virus UI accent. Changing colorScales[x][2]
// above automatically updates these.
export const virusAccentColors = {
  "COVID-19": colorScales.covid[2],
  "Flu": colorScales.flu[2],
  "RSV": colorScales.rsv[2],
};

// ── Spacing / typography / radii / shadows ───────────────────────────────
const spacing = { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" };

// Font sizes mirror the --font-size-* scale in tokens.css (kept in sync
// manually — see note at the top of this file). Values are unitless px
// numbers here, not rem strings, because Vega-Lite specs and inline chart
// styles need literal numbers (e.g. `labelFontSize: 12`).
//
// Audited both apps before writing this (2026-07-03): `fontSizeBase` and
// `fontSizeLg` existed here before but were never actually read anywhere —
// every real consumer (RVP's vegaTheme.js and its chart components) only
// used `typography.body`/`typography.heading` for font-family, while chart
// font sizes were hardcoded as raw numbers scattered across 8 files
// (10, 11, 12, 13, 14, 16). Those numbers already line up with the CSS
// scale below (12=label, 13=sm, 14=body, 16=read) — this object gives
// future chart work a named source instead of magic numbers.
const fontSize = {
  label: 12,
  sm: 13,
  body: 14,
  read: 16,
  lg: 18,
  "2xl": 20,
  xl: 30,
};
const typography = {
  body: '"Inter", sans-serif',
  heading: '"Inter", sans-serif',
  fontSize,
  weightBold: "bold",
};
const radii = { sm: "4px", md: "6px", lg: "8px" };
const shadows = { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)" };

export const tokens = {
  colors,
  health,
  spacing,
  typography,
  radii,
  shadows,
  colorScales,
};
