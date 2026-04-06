import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokensCss = readFileSync(
  resolve(process.cwd(), 'src/styles/tokens.css'),
  'utf-8'
);

// Split into light and dark sections for per-block assertions
const darkBlockMatch = tokensCss.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\}/);
const darkBlockIdx = darkBlockMatch?.index ?? -1;
const lightBlock = darkBlockIdx >= 0 ? tokensCss.slice(0, darkBlockIdx) : tokensCss;
const darkBlock = darkBlockMatch?.[0] ?? '';

describe('tokens.css — M3 3-layer token presence', () => {
  // ── Layer 1 + Layer 3: Color tokens (light + dark) ──

  const colorTokens = [
    '--color-surface-default',
    '--color-on-surface',
    '--color-brand-primary',
    '--color-brand-on-primary',
    '--color-spine-line',
    '--color-tark-surface',
    '--color-tark-on-surface',
    '--color-tark-header',
    '--color-vitark-surface',
    '--color-vitark-on-surface',
    '--color-vitark-header',
    '--color-spine-dot',
    '--color-legend-surface',
    '--color-legend-on-surface',
    '--color-legend-separator',
  ];

  it.each(colorTokens)('defines color token %s in light block', (token) => {
    expect(lightBlock).toContain(token);
  });

  it.each(colorTokens)('defines color token %s in dark block', (token) => {
    expect(darkBlock).toContain(token);
  });

  // ── Typography tokens (theme-invariant) ──

  const typographyTokens = [
    '--font-family-plain',
    '--typescale-headline-lg-size',
    '--typescale-headline-lg-line-height',
    '--typescale-headline-lg-weight',
    '--typescale-headline-lg-tracking',
    '--typescale-body-lg-size',
    '--typescale-body-lg-line-height',
    '--typescale-body-lg-weight',
    '--typescale-body-lg-tracking',
    '--typescale-label-md-size',
    '--typescale-label-md-line-height',
    '--typescale-label-md-weight',
    '--typescale-label-md-tracking',
  ];

  it.each(typographyTokens)('defines typography token %s', (token) => {
    expect(tokensCss).toContain(token);
  });

  // ── Spacing tokens ──

  const spacingTokens = [
    '--space-4',
    '--space-8',
    '--space-12',
    '--space-card-padding',
  ];

  it.each(spacingTokens)('defines spacing token %s', (token) => {
    expect(tokensCss).toContain(token);
  });

  // ── Shape tokens ──

  it('defines radius token --radius-sharp', () => {
    expect(tokensCss).toContain('--radius-sharp');
  });

  it('defines radius token --radius-round', () => {
    expect(tokensCss).toContain('--radius-round');
  });

  // ── Dimension token ──

  it('defines dimension token --divider-thickness', () => {
    expect(tokensCss).toContain('--divider-thickness');
  });

  // ── Structure: M3 3-layer comments present ──

  it('includes Layer 1 M3 Baseline comment', () => {
    expect(tokensCss).toContain('Layer 1');
  });

  it('includes Layer 2 Brand Override comment', () => {
    expect(tokensCss).toContain('Layer 2');
  });

  it('includes Layer 3 Functional Override comment', () => {
    expect(tokensCss).toContain('Layer 3');
  });

  // ── Theme blocks ──

  it('defines [data-theme="dark"] block', () => {
    expect(tokensCss).toContain('[data-theme="dark"]');
  });

  it('defines prefers-color-scheme dark fallback for :root:not([data-theme])', () => {
    expect(tokensCss).toContain('prefers-color-scheme: dark');
    expect(tokensCss).toContain(':root:not([data-theme])');
  });

  // ── Old tokens removed ──

  it('does not use old --color-surface-primary token name', () => {
    expect(tokensCss).not.toContain('--color-surface-primary');
  });

  it('does not use old --color-text-primary token name', () => {
    expect(tokensCss).not.toContain('--color-text-primary');
  });
});
