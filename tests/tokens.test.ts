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

  // ── Figma-verified exact values (source of truth: Figma frames 22:4 / 22:32) ──

  const lightColorValues: [string, string][] = [
    ['--color-surface-default', '#FFFBFF'],
    ['--color-on-surface', '#1C1B1F'],
    ['--color-brand-primary', '#4555B7'],
    ['--color-brand-on-primary', '#FFFFFF'],
    ['--color-spine-line', '#767680'],
    ['--color-tark-surface', '#BBDEFB'],
    ['--color-tark-on-surface', '#0D47A1'],
    ['--color-tark-header', '#1565C0'],
    ['--color-vitark-surface', '#FFECB3'],
    ['--color-vitark-on-surface', '#BF360C'],
    ['--color-vitark-header', '#EF6C00'],
    ['--color-spine-dot', '#9E9E9E'],
    ['--color-legend-surface', '#F5F5F5'],
    ['--color-legend-on-surface', '#4D4D4D'],
    ['--color-legend-separator', '#999999'],
  ];

  it.each(lightColorValues)('light %s equals %s', (token, value) => {
    expect(lightBlock).toContain(`${token}: ${value}`);
  });

  const darkColorValues: [string, string][] = [
    ['--color-surface-default', '#1B1B1F'],
    ['--color-on-surface', '#E6E1E5'],
    ['--color-brand-primary', '#BBC3FF'],
    ['--color-brand-on-primary', '#0E2288'],
    ['--color-spine-line', '#90909A'],
    ['--color-tark-surface', '#1565C0'],
    ['--color-tark-on-surface', '#E3F2FD'],
    ['--color-tark-header', '#90CAF9'],
    ['--color-vitark-surface', '#BF360C'],
    ['--color-vitark-on-surface', '#FFF8E1'],
    ['--color-vitark-header', '#FFB74D'],
    ['--color-spine-dot', '#616161'],
    ['--color-legend-surface', '#1C1C1C'],
    ['--color-legend-on-surface', '#BFBFBF'],
    ['--color-legend-separator', '#666666'],
  ];

  it.each(darkColorValues)('dark %s equals %s', (token, value) => {
    expect(darkBlock).toContain(`${token}: ${value}`);
  });

  // ── Typography exact values (Figma-verified) ──

  it('headline-lg: 2rem / 2.5rem / 400 / tracking 0', () => {
    expect(lightBlock).toContain('--typescale-headline-lg-size: 2rem');
    expect(lightBlock).toContain('--typescale-headline-lg-line-height: 2.5rem');
    expect(lightBlock).toContain('--typescale-headline-lg-weight: 400');
    expect(lightBlock).toContain('--typescale-headline-lg-tracking: 0');
  });

  it('body-lg: 1rem / 1.5rem / 400 / tracking 0', () => {
    expect(lightBlock).toContain('--typescale-body-lg-size: 1rem');
    expect(lightBlock).toContain('--typescale-body-lg-line-height: 1.5rem');
    expect(lightBlock).toContain('--typescale-body-lg-weight: 400');
    expect(lightBlock).toContain('--typescale-body-lg-tracking: 0;');
  });

  it('label-md: 0.75rem / 1rem / 500 / tracking 0.03125rem', () => {
    expect(lightBlock).toContain('--typescale-label-md-size: 0.75rem');
    expect(lightBlock).toContain('--typescale-label-md-line-height: 1rem');
    expect(lightBlock).toContain('--typescale-label-md-weight: 500');
    expect(lightBlock).toContain('--typescale-label-md-tracking: 0.03125rem');
  });

  // ── Shape exact values (Figma-verified) ──

  it('radius-sharp is 4px and radius-round is 12px', () => {
    expect(lightBlock).toContain('--radius-sharp: 4px');
    expect(lightBlock).toContain('--radius-round: 12px');
  });

  // ── Dimension exact value (Figma-verified: spine line w-[2px]) ──

  it('divider-thickness is 2px', () => {
    expect(lightBlock).toContain('--divider-thickness: 2px');
  });
});
