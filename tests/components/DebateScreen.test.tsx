import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DebateScreen } from '../../src/components/DebateScreen';
import { DEBATE } from '../../src/data/debate';

const debateScreenCss = readFileSync(
    resolve(process.cwd(), 'src/styles/debate-screen.css'),
    'utf-8'
);
const podiumCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium.css'),
    'utf-8'
);

describe('DebateScreen', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('data-theme');
        sessionStorage.clear();
        vi.unstubAllGlobals();
    });

    it('renders a <main> landmark with role="main"', () => {
        render(<DebateScreen />);
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
    });

    it('renders the debate topic as a heading', () => {
        render(<DebateScreen />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(DEBATE.topic);
    });

    it('composes Topic component', () => {
        render(<DebateScreen />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('topic');
    });

    it('composes LegendBar component', () => {
        render(<DebateScreen />);
        const legend = screen.getByRole('navigation', {
            name: 'Debate sides legend',
        });
        expect(legend).toBeInTheDocument();
    });

    it('composes Timeline component', () => {
        render(<DebateScreen />);
        const timeline = screen.getByRole('region', {
            name: 'Debate arguments',
        });
        expect(timeline).toBeInTheDocument();
    });

    it('renders all arguments from DEBATE data', () => {
        render(<DebateScreen />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(DEBATE.arguments.length);
    });

    it('defaults selected side to tark on mount', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: 'Post as Tark' })).not.toBeInTheDocument();
    });

    it('appends a valid published post as the last timeline item', async () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        fireEvent.click(screen.getByRole('button', { name: 'Post as Tark' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: 'This post has enough length.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            const items = screen.getAllByRole('listitem');
            expect(items).toHaveLength(DEBATE.arguments.length + 1);
            expect(items[items.length - 1]).toHaveTextContent('This post has enough length.');
        });
    });

    it('resets localPosts to empty after remount', async () => {
        const { unmount } = render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        fireEvent.click(screen.getByRole('button', { name: 'Post as Tark' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: 'Session-only argument text.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(
                DEBATE.arguments.length + 1
            );
        });

        unmount();
        render(<DebateScreen />);

        expect(screen.getAllByRole('listitem')).toHaveLength(DEBATE.arguments.length);
        expect(screen.queryByText('Session-only argument text.')).not.toBeInTheDocument();
    });

    it('applies debate-screen CSS class to main element', () => {
        render(<DebateScreen />);
        const main = screen.getByRole('main');
        expect(main).toHaveClass('debate-screen');
    });

    it('keeps ThemeToggle present alongside composer controls', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('switch', { name: /dark mode/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
    });

    it('uses shared podium height variable for debate screen clearance', () => {
        expect(debateScreenCss).toContain('display: flex;');
        expect(debateScreenCss).toContain('flex-direction: column;');
        expect(debateScreenCss).toContain('padding-bottom: var(--podium-height, 0px);');
    });

    it('opens bottom sheet immediately with selected side after FAB side selection', () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        const vitarkAction = screen.getByRole('button', { name: 'Post as Vitark' });
        fireEvent.click(vitarkAction);

        expect(screen.getByRole('dialog', { name: 'Post composer' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Vitark' })).toHaveAttribute('aria-checked', 'true');
    });

    it('scopes --podium-height to desktop media query and keeps mobile default at zero', () => {
        expect(podiumCss).toMatch(/:root\s*\{[\s\S]*--podium-height:\s*0px;/);
        expect(podiumCss).toMatch(
            /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*:root\s*\{[\s\S]*--podium-height:\s*calc\(109px\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\);/
        );
    });
});
