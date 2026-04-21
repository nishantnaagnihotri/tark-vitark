import { After, Before, Given, Then, World } from '@cucumber/cucumber';
import * as assert from 'assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mediaBlock } from '../../tests/lib/css-test-utils';

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

function tabletFabBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(activeStyles(world).podiumFabCss, '@media (min-width: 768px)');
}

function desktopFabBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(activeStyles(world).podiumFabCss, '@media (min-width: 1024px)');
}

function tabletSheetWidthBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(activeStyles(world).podiumBottomSheetCss, '@media (min-width: 768px)', 1);
}

function desktopSheetWidthBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(activeStyles(world).podiumBottomSheetCss, '@media (min-width: 1024px)', 1);
}

function tabletDarkScrimBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(
    activeStyles(world).podiumBottomSheetCss,
    '@media (min-width: 768px) and (max-width: 1023px)'
  );
}

function desktopScrimBlock(world: PodiumResponsiveLayoutWorld): string {
  return mediaBlock(activeStyles(world).podiumBottomSheetCss, '@media (min-width: 1024px)', 2);
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

Then(
  'AC-25 tablet-tier podium FAB spacing values are present',
  function (this: PodiumResponsiveLayoutWorld) {
    const tabletFabStyles = tabletFabBlock(this);
    assert.match(
      tabletFabStyles,
      /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
    );
    assert.match(
      tabletFabStyles,
      /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
    );
  }
);

Then(
  'AC-25 tablet-tier podium sheet width value is present',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(tabletSheetWidthBlock(this).includes('max-width: 600px;'));
  }
);

Then(
  'AC-25 tablet-tier podium dark scrim values are present',
  function (this: PodiumResponsiveLayoutWorld) {
    const tabletDarkScrimStyles = tabletDarkScrimBlock(this);
    assert.ok(tabletDarkScrimStyles.includes('[data-theme="dark"] .podium-sheet-scrim'));
    assert.ok(tabletDarkScrimStyles.includes('rgba(0, 0, 0, 0.48)'));
  }
);

Then(
  'AC-26 desktop-tier podium FAB spacing values are present',
  function (this: PodiumResponsiveLayoutWorld) {
    const desktopFabStyles = desktopFabBlock(this);
    assert.match(
      desktopFabStyles,
      /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
    );
    assert.match(
      desktopFabStyles,
      /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
    );
  }
);

Then(
  'AC-26 desktop-tier podium sheet width value is present',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(desktopSheetWidthBlock(this).includes('max-width: 720px;'));
  }
);

Then(
  'AC-26 desktop-tier podium scrim values are present',
  function (this: PodiumResponsiveLayoutWorld) {
    const desktopScrimStyles = desktopScrimBlock(this);
    assert.match(
      desktopScrimStyles,
      /\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.36\)[^}]*\}/
    );
    assert.match(
      desktopScrimStyles,
      /\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.52\)[^}]*\}/
    );
  }
);

Then(
  'AC-27 mobile-tier podium FAB baseline spacing remains unchanged',
  function (this: PodiumResponsiveLayoutWorld) {
    const { podiumFabCss } = activeStyles(this);
    assert.ok(podiumFabCss.includes('right: var(--space-4);'));
    assert.ok(podiumFabCss.includes('bottom: var(--space-4);'));
  }
);

Then(
  'AC-27 mobile-tier podium sheet width baseline remains unchanged',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(activeStyles(this).podiumBottomSheetCss.includes('max-width: 390px;'));
  }
);

Then(
  'AC-27 mobile-tier podium scrim baseline remains unchanged',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(activeStyles(this).podiumBottomSheetCss.includes('background: var(--color-scrim);'));
  }
);

Then(
  'AC-28 the timeline 481px comment is reclassified as mobile-internal',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(
      activeStyles(this).timelineCss.includes(
        'mobile-internal layout adjustment (≥481px) — not a design tier'
      )
    );
  }
);

Then(
  'AC-28 the timeline 481px comment no longer uses tablet wording',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.equal(activeStyles(this).timelineCss.includes('Tablet (\u2265481px)'), false);
  }
);

Then(
  'AC-28 the debate screen 481px comment is reclassified as mobile-internal',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(
      activeStyles(this).debateScreenCss.includes('mobile-internal (≥481px) — not a design tier')
    );
  }
);

Then(
  'AC-28 the debate screen 481px comment no longer uses the tablet divider',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.equal(activeStyles(this).debateScreenCss.includes('/* ── Tablet ── */'), false);
  }
);

Then(
  'AC-28 the legend bar 481px comment is reclassified as mobile-internal',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(
      activeStyles(this).legendBarCss.includes('mobile-internal (≥481px) — not a design tier')
    );
  }
);

Then(
  'AC-28 the legend bar 481px comment no longer says tablet and above',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.equal(activeStyles(this).legendBarCss.includes('Tablet and above'), false);
  }
);

Then(
  'AC-28 the argument card 481px comment is reclassified as mobile-internal',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(
      activeStyles(this).argumentCardCss.includes('mobile-internal (≥481px) — not a design tier')
    );
  }
);

Then(
  'AC-29 tablet-tier podium FAB spacing matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    const tabletFabStyles = tabletFabBlock(this);
    assert.match(
      tabletFabStyles,
      /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
    );
    assert.match(
      tabletFabStyles,
      /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
    );
  }
);

Then(
  'AC-29 tablet-tier podium sheet width matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(tabletSheetWidthBlock(this).includes('max-width: 600px;'));
  }
);

Then(
  'AC-29 tablet-tier podium dark scrim matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    const tabletDarkScrimStyles = tabletDarkScrimBlock(this);
    assert.ok(tabletDarkScrimStyles.includes('rgba(0, 0, 0, 0.48)'));
  }
);

Then(
  'AC-30 desktop-tier podium FAB spacing matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    const desktopFabStyles = desktopFabBlock(this);
    assert.match(
      desktopFabStyles,
      /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
    );
    assert.match(
      desktopFabStyles,
      /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
    );
  }
);

Then(
  'AC-30 desktop-tier podium sheet width matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    assert.ok(desktopSheetWidthBlock(this).includes('max-width: 720px;'));
  }
);

Then(
  'AC-30 desktop-tier podium scrim opacity matches the Figma specification',
  function (this: PodiumResponsiveLayoutWorld) {
    const desktopScrimStyles = desktopScrimBlock(this);
    assert.match(
      desktopScrimStyles,
      /\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.36\)[^}]*\}/
    );
    assert.match(
      desktopScrimStyles,
      /\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.52\)[^}]*\}/
    );
  }
);
