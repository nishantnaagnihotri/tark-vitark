import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * WCAG 2.1 AA contrast ratio verification for all token color pairs.
 * Pure computation — no DOM or CSS needed.
 *
 * Formula:
 *   Relative luminance L = 0.2126*R + 0.7152*G + 0.0722*B
 *   where each channel C_sRGB is linearized:
 *     C_lin = C_sRGB <= 0.04045 ? C_sRGB/12.92 : ((C_sRGB+0.055)/1.055)^2.4
 *   Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)
 *
 * WCAG AA thresholds:
 *   Normal text (< 18pt or < 14pt bold): >= 4.5:1
 *   Large text  (>= 18pt or >= 14pt bold): >= 3:1
 */

function hexToSRGB(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
}

function linearize(channel: number): number {
    return channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
    const [r, g, b] = hexToSRGB(hex).map(linearize);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// AA thresholds
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

// ── Parse token values from tokens.css (single source of truth) ──

const tokensCss = readFileSync(
    resolve(process.cwd(), 'src/styles/tokens.css'),
    'utf-8',
);

function parseTokensForTheme(css: string, theme: 'light' | 'dark'): Map<string, string> {
    const tokens = new Map<string, string>();
    const selectorPattern =
        theme === 'light'
            ? /(?::root|data-theme="light")\s*\{([^}]+)\}/g
            : /\[data-theme="dark"\]\s*\{([^}]+)\}/;
    let match: RegExpExecArray | null;
    const regex = new RegExp(selectorPattern);
    const blocks: string[] = [];

    if (theme === 'light') {
        // Capture :root and [data-theme="light"] blocks (first top-level rule)
        const m = css.match(/:root[\s\S]*?\{([^}]+)\}/);
        if (m) blocks.push(m[1]);
    } else {
        const m = css.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/);
        if (m) blocks.push(m[1]);
    }

    for (const block of blocks) {
        const propRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
        while ((match = propRegex.exec(block)) !== null) {
            tokens.set(match[1], match[2].trim());
        }
    }
    return tokens;
}

const lightTokens = parseTokensForTheme(tokensCss, 'light');
const darkTokens = parseTokensForTheme(tokensCss, 'dark');

function token(theme: 'Light' | 'Dark', name: string): string {
    const map = theme === 'Light' ? lightTokens : darkTokens;
    const value = map.get(name);
    if (!value) throw new Error(`Token ${name} not found in ${theme} theme`);
    return value;
}

interface ColorPair {
    theme: 'Light' | 'Dark';
    fgToken: string;
    bgToken: string;
    fg: string;
    bg: string;
    textSize: 'normal' | 'large';
}

const pairDefs: { fgToken: string; bgToken: string; textSize: 'normal' | 'large' }[] = [
    { fgToken: '--color-tark-on-surface', bgToken: '--color-tark-surface', textSize: 'normal' },
    { fgToken: '--color-vitark-on-surface', bgToken: '--color-vitark-surface', textSize: 'normal' },
    { fgToken: '--color-on-surface', bgToken: '--color-surface-default', textSize: 'normal' },
    { fgToken: '--color-legend-on-surface', bgToken: '--color-legend-surface', textSize: 'normal' },
];

const colorPairs: ColorPair[] = (['Light', 'Dark'] as const).flatMap((theme) =>
    pairDefs.map((def) => ({
        theme,
        fgToken: def.fgToken,
        bgToken: def.bgToken,
        fg: token(theme, def.fgToken),
        bg: token(theme, def.bgToken),
        textSize: def.textSize,
    })),
);

describe('WCAG AA contrast ratio verification', () => {
    it.each(colorPairs)(
        '$theme: $fgToken on $bgToken meets AA ($textSize text)',
        ({ fg, bg, textSize }) => {
            const ratio = contrastRatio(fg, bg);
            const threshold = textSize === 'normal' ? AA_NORMAL : AA_LARGE;
            expect(ratio).toBeGreaterThanOrEqual(threshold);
        },
    );

    it('contrastRatio returns correct value for black on white', () => {
        const ratio = contrastRatio('#000000', '#FFFFFF');
        expect(ratio).toBeCloseTo(21, 0);
    });

    it('contrastRatio returns 1 for same colors', () => {
        const ratio = contrastRatio('#FF0000', '#FF0000');
        expect(ratio).toBeCloseTo(1, 1);
    });
});
