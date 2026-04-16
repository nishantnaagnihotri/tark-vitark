import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as axe from 'axe-core';
import { Podium } from '../../src/components/Podium';

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

describe('axe-core accessibility audit — Podium', () => {
    it('default render has zero axe violations', async () => {
        const { container } = render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const results = await runAxe(container);

        if (results.violations.length > 0) {
            const summary = results.violations.map(
                (violation) =>
                    `[${violation.impact}] ${violation.id}: ${violation.description} (${violation.nodes.length} instance(s))`
            );

            expect.fail(
                `axe-core found ${results.violations.length} violation(s):\n${summary.join('\n')}`
            );
        }
    });
});

describe('Podium ARIA semantics', () => {
    it('textarea has an accessible name', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAccessibleName('Post text');
    });

    it('publish button has aria-label="Publish post"', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const publishButton = screen.getByRole('button', { name: 'Publish post' });
        expect(publishButton).toHaveAttribute('aria-label', 'Publish post');
    });

    it('invalid submit marks textarea invalid and links descriptive error message', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, { target: { value: '      ' } });
        fireEvent.click(publishButton);

        expect(textarea).toHaveAttribute('aria-invalid', 'true');

        const describedById = textarea.getAttribute('aria-describedby');
        expect(describedById).toBeTruthy();

        const describedByElement = document.getElementById(describedById as string);
        expect(describedByElement).toBeTruthy();
        expect(describedByElement).toHaveTextContent(
            'Text cannot be empty or whitespace only.'
        );
    });

    it('SegmentedControl exposes radiogroup and radio roles', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const segmentedControl = screen.getByRole('radiogroup', {
            name: 'Post side',
        });
        expect(segmentedControl).toBeInTheDocument();

        const options = screen.getAllByRole('radio');
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveAccessibleName('Tark');
        expect(options[1]).toHaveAccessibleName('Vitark');
    });
});