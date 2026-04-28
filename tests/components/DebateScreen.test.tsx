import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Debate } from '../../src/data/debate';
import { DebateScreen } from '../../src/components/DebateScreen';
import {
    ACTIVE_DEBATE_STORAGE_KEY,
    loadStoredActiveDebateRecord,
} from '../../src/lib/activeDebateStorage';
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

    it('AC-32: renders podium entry when an active debate exists on load', () => {
        render(<DebateScreen />);

        expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: 'Post as Tark' })).not.toBeInTheDocument();
    });

    it('AC-33: appends and persists a published argument as the last timeline item', async () => {
        render(<DebateScreen />);

        const publishedArgumentText = 'This argument has enough length.';

        await openComposerForSide('Post as Tark');
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: publishedArgumentText },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            const items = screen.getAllByRole('listitem');
            expect(items).toHaveLength(activeDebateFixture.arguments.length + 1);
            expect(items[items.length - 1]).toHaveTextContent(publishedArgumentText);
        });

        const storedActiveDebate = loadStoredActiveDebateRecord(window.localStorage).record.activeDebate;
        expect(storedActiveDebate?.arguments).toHaveLength(activeDebateFixture.arguments.length + 1);
        expect(storedActiveDebate?.arguments.at(-1)).toMatchObject({
            side: 'tark',
            text: publishedArgumentText,
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

    it('AC-33: keeps published arguments after remount from persisted active debate storage', async () => {
        const { unmount } = render(<DebateScreen />);
        const publishedArgumentText = 'Persisted argument text.';

        await openComposerForSide('Post as Tark');
        fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
            target: { value: publishedArgumentText },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(
                activeDebateFixture.arguments.length + 1
            );
        });

        unmount();
        render(<DebateScreen />);

        expect(screen.getAllByRole('listitem')).toHaveLength(activeDebateFixture.arguments.length + 1);
        expect(screen.getByText(publishedArgumentText)).toBeInTheDocument();
        expect(loadStoredActiveDebateRecord(window.localStorage).record.activeDebate?.arguments.at(-1)).toMatchObject(
            {
                text: publishedArgumentText,
            },
        );
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

        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.getByRole('switch', { name: /dark mode/i })).toHaveClass(
            'theme-toggle--chrome'
        );
        expect(screen.queryByRole('button', { name: 'Open debate actions' })).not.toBeInTheDocument();
    });

    it('AC-29: keeps debate creation focused on starting a topic when no active debate exists', () => {
        window.localStorage.clear();
        render(<DebateScreen />);

        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('navigation', { name: 'Debate sides legend' })).not.toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Debate arguments' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
    });

    it('AC-31: persists a fresh active debate and transitions into active mode after Start', async () => {
        window.localStorage.clear();
        render(<DebateScreen />);

        const createdDebateTopic = 'Is remote work better than office work?';
        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: `  ${createdDebateTopic}  ` },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(createdDebateTopic);
            expect(screen.queryByRole('textbox', { name: 'Debate topic' })).not.toBeInTheDocument();
            expect(screen.getByRole('navigation', { name: 'Debate sides legend' })).toBeInTheDocument();
            expect(screen.getByRole('region', { name: 'Debate arguments' })).toBeInTheDocument();
        });

        expect(window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(
            JSON.stringify(
                createStoredActiveDebateFixtureRecord({
                    topic: createdDebateTopic,
                    arguments: [],
                })
            ),
        );
    });

    it('AC-32: reveals podium actions after starting a debate from empty mode', async () => {
        window.localStorage.clear();
        render(<DebateScreen />);

        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: 'Should renewable energy subsidies be increased?' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Open post composer' })).toBeInTheDocument();
        });
    });

    it('AC-32: first render falls back to create mode instead of seeded runtime debate content', () => {
        window.localStorage.clear();
        render(<DebateScreen />);

        expect(screen.queryByText(activeDebateFixture.topic)).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('AC-39: corrupt active debate storage payload fails closed to create mode', () => {
        window.localStorage.setItem(ACTIVE_DEBATE_STORAGE_KEY, '{"version":1');
        render(<DebateScreen />);

        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
        expect(screen.queryByRole('navigation', { name: 'Debate sides legend' })).not.toBeInTheDocument();
    });

    it('AC-39: publish failure keeps debate state unchanged and does not fake success', async () => {
        const storedRecord = window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY);
        const unavailableWriteStorage = {
            clear() {
                if (storedRecord !== null) {
                    return;
                }
            },
            getItem(key: string) {
                return key === ACTIVE_DEBATE_STORAGE_KEY ? storedRecord : null;
            },
            key(index: number) {
                return index === 0 ? ACTIVE_DEBATE_STORAGE_KEY : null;
            },
            removeItem(_key: string) {
                if (storedRecord !== null) {
                    return;
                }
            },
            setItem(_key: string, _value: string) {
                throw new Error('Storage unavailable');
            },
            get length() {
                return storedRecord === null ? 0 : 1;
            },
        } as Storage;
        vi.stubGlobal('localStorage', unavailableWriteStorage);
        const failedArgumentText = 'This publish attempt should fail closed.';

        try {
            render(<DebateScreen />);
            await openComposerForSide('Post as Tark');
            fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
                target: { value: failedArgumentText },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

            await waitFor(() => {
                expect(screen.getByRole('dialog', { name: 'Post composer' })).toBeInTheDocument();
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'Unable to publish right now. Please try again.'
                );
            });

            expect(screen.getAllByRole('listitem')).toHaveLength(activeDebateFixture.arguments.length);
            expect(screen.getByRole('region', { name: 'Debate arguments' })).not.toHaveTextContent(
                failedArgumentText
            );
            expect(window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(storedRecord);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('AC-38: allows uncapped argument publishing for the active debate timeline', async () => {
        render(<DebateScreen />);

        const publishedArgumentCount = 12;
        for (let publishedArgumentIndex = 1; publishedArgumentIndex <= publishedArgumentCount; publishedArgumentIndex += 1) {
            const sideLabel = publishedArgumentIndex % 2 === 0 ? 'Post as Vitark' : 'Post as Tark';
            const publishedArgumentText =
                `Uncapped argument ${publishedArgumentIndex} demonstrates no enforced posting cap.`;

            await openComposerForSide(sideLabel);
            await waitFor(() => {
                expect(screen.getByRole('dialog', { name: 'Post composer' })).toHaveClass(
                    'podium-bottom-sheet--open'
                );
            });
            fireEvent.change(screen.getByRole('textbox', { name: 'Post text' }), {
                target: { value: publishedArgumentText },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

            await waitFor(() => {
                expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
            });
        }

        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(
                activeDebateFixture.arguments.length + publishedArgumentCount
            );
        });
        expect(loadStoredActiveDebateRecord(window.localStorage).record.activeDebate?.arguments).toHaveLength(
            activeDebateFixture.arguments.length + publishedArgumentCount,
        );
    });

    it('AC-34, AC-40: enters replace mode from New Debate with inline warning', async () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
        fireEvent.click(screen.getByRole('button', { name: 'New Debate' }));

        await waitFor(() => {
            const topicInput = screen.getByRole('textbox', { name: 'Debate topic' });
            expect(topicInput).toBeInTheDocument();
            expect(topicInput).toHaveFocus();
            expect(screen.getByText(/You already have an active debate\./)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
            expect(screen.getByRole('region', { name: 'Replace debate' })).toBeInTheDocument();
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Open debate actions' })).not.toBeInTheDocument();
        });
    });

    it('AC-35: cancel exits replace mode with the current debate unchanged', async () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
        fireEvent.click(screen.getByRole('button', { name: 'New Debate' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        });

        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: 'Should city centers ban private cars?' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(activeDebateFixture.topic);
            expect(screen.getAllByRole('listitem')).toHaveLength(activeDebateFixture.arguments.length);
            expect(screen.getByRole('button', { name: 'Open debate actions' })).toHaveFocus();
        });

        expect(window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(
            JSON.stringify(createStoredActiveDebateFixtureRecord())
        );
    });

    it('AC-34: replace submit writes a fresh topic and clears carried arguments', async () => {
        render(<DebateScreen />);

        fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
        fireEvent.click(screen.getByRole('button', { name: 'New Debate' }));

        await waitFor(() => {
            expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
        });

        const replacementTopic = 'Should governments mandate open-source AI models?';
        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: `  ${replacementTopic}  ` },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(replacementTopic);
            expect(screen.queryByRole('textbox', { name: 'Debate topic' })).not.toBeInTheDocument();
            expect(screen.getByRole('region', { name: 'Debate arguments' })).toBeInTheDocument();
        });

        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        expect(window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(
            JSON.stringify(
                createStoredActiveDebateFixtureRecord({
                    topic: replacementTopic,
                    arguments: [],
                })
            )
        );
    });

    it('AC-34: failed replace submit keeps the current debate intact until save succeeds', async () => {
        const storedRecord = window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY);
        const unavailableWriteStorage = {
            clear() {
                if (storedRecord !== null) {
                    return;
                }
            },
            getItem(key: string) {
                return key === ACTIVE_DEBATE_STORAGE_KEY ? storedRecord : null;
            },
            key(index: number) {
                return index === 0 ? ACTIVE_DEBATE_STORAGE_KEY : null;
            },
            removeItem(_key: string) {
                if (storedRecord !== null) {
                    return;
                }
            },
            setItem(_key: string, _value: string) {
                throw new Error('Storage unavailable');
            },
            get length() {
                return storedRecord === null ? 0 : 1;
            },
        } as Storage;
        vi.stubGlobal('localStorage', unavailableWriteStorage);

        try {
            render(<DebateScreen />);

            fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
            fireEvent.click(screen.getByRole('button', { name: 'New Debate' }));
            fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
                target: { value: 'Should cities ban private cars from downtown roads?' },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Start' }));

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'Unable to start a new debate right now. Please try again.'
                );
            });

            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
                    activeDebateFixture.topic
                );
                expect(screen.getAllByRole('listitem')).toHaveLength(activeDebateFixture.arguments.length);
            });
            expect(window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(storedRecord);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('AC-34: keeps create state when active debate persistence is unavailable', async () => {
        window.localStorage.clear();
        const unavailableStorage = {
            clear() {
                throw new Error('Storage unavailable');
            },
            getItem(_key: string) {
                throw new Error('Storage unavailable');
            },
            key(_index: number) {
                throw new Error('Storage unavailable');
                return null;
            },
            removeItem(_key: string) {
                throw new Error('Storage unavailable');
            },
            setItem(_key: string, _value: string) {
                throw new Error('Storage unavailable');
            },
            get length() {
                throw new Error('Storage unavailable');
                return 0;
            },
        } as Storage;
        vi.stubGlobal('localStorage', unavailableStorage);

        try {
            render(<DebateScreen />);

            fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
                target: { value: 'Should communities ban private cars in city centers?' },
            });
            fireEvent.click(screen.getByRole('button', { name: 'Start' }));

            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: 'Debate topic' })).toBeInTheDocument();
                expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'Unable to start a new debate right now. Please try again.'
                );
            });
        } finally {
            vi.unstubAllGlobals();
        }
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

    it('AC-29: keeps topic drafting aligned across mobile, tablet, and desktop breakpoints', () => {
        expect(debateScreenCss).toContain(
            '.debate-screen__empty-state {\n    position: relative;\n    min-height: 100vh;\n    min-height: 100dvh;\n    display: flex;\n    flex-direction: column;'
        );
        expect(debateScreenCss).toContain(
            '.debate-screen__action-error {\n    max-width: var(--size-create-debate-content-max-width);'
        );
        expect(debateScreenCss).toContain(
            '.debate-screen__empty-action-error {\n    margin: 0 0 var(--space-4);\n    width: 100%;'
        );
        expect(debateScreenCss).toContain('left: calc(var(--space-4) / 2);');
        expect(debateScreenCss).toContain('top: calc(var(--space-5) + (var(--space-4) / 2));');
        expect(debateScreenCss).toContain('@media (min-width: 768px)');
        expect(debateScreenCss).toContain(
            'max-width: var(--size-create-debate-content-max-width-tablet);'
        );
        expect(debateScreenCss).toContain('left: var(--space-4);');
        expect(debateScreenCss).toContain('top: var(--space-4);');
        expect(debateScreenCss).toContain('@media (min-width: 1024px)');
        expect(debateScreenCss).toContain(
            'max-width: var(--size-create-debate-content-max-width-desktop);'
        );
    });
});
