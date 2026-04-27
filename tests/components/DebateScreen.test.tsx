import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Debate } from '../../src/data/debate';
import { DebateScreen } from '../../src/components/DebateScreen';
import { ACTIVE_DEBATE_STORAGE_KEY } from '../../src/lib/activeDebateStorage';
import {
    activeDebateFixture,
    createStoredActiveDebateFixtureRecord,
    seedActiveDebateFixture,
} from '../fixtures/activeDebateFixture';

const debateScreenCss = readFileSync(
    resolve(process.cwd(), 'src/styles/debate-screen.css'),
    'utf-8'
);
const podiumCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium.css'),
    'utf-8'
);

async function openComposerForSide(side: 'Post as Tark' | 'Post as Vitark') {
    fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
    let sideOption: HTMLElement | null = null;
    await waitFor(() => {
        sideOption = screen.getByRole('button', { name: side });
        expect(sideOption).toBeEnabled();
    });

    if (!sideOption) {
        throw new Error(`Expected composer side option "${side}" to be available.`);
    }

    fireEvent.click(sideOption);
}

describe('DebateScreen', () => {
    beforeEach(() => {
        seedActiveDebateFixture(window.localStorage);
    });

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
        expect(heading).toHaveTextContent(activeDebateFixture.topic);
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

    it('renders all arguments from stored active debate data', () => {
        render(<DebateScreen />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(activeDebateFixture.arguments.length);
    });

    it('renders FAB composer entry on mount', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: 'Post as Tark' })).not.toBeInTheDocument();
    });

    it('appends a valid published post as the last timeline item', async () => {
        render(<DebateScreen />);

        await openComposerForSide('Post as Tark');
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: 'This post has enough length.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            const items = screen.getAllByRole('listitem');
            expect(items).toHaveLength(activeDebateFixture.arguments.length + 1);
            expect(items[items.length - 1]).toHaveTextContent('This post has enough length.');
        });
    });

    it('publishes arguments with IDs above the active debate maximum', async () => {
        const sparseActiveDebate: Debate = {
            topic: activeDebateFixture.topic,
            arguments: [
                {
                    id: 2,
                    side: 'tark',
                    text: 'Existing tark argument with non-sequential ids.',
                },
                {
                    id: 3,
                    side: 'vitark',
                    text: 'Existing vitark argument with non-sequential ids.',
                },
            ],
        };
        window.localStorage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createStoredActiveDebateFixtureRecord(sparseActiveDebate)),
        );
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            render(<DebateScreen />);

            await openComposerForSide('Post as Tark');
            fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
                target: { value: 'Unique ID publish path should avoid collisions.' },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

            await waitFor(() => {
                const items = screen.getAllByRole('listitem');
                expect(items).toHaveLength(sparseActiveDebate.arguments.length + 1);
                expect(items[items.length - 1]).toHaveTextContent(
                    'Unique ID publish path should avoid collisions.'
                );
            });

            const duplicateKeyWarningLogged = consoleErrorSpy.mock.calls.some((callArguments) =>
                callArguments.some(
                    (argument) =>
                        typeof argument === 'string'
                        && argument.includes('Encountered two children with the same key')
                )
            );
            expect(duplicateKeyWarningLogged).toBe(false);
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    it('resets localPosts to empty after remount', async () => {
        const { unmount } = render(<DebateScreen />);

        await openComposerForSide('Post as Tark');
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: 'Session-only argument text.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(
                activeDebateFixture.arguments.length + 1
            );
        });

        unmount();
        render(<DebateScreen />);

        expect(screen.getAllByRole('listitem')).toHaveLength(activeDebateFixture.arguments.length);
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

    it('AC-34: renders active-debate header chrome actions', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('switch', { name: /dark mode/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open debate actions' })).toBeInTheDocument();
    });

    it('AC-34, AC-36: keeps empty state headerless without floating theme control', () => {
        window.localStorage.clear();
        render(<DebateScreen />);

        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /dark mode/i })).toHaveClass(
            'theme-toggle--chrome'
        );
        expect(screen.queryByRole('button', { name: 'Open debate actions' })).not.toBeInTheDocument();
    });

    it('AC-34: uses the overflow trigger to enter a new debate flow', () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'New Debate' }));

        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });

    it('uses shared podium height variable for debate screen clearance', () => {
        expect(debateScreenCss).toContain('display: flex;');
        expect(debateScreenCss).toContain('flex-direction: column;');
        expect(debateScreenCss).toContain('padding-bottom: var(--podium-height, 0px);');
    });

    it('opens bottom sheet immediately with selected side after FAB side selection', async () => {
        render(<DebateScreen />);

        await openComposerForSide('Post as Vitark');

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
