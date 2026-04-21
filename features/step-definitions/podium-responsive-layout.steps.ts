import { After, Before, Given, Then, World } from '@cucumber/cucumber';
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

type PodiumResponsiveLayoutWorld = World & {
  podiumResponsiveStyles?: PodiumResponsiveStyles;
};

function activeStyles(world: PodiumResponsiveLayoutWorld): PodiumResponsiveStyles {
  assert.ok(
    world.podiumResponsiveStyles,
    'Expected podium responsive stylesheet sources to be loaded.'
  );
  return world.podiumResponsiveStyles;
}

function mediaBlock(css: string, mediaQuery: string, occurrence = 1): string {
  let startIndex = -1;
  let searchFrom = 0;

  for (let count = 0; count < occurrence; count += 1) {
    startIndex = css.indexOf(mediaQuery, searchFrom);
    assert.ok(startIndex >= 0, `Expected media query "${mediaQuery}" occurrence ${occurrence} to be present.`);
    searchFrom = startIndex + mediaQuery.length;
  }

  const nextMediaIndex = css.indexOf('@media', startIndex + mediaQuery.length);
  return nextMediaIndex === -1 ? css.slice(startIndex) : css.slice(startIndex, nextMediaIndex);
}

Before(function (this: PodiumResponsiveLayoutWorld) {
  this.podiumResponsiveStyles = undefined;
});

After(function (this: PodiumResponsiveLayoutWorld) {
  this.podiumResponsiveStyles = undefined;
});

Given('the podium responsive stylesheet sources are loaded', function (this: PodiumResponsiveLayoutWorld) {
  this.podiumResponsiveStyles = {
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

Then('AC-25 tablet-tier podium layout values are present', function (this: PodiumResponsiveLayoutWorld) {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles(this);

  const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
  const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
  const tabletDarkScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 768px) and (max-width: 1023px)'
  );

  assert.match(
    tabletFabBlock,
    /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
  );
  assert.match(
    tabletFabBlock,
    /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
  );
  assert.ok(tabletSheetBlock.includes('max-width: 600px;'));
  assert.ok(tabletDarkScrimBlock.includes('[data-theme="dark"] .podium-sheet-scrim'));
  assert.ok(tabletDarkScrimBlock.includes('rgba(0, 0, 0, 0.48)'));
});

Then('AC-26 desktop-tier podium layout values are present', function (this: PodiumResponsiveLayoutWorld) {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles(this);

  const desktopFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 1024px)');
  const desktopSheetWidthBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 1024px)',
    1
  );
  const desktopScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 1024px)',
    2
  );

  assert.match(
    desktopFabBlock,
    /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
  );
  assert.match(
    desktopFabBlock,
    /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
  );
  assert.ok(desktopSheetWidthBlock.includes('max-width: 720px;'));
  assert.ok(desktopScrimBlock.includes('.podium-sheet-scrim'));
  assert.ok(desktopScrimBlock.includes('[data-theme="dark"] .podium-sheet-scrim'));
  assert.ok(desktopScrimBlock.includes('rgba(0, 0, 0, 0.36)'));
  assert.ok(desktopScrimBlock.includes('rgba(0, 0, 0, 0.52)'));
});

Then('AC-27 mobile-tier podium baseline values remain unchanged', function (this: PodiumResponsiveLayoutWorld) {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles(this);

  assert.ok(podiumFabCss.includes('right: var(--space-4);'));
  assert.ok(podiumFabCss.includes('bottom: var(--space-4);'));
  assert.ok(podiumBottomSheetCss.includes('max-width: 390px;'));
  assert.ok(podiumBottomSheetCss.includes('background: var(--color-scrim);'));
});

Then('AC-28 the 481px comments are reclassified as mobile-internal', function (this: PodiumResponsiveLayoutWorld) {
  const { argumentCardCss, debateScreenCss, legendBarCss, timelineCss } = activeStyles(this);

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

Then('AC-29 Figma tablet values are wired in responsive CSS', function (this: PodiumResponsiveLayoutWorld) {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles(this);

  const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
  const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
  const tabletDarkScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 768px) and (max-width: 1023px)'
  );

  assert.match(
    tabletFabBlock,
    /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
  );
  assert.match(
    tabletFabBlock,
    /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
  );
  assert.ok(tabletSheetBlock.includes('max-width: 600px;'));
  assert.ok(tabletDarkScrimBlock.includes('rgba(0, 0, 0, 0.48)'));
});

Then('AC-30 Figma desktop values are wired in responsive CSS', function (this: PodiumResponsiveLayoutWorld) {
  const { podiumFabCss, podiumBottomSheetCss } = activeStyles(this);

  const desktopFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 1024px)');
  const desktopSheetWidthBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 1024px)',
    1
  );
  const desktopScrimBlock = mediaBlock(
    podiumBottomSheetCss,
    '@media (min-width: 1024px)',
    2
  );

  assert.match(
    desktopFabBlock,
    /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
  );
  assert.match(
    desktopFabBlock,
    /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
  );
  assert.ok(desktopSheetWidthBlock.includes('max-width: 720px;'));
  assert.ok(desktopScrimBlock.includes('.podium-sheet-scrim'));
  assert.ok(desktopScrimBlock.includes('[data-theme="dark"] .podium-sheet-scrim'));
  assert.ok(desktopScrimBlock.includes('rgba(0, 0, 0, 0.36)'));
  assert.ok(desktopScrimBlock.includes('rgba(0, 0, 0, 0.52)'));
});
