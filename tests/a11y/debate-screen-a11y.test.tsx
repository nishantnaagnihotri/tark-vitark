import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as axe from 'axe-core';
import { DebateScreen } from '../../src/components/DebateScreen';

async function runAxe(
    container: HTMLElement,
    options?: axe.RunOptions,
): Promise<axe.AxeResults> {
    return axe.run(container, {
        // jsdom does not compute styles, so disable color-contrast rule
        // (contrast is verified separately in contrast.test.ts)
        rules: { 'color-contrast': { enabled: false } },
        ...options,
    });
}

function filterViolations(results: axe.AxeResults, minImpact: string[]) {
    return results.violations.filter((v) =>
        minImpact.includes(v.impact ?? ''),
    );
}

describe('axe-core accessibility audit — DebateScreen', () => {
    it('has zero critical violations', async () => {
        const { container } = render(<DebateScreen />);
        const results = await runAxe(container);
        const critical = filterViolations(results, ['critical']);
        expect(critical).toEqual([]);
    });

    it('has zero serious violations', async () => {
        const { container } = render(<DebateScreen />);
        const results = await runAxe(container);
        const serious = filterViolations(results, ['serious']);
        expect(serious).toEqual([]);
    });

    it('has zero critical or serious violations combined', async () => {
        const { container } = render(<DebateScreen />);
        const results = await runAxe(container);
        const criticalSerious = filterViolations(results, [
            'critical',
            'serious',
        ]);

        if (criticalSerious.length > 0) {
            const summary = criticalSerious.map(
                (v) =>
                    `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instance(s))`,
            );
            expect.fail(
                `axe-core found ${criticalSerious.length} critical/serious violation(s):\n${summary.join('\n')}`,
            );
        }
    });

    it('renders under dark theme with zero critical/serious violations', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        const { container, unmount } = render(<DebateScreen />);
        const results = await runAxe(container);
        const criticalSerious = filterViolations(results, [
            'critical',
            'serious',
        ]);
        unmount();
        document.documentElement.removeAttribute('data-theme');

        if (criticalSerious.length > 0) {
            const summary = criticalSerious.map(
                (v) =>
                    `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instance(s))`,
            );
            expect.fail(
                `axe-core (dark theme) found ${criticalSerious.length} critical/serious violation(s):\n${summary.join('\n')}`,
            );
        }
    });

    it('reports only minor or moderate violations (if any)', async () => {
        const { container } = render(<DebateScreen />);
        const results = await runAxe(container);

        const remaining = results.violations.filter(
            (v) => !['critical', 'serious'].includes(v.impact ?? ''),
        );
        if (remaining.length > 0) {
            console.info(
                'axe-core minor/moderate findings:',
                remaining.map((v) => `[${v.impact}] ${v.id}: ${v.description}`),
            );
        }
        const unexpectedImpacts = remaining.filter(
            (v) => !['minor', 'moderate'].includes(v.impact ?? ''),
        );
        expect(unexpectedImpacts).toEqual([]);
    });
});
