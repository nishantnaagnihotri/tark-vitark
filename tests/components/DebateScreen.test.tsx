import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

interface MatchMediaController {
    setIsMobile: (nextValue: boolean) => void;
}

interface MutableMediaQueryList extends MediaQueryList {
    updateMatches: (nextValue: boolean) => void;
}

function createMediaQueryList(
    media: string,
    matches: boolean,
    listeners?: Set<MediaQueryChangeListener>
): MutableMediaQueryList {
    let currentMatches = matches;

    return {
        get matches() {
            return currentMatches;
        },
        set matches(nextValue: boolean) {
            currentMatches = nextValue;
        },
        media,
        onchange: null,
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
            if (typeof listener === 'function') {
                listeners?.add(listener as MediaQueryChangeListener);
            }
        },
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
            if (typeof listener === 'function') {
                listeners?.delete(listener as MediaQueryChangeListener);
            }
        },
        addListener: (listener: MediaQueryChangeListener) => {
            listeners?.add(listener);
        },
        removeListener: (listener: MediaQueryChangeListener) => {
            listeners?.delete(listener);
        },
        dispatchEvent: () => true,
        updateMatches(nextValue: boolean) {
            currentMatches = nextValue;
        },
    } as MutableMediaQueryList;
}

function mockViewportQuery(isMobileAtMount: boolean): MatchMediaController {
    const viewportListeners = new Set<MediaQueryChangeListener>();
    const viewportQuery = '(max-width: 767px)';
    const viewportMediaQueryList = createMediaQueryList(
        viewportQuery,
        isMobileAtMount,
        viewportListeners
    );

    vi.stubGlobal('matchMedia', (query: string) => {
        if (query === viewportQuery) {
            return viewportMediaQueryList;
        }

        return createMediaQueryList(query, false);
    });

    return {
        setIsMobile(nextValue: boolean) {
            viewportMediaQueryList.updateMatches(nextValue);
            const event = {
                matches: nextValue,
                media: viewportQuery,
            } as MediaQueryListEvent;

            viewportListeners.forEach((listener) => {
                listener(event);
            });
            viewportMediaQueryList.onchange?.(event);
        },
    };
}

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

    it('composes Podium controls', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('switch', { name: 'Post as Tark' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Post text' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Publish post' })).toBeInTheDocument();
    });

    it('renders all arguments from DEBATE data', () => {
        render(<DebateScreen />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(DEBATE.arguments.length);
    });

    it('defaults selected side to tark on mount', () => {
        render(<DebateScreen />);

        const chip = screen.getByRole('switch', { name: 'Post as Tark' });
        expect(chip).toBeInTheDocument();
        expect(chip).toHaveAttribute('aria-checked', 'true');
    });

    it('passes side changes to Podium by updating selected side state', () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('switch', { name: 'Post as Tark' }));

        const chip = screen.getByRole('switch', { name: 'Post as Vitark' });
        expect(chip).toBeInTheDocument();
        expect(chip).toHaveAttribute('aria-checked', 'false');
    });

    it('appends a valid published post as the last timeline item', async () => {
        render(<DebateScreen />);

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

    it('resets selected side to tark after remount', () => {
        const { unmount } = render(<DebateScreen />);

        fireEvent.click(screen.getByRole('switch', { name: 'Post as Tark' }));
        expect(screen.getByRole('switch', { name: 'Post as Vitark' })).toHaveAttribute('aria-checked', 'false');

        unmount();
        render(<DebateScreen />);

        expect(screen.getByRole('switch', { name: 'Post as Tark' })).toHaveAttribute('aria-checked', 'true');
    });

    it('applies debate-screen CSS class to main element', () => {
        render(<DebateScreen />);
        const main = screen.getByRole('main');
        expect(main).toHaveClass('debate-screen');
    });

    it('keeps ThemeToggle present alongside composer controls', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('switch', { name: /dark mode/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Post text' })).toBeInTheDocument();
    });

    it('uses shared podium height variable for debate screen clearance', () => {
        expect(debateScreenCss).toContain('display: flex;');
        expect(debateScreenCss).toContain('flex-direction: column;');
        expect(debateScreenCss).toContain('padding-bottom: var(--podium-height, 0px);');
    });

    it('renders mobile compose flow only when matchMedia reports mobile', () => {
        mockViewportQuery(true);
        render(<DebateScreen />);

        expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: 'Post as Tark' })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
    });

    it('opens bottom sheet immediately with selected side after mobile FAB side selection', async () => {
        mockViewportQuery(true);
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        const vitarkAction = screen.getByRole('button', { name: 'Post as Vitark' });
        await waitFor(() => {
            expect(vitarkAction).toBeEnabled();
        });
        fireEvent.click(vitarkAction);

        expect(screen.getByRole('dialog', { name: 'Post composer' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Vitark' })).toHaveAttribute('aria-checked', 'true');
    });

    it('resets FAB and sheet state on resize from mobile to desktop', async () => {
        const mediaController = mockViewportQuery(true);
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        const tarkAction = screen.getByRole('button', { name: 'Post as Tark' });
        await waitFor(() => {
            expect(tarkAction).toBeEnabled();
        });
        fireEvent.click(tarkAction);
        expect(screen.getByRole('dialog', { name: 'Post composer' })).toBeInTheDocument();

        act(() => {
            mediaController.setIsMobile(false);
        });

        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Post text' })).toBeInTheDocument();
    });

    it('scopes --podium-height to desktop media query and keeps mobile default at zero', () => {
        expect(podiumCss).toMatch(/:root\s*\{[\s\S]*--podium-height:\s*0px;/);
        expect(podiumCss).toMatch(
            /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*:root\s*\{[\s\S]*--podium-height:\s*calc\(109px\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\);/
        );
    });
});
