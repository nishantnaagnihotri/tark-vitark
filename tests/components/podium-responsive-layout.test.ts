import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mediaBlock } from '../lib/css-test-utils';

const podiumFabCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium-fab.css'),
    'utf-8'
);
const podiumBottomSheetCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium-bottom-sheet.css'),
    'utf-8'
);
const timelineCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/timeline.css'),
    'utf-8'
);
const debateScreenCss = readFileSync(
    resolve(process.cwd(), 'src/styles/debate-screen.css'),
    'utf-8'
);
const legendBarCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/legend-bar.css'),
    'utf-8'
);
const argumentCardCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/argument-card.css'),
    'utf-8'
);

describe('podium responsive layout', () => {
    it('AC-25 Scenario: tablet-tier podium layout values are present', () => {
        const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
        const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
        const tabletDarkScrimBlock = mediaBlock(
            podiumBottomSheetCss,
            '@media (min-width: 768px) and (max-width: 1023px)'
        );

        expect(tabletFabBlock).toMatch(
            /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
        );
        expect(tabletFabBlock).toMatch(
            /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
        );
        expect(tabletSheetBlock).toContain('max-width: 600px;');
        expect(tabletDarkScrimBlock).toContain('[data-theme="dark"] .podium-sheet-scrim');
        expect(tabletDarkScrimBlock).toContain('rgba(0, 0, 0, 0.48)');
    });

    it('AC-26 Scenario: desktop-tier podium layout values are present', () => {
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

        expect(desktopFabBlock).toMatch(
            /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
        );
        expect(desktopFabBlock).toMatch(
            /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
        );
        expect(desktopSheetWidthBlock).toContain('max-width: 720px;');
        expect(desktopScrimBlock).toMatch(
            /\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.36\)[^}]*\}/
        );
        expect(desktopScrimBlock).toMatch(
            /\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.52\)[^}]*\}/
        );
    });

    it('AC-27 Scenario: mobile-tier podium behavior remains frozen', () => {
        expect(podiumFabCss).toContain('right: var(--space-4);');
        expect(podiumFabCss).toContain('bottom: var(--space-4);');
        expect(podiumBottomSheetCss).toContain('max-width: 390px;');
        expect(podiumBottomSheetCss).toContain('background: var(--color-scrim);');
    });

    it('AC-28 Scenario: 481px comments are reclassified as mobile-internal', () => {
        expect(timelineCss).toContain('mobile-internal layout adjustment (≥481px) — not a design tier');
        expect(timelineCss).not.toContain('Tablet (≥481px)');

        expect(debateScreenCss).toContain('mobile-internal (≥481px) — not a design tier');
        expect(debateScreenCss).not.toContain('/* ── Tablet ── */');

        expect(legendBarCss).toContain('mobile-internal (≥481px) — not a design tier');
        expect(legendBarCss).not.toContain('Tablet and above');

        expect(argumentCardCss).toContain('mobile-internal (≥481px) — not a design tier');
    });

    it('AC-29 Scenario: tablet-tier podium layout values match the Figma specification', () => {
        const tabletFabBlock = mediaBlock(podiumFabCss, '@media (min-width: 768px)');
        const tabletSheetBlock = mediaBlock(podiumBottomSheetCss, '@media (min-width: 768px)');
        const tabletDarkScrimBlock = mediaBlock(
            podiumBottomSheetCss,
            '@media (min-width: 768px) and (max-width: 1023px)'
        );

        expect(tabletFabBlock).toMatch(
            /right:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
        );
        expect(tabletFabBlock).toMatch(
            /bottom:\s*(?:max\([^;]*var\(--space-8\)[^;]*\)|var\(--space-8\))\s*;/
        );
        expect(tabletSheetBlock).toContain('max-width: 600px;');
        expect(tabletDarkScrimBlock).toContain('rgba(0, 0, 0, 0.48)');
    });

    it('AC-30 Scenario: desktop-tier podium layout values match the Figma specification', () => {
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

        expect(desktopFabBlock).toMatch(
            /right:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
        );
        expect(desktopFabBlock).toMatch(
            /bottom:\s*(?:max\([^;]*var\(--space-12\)[^;]*\)|var\(--space-12\))\s*;/
        );
        expect(desktopSheetWidthBlock).toContain('max-width: 720px;');
        expect(desktopScrimBlock).toMatch(
            /\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.36\)[^}]*\}/
        );
        expect(desktopScrimBlock).toMatch(
            /\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[^}]*rgba\(0,\s*0,\s*0,\s*0\.52\)[^}]*\}/
        );
    });
});
