import { describe, it, expect } from 'vitest';

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

interface ColorPair {
    theme: 'Light' | 'Dark';
    fgToken: string;
    bgToken: string;
    fg: string;
    bg: string;
    textSize: 'normal' | 'large';
}

const colorPairs: ColorPair[] = [
    // Light theme
    {
        theme: 'Light',
        fgToken: '--color-tark-on-surface',
        bgToken: '--color-tark-surface',
        fg: '#0D47A1',
        bg: '#BBDEFB',
        textSize: 'normal',
    },
    {
        theme: 'Light',
        fgToken: '--color-vitark-on-surface',
        bgToken: '--color-vitark-surface',
        fg: '#BF360C',
        bg: '#FFECB3',
        textSize: 'normal',
    },
    {
        theme: 'Light',
        fgToken: '--color-on-surface',
        bgToken: '--color-surface-default',
        fg: '#1C1B1F',
        bg: '#FFFBFF',
        textSize: 'normal',
    },
    {
        theme: 'Light',
        fgToken: '--color-legend-on-surface',
        bgToken: '--color-legend-surface',
        fg: '#4D4D4D',
        bg: '#F5F5F5',
        textSize: 'normal',
    },
    // Dark theme
    {
        theme: 'Dark',
        fgToken: '--color-tark-on-surface',
        bgToken: '--color-tark-surface',
        fg: '#E3F2FD',
        bg: '#1565C0',
        textSize: 'normal',
    },
    {
        theme: 'Dark',
        fgToken: '--color-vitark-on-surface',
        bgToken: '--color-vitark-surface',
        fg: '#FFF8E1',
        bg: '#BF360C',
        textSize: 'normal',
    },
    {
        theme: 'Dark',
        fgToken: '--color-on-surface',
        bgToken: '--color-surface-default',
        fg: '#E6E1E5',
        bg: '#1B1B1F',
        textSize: 'normal',
    },
    {
        theme: 'Dark',
        fgToken: '--color-legend-on-surface',
        bgToken: '--color-legend-surface',
        fg: '#BFBFBF',
        bg: '#1C1C1C',
        textSize: 'normal',
    },
];

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
