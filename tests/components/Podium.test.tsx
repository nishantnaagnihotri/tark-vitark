import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Podium } from '../../src/components/Podium';

const podiumCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium.css'),
    'utf-8'
);

describe('Podium', () => {
    it('renders chip button, textarea, publish button, and native divider', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: 'Post as Tark' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Post text' })).toBeInTheDocument();
        const publishButton = screen.getByRole('button', { name: 'Publish post' });
        expect(publishButton).toBeInTheDocument();
        expect(publishButton).toHaveAttribute('aria-label', 'Publish post');
        expect(publishButton).not.toHaveTextContent(/publish/i);

        const nativeDivider = screen.getByRole('separator');
        expect(nativeDivider.tagName).toBe('DIV');
    });

    it('disables publish only when textarea is empty', () => {
        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        expect(publishButton).toBeDisabled();

        fireEvent.change(textarea, { target: { value: '   ' } });

        expect(publishButton).not.toBeDisabled();
    });

    it('validates on submit only and shows a whitespace-only error when submitted', () => {
        const onPublish = vi.fn();

        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={onPublish}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, { target: { value: '       ' } });
        expect(screen.getByRole('alert')).toHaveTextContent('');

        fireEvent.click(publishButton);

        expect(onPublish).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Text cannot be empty or whitespace only.'
        );
        expect(textarea).toHaveAttribute('aria-describedby', 'podium-error');
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('calls onPublish with trimmed text and selected side, then clears textarea', async () => {
        const onPublish = vi.fn();

        render(
            <Podium
                selectedSide="vitark"
                onSideChange={() => {}}
                onPublish={onPublish}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, {
            target: { value: '   This is a valid post body.   ' },
        });
        fireEvent.click(publishButton);

        await waitFor(() => {
            expect(onPublish).toHaveBeenCalledWith('This is a valid post body.', 'vitark');
        });

        expect(textarea).toHaveValue('');
        expect(screen.getByRole('alert')).toHaveTextContent('');
    });

    it('prevents a second publish while an in-flight publish is still busy', async () => {
        let resolvePublish: () => void = () => {};
        const onPublish = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolvePublish = () => resolve();
                })
        );

        render(
            <Podium
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={onPublish}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, {
            target: { value: 'This text has enough length.' },
        });
        fireEvent.click(publishButton);

        expect(onPublish).toHaveBeenCalledTimes(1);
        expect(publishButton).toBeDisabled();

        fireEvent.click(publishButton);

        expect(onPublish).toHaveBeenCalledTimes(1);

        resolvePublish();

        await waitFor(() => {
            expect(textarea).toHaveValue('');
            expect(publishButton).toBeDisabled();
        });

        fireEvent.change(textarea, {
            target: { value: 'Second valid body text.' },
        });
        expect(publishButton).not.toBeDisabled();
    });

    it('delegates side changes through chip interaction', () => {
        const onSideChange = vi.fn();

        render(
            <Podium
                selectedSide="tark"
                onSideChange={onSideChange}
                onPublish={() => {}}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Post as Tark' }));

        expect(onSideChange).toHaveBeenCalledTimes(1);
        expect(onSideChange).toHaveBeenCalledWith('vitark');
    });

    it('defines fixed and desktop full-width layout rules in podium.css source', () => {
        expect(podiumCss).toContain('position: fixed;');
        expect(podiumCss).toContain('--podium-height: calc(103px + env(safe-area-inset-bottom, 0px));');
        expect(podiumCss).toContain('@media (min-width: 1024px)');
        expect(podiumCss).toContain('padding-inline: var(--space-30);');
    });
});