import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('light theme: zero critical/serious violations', async () => {
        const { container } = render(<DebateScreen />);
        const results = await runAxe(container);

        const criticalSerious = filterViolations(results, ['critical', 'serious']);
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

    it('dark theme: zero critical/serious violations', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        const { container, unmount } = render(<DebateScreen />);
        try {
            const results = await runAxe(container);

            const criticalSerious = filterViolations(results, ['critical', 'serious']);
            if (criticalSerious.length > 0) {
                const summary = criticalSerious.map(
                    (v) =>
                        `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instance(s))`,
                );
                expect.fail(
                    `axe-core (dark theme) found ${criticalSerious.length} critical/serious violation(s):\n${summary.join('\n')}`,
                );
            }

        } finally {
            unmount();
            document.documentElement.removeAttribute('data-theme');
        }
    });

    it('AC-37: starting a debate keeps both the topic draft and active debate accessible', async () => {
        window.localStorage.clear();
        const { container } = render(<DebateScreen />);

        const emptyStateResults = await runAxe(container);
        expect(filterViolations(emptyStateResults, ['critical', 'serious'])).toHaveLength(0);

        const createdDebateTopic = 'Is remote work better than office work?';
        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: createdDebateTopic },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(createdDebateTopic);
        });

        const activeStateResults = await runAxe(container);
        expect(filterViolations(activeStateResults, ['critical', 'serious'])).toHaveLength(0);
    });
});
