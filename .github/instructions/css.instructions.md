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
color: var(--color-text-primary);
background: var(--color-scrim);
```

## Theming

Theme variants must use `[data-theme]` attribute selectors. Always include a
`prefers-color-scheme` fallback at the `:root` level for users without JS.

```css
/* Prefer */
:root { --color-bg: #fff; }
@media (prefers-color-scheme: dark) { :root { --color-bg: #0d0d0d; } }
[data-theme="dark"] { --color-bg: #0d0d0d; }
[data-theme="light"] { --color-bg: #fff; }
```

## Safe-Area / Viewport

Use `env(safe-area-inset-*)` with a fallback for all bottom-anchored elements
(FABs, bottom sheets, sticky bars).

```css
/* Prefer */
padding-bottom: max(1rem, env(safe-area-inset-bottom, 0px));
```
