import { Given, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PodiumResponsiveStyles {
  argumentCardCss: string;
  debateScreenCss: string;
  legendBarCss: string;
  podiumBottomSheetCss: string;
  podiumFabCss: string;
  timelineCss: string;
}

let podiumResponsiveStyles: PodiumResponsiveStyles | null = null;

function activeStyles(): PodiumResponsiveStyles {
  assert.ok(
    podiumResponsiveStyles,
    'Expected podium responsive stylesheet sources to be loaded.'
  );
  return podiumResponsiveStyles;
}

function mediaBlock(css: string, mediaQuery: string): string {
  const startIndex = css.indexOf(mediaQuery);
  assert.ok(startIndex >= 0, `Expected media query "${mediaQuery}" to be present.`);
  const nextMediaIndex = css.indexOf('@media', startIndex + mediaQuery.length);
  return nextMediaIndex === -1 ? css.slice(startIndex) : css.slice(startIndex, nextMediaIndex);
}

Given('the podium responsive stylesheet sources are loaded', function () {
  podiumResponsiveStyles = {
    argumentCardCss: readFileSync(
      resolve(process.cwd(), 'src/styles/components/argument-card.css'),
      'utf-8'
    ),
    debateScreenCss: readFileSync(
      resolve(process.cwd(), 'src/styles/debate-screen.css'),
      'utf-8'
    ),
    legendBarCss: readFileSync(
      resolve(process.cwd(), 'src/styles/components/legend-bar.css'),
      'utf-8'
    ),
    podiumBottomSheetCss: readFileSync(
      resolve(process.cwd(), 'src/styles/components/podium-bottom-sheet.css'),
      'utf-8'
    ),
    podiumFabCss: readFileSync(
      resolve(process.cwd(), 'src/styles/components/podium-fab.css'),
      'utf-8'
    ),
    timelineCss: readFileSync(
      resolve(process.cwd(), 'src/styles/components/timeline.css'),
      'utf-8'
    ),
  };
});

Then('AC-25 tablet-tier podium layout values are present', function () {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles();

  const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
  const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
  const tabletDarkScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 768px) and (max-width: 1023px)'
  );

  assert.ok(tabletFabBlock.includes('var(--space-8)'));
  assert.ok(tabletSheetBlock.includes('max-width: 600px;'));
  assert.ok(tabletDarkScrimBlock.includes('[data-theme="dark"] .podium-sheet-scrim'));
  assert.ok(tabletDarkScrimBlock.includes('rgba(0, 0, 0, 0.48)'));
});

Then('AC-26 desktop-tier podium layout values are present', function () {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles();

  const desktopFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 1024px)');
  const desktopSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 1024px)');

  assert.ok(desktopFabBlock.includes('var(--space-12)'));
  assert.ok(desktopSheetBlock.includes('max-width: 720px;'));
  assert.ok(podiumBottomSheetCss.includes('.podium-sheet-scrim'));
  assert.ok(podiumBottomSheetCss.includes('rgba(0, 0, 0, 0.36)'));
  assert.ok(podiumBottomSheetCss.includes('rgba(0, 0, 0, 0.52)'));
});

Then('AC-27 mobile-tier podium baseline values remain unchanged', function () {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles();

  assert.ok(podiumFabCss.includes('right: var(--space-4);'));
  assert.ok(podiumFabCss.includes('bottom: var(--space-4);'));
  assert.ok(podiumBottomSheetCss.includes('max-width: 390px;'));
  assert.ok(podiumBottomSheetCss.includes('background: var(--color-scrim);'));
});

Then('AC-28 the 481px comments are reclassified as mobile-internal', function () {
  const { argumentCardCss, debateScreenCss, legendBarCss, timelineCss } = activeStyles();

  assert.ok(
    timelineCss.includes('mobile-internal layout adjustment (≥481px) — not a design tier')
  );
  assert.equal(timelineCss.includes('Tablet (\u2265481px)'), false);

  assert.ok(debateScreenCss.includes('mobile-internal (≥481px) — not a design tier'));
  assert.equal(debateScreenCss.includes('/* ── Tablet ── */'), false);

  assert.ok(legendBarCss.includes('mobile-internal (≥481px) — not a design tier'));
  assert.equal(legendBarCss.includes('Tablet and above'), false);

  assert.ok(argumentCardCss.includes('mobile-internal (≥481px) — not a design tier'));
});

Then('AC-29 Figma tablet values are wired in responsive CSS', function () {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles();

  const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
  const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
  const tabletDarkScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 768px) and (max-width: 1023px)'
  );

  assert.ok(tabletFabBlock.includes('var(--space-8)'));
  assert.ok(tabletSheetBlock.includes('max-width: 600px;'));
  assert.ok(tabletDarkScrimBlock.includes('rgba(0, 0, 0, 0.48)'));
});

Then('AC-30 Figma desktop values are wired in responsive CSS', function () {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles();

  const desktopFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 1024px)');
  const desktopSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 1024px)');

  assert.ok(desktopFabBlock.includes('var(--space-12)'));
  assert.ok(desktopSheetBlock.includes('max-width: 720px;'));
  assert.ok(podiumBottomSheetCss.includes('rgba(0, 0, 0, 0.36)'));
  assert.ok(podiumBottomSheetCss.includes('rgba(0, 0, 0, 0.52)'));
});
