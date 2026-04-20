---
applyTo: "**/*.css"
---
# CSS Standards

## Token Usage

All color, spacing, and shared style values must use CSS custom properties
from `src/styles/tokens.css`. No hardcoded hex, rgb, hsl, or pixel values
for anything covered by the token system.

```css
/* Avoid */
color: #1a1a1a;
background: rgba(0, 0, 0, 0.5);

/* Prefer */
color: var(--color-on-surface);
background: var(--color-scrim);
```

## Theming

Theme variants must use `[data-theme]` attribute selectors. Always include a
`prefers-color-scheme` fallback at the `:root` level for users without JS.

```css
/* Prefer: keep color token definitions in src/styles/tokens.css */
:root { color-scheme: light; }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) { color-scheme: dark; }
}

[data-theme="dark"] { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }

/* Component CSS should consume shared tokens rather than redefine them */
.theme-demo {
  color: var(--color-on-surface);
  background: var(--color-scrim);
}
```

## Safe-Area / Viewport

Use `env(safe-area-inset-*)` with a fallback for all bottom-anchored elements
(FABs, bottom sheets, sticky bars).

```css
/* Prefer */
padding-bottom: max(var(--space-4), env(safe-area-inset-bottom, 0px));
```
