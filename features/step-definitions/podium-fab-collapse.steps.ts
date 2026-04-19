import { After, Given, Then, When, World } from '@cucumber/cucumber';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import * as assert from 'assert';
import { createElement } from 'react';
import { DebateScreen } from '../../src/components/DebateScreen';

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

interface MutableMediaQueryList extends MediaQueryList {
    updateMatches: (nextValue: boolean) => void;
}

interface MatchMediaController {
    setIsMobile: (nextValue: boolean) => void;
}

interface PodiumFabCollapseWorld extends World {
    renderResult: RenderResult | null;
    baselineCount: number;
    originalMatchMedia?: typeof window.matchMedia;
    viewportController?: MatchMediaController;
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

function installViewportController(
    world: PodiumFabCollapseWorld,
    isMobileAtMount: boolean
): MatchMediaController {
    const viewportListeners = new Set<MediaQueryChangeListener>();
    const viewportQuery = '(max-width: 767px)';
    const viewportMediaQueryList = createMediaQueryList(
        viewportQuery,
        isMobileAtMount,
        viewportListeners
    );
    const fallbackMatchMedia = world.originalMatchMedia ?? window.matchMedia;

    window.matchMedia = ((query: string) => {
        if (query === viewportQuery) {
            return viewportMediaQueryList;
        }

        return fallbackMatchMedia(query);
    }) as typeof window.matchMedia;

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

function activeRender(world: PodiumFabCollapseWorld): RenderResult {
    assert.ok(world.renderResult, 'Expected the debate screen to be rendered.');
    return world.renderResult;
}

function ensureAnimationFrameApi(): void {
    if (typeof window.requestAnimationFrame !== 'function') {
        window.requestAnimationFrame = (callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(Date.now()), 0);
    }

    if (typeof window.cancelAnimationFrame !== 'function') {
        window.cancelAnimationFrame = (id: number) => {
            window.clearTimeout(id);
        };
    }
}

function renderDebateScreen(world: PodiumFabCollapseWorld): void {
    ensureAnimationFrameApi();
    cleanup();
    world.renderResult = render(createElement(DebateScreen));
    world.baselineCount = activeRender(world).getAllByRole('listitem').length;
}

async function expandFab(world: PodiumFabCollapseWorld): Promise<void> {
    fireEvent.click(
        activeRender(world).getByRole('button', { name: 'Open post composer' })
    );

    await waitFor(() => {
        const tarkMiniButton = activeRender(world).getByRole('button', {
            name: 'Post as Tark',
        }) as HTMLButtonElement;
        assert.equal(tarkMiniButton.disabled, false);
    });
}

After(function (this: PodiumFabCollapseWorld) {
    if (this.originalMatchMedia) {
        window.matchMedia = this.originalMatchMedia;
    }
    this.viewportController = undefined;
});

Given('I am on the debate screen', function (this: PodiumFabCollapseWorld) {
    if (!this.originalMatchMedia) {
        this.originalMatchMedia = window.matchMedia;
    }

    this.viewportController = installViewportController(this, false);
    renderDebateScreen(this);
});

Given(/^the viewport is mobile \(width < 768px\)$/, function (this: PodiumFabCollapseWorld) {
    assert.ok(this.viewportController, 'Expected viewport controller to be configured.');
    this.viewportController.setIsMobile(true);
    renderDebateScreen(this);
});

Given(/^the viewport is desktop \(width >= 768px\)$/, function (this: PodiumFabCollapseWorld) {
    assert.ok(this.viewportController, 'Expected viewport controller to be configured.');
    this.viewportController.setIsMobile(false);
    renderDebateScreen(this);
});

Then('I see the Podium FAB button', function (this: PodiumFabCollapseWorld) {
    const fabButton = activeRender(this).getByRole('button', {
        name: 'Open post composer',
    });
    assert.ok(fabButton.classList.contains('podium-fab'));
});

Then('I do not see the inline Podium', function (this: PodiumFabCollapseWorld) {
    assert.equal(
        activeRender(this).queryByRole('switch', { name: 'Post as Tark' }),
        null
    );
});

When('I tap the Podium FAB', function (this: PodiumFabCollapseWorld) {
    fireEvent.click(
        activeRender(this).getByRole('button', { name: 'Open post composer' })
    );
});

Then('I see the Tark mini-button', async function (this: PodiumFabCollapseWorld) {
    await waitFor(() => {
        const tarkMiniButton = activeRender(this).getByRole('button', {
            name: 'Post as Tark',
        }) as HTMLButtonElement;
        assert.equal(tarkMiniButton.disabled, false);
    });
});

Then(
    'I see the Vitark mini-button',
    async function (this: PodiumFabCollapseWorld) {
        await waitFor(() => {
            const vitarkMiniButton = activeRender(this).getByRole('button', {
                name: 'Post as Vitark',
            }) as HTMLButtonElement;
            assert.equal(vitarkMiniButton.disabled, false);
        });
    }
);

Then(
    'I see the dismiss mini-button',
    async function (this: PodiumFabCollapseWorld) {
        await waitFor(() => {
            const dismissMiniButton = activeRender(this).getByRole('button', {
                name: 'Close',
            }) as HTMLButtonElement;
            assert.equal(dismissMiniButton.disabled, false);
        });
    }
);

Given('the FAB is expanded', async function (this: PodiumFabCollapseWorld) {
    await expandFab(this);
});

When('I tap the Tark mini-button', function (this: PodiumFabCollapseWorld) {
    fireEvent.click(
        activeRender(this).getByRole('button', { name: 'Post as Tark' })
    );
});

Then('the bottom sheet opens', async function (this: PodiumFabCollapseWorld) {
    await waitFor(() => {
        assert.ok(
            activeRender(this).getByRole('dialog', { name: 'Post composer' })
        );
    });
});

Then(
    'the SegmentedControl has Tark selected',
    function (this: PodiumFabCollapseWorld) {
        const tarkRadio = activeRender(this).getByRole('radio', { name: 'Tark' });
        assert.equal(tarkRadio.getAttribute('aria-checked'), 'true');
    }
);

Given(
    'the bottom sheet is open with Tark selected',
    async function (this: PodiumFabCollapseWorld) {
        if (!this.originalMatchMedia) {
            this.originalMatchMedia = window.matchMedia;
        }

        this.viewportController = installViewportController(this, true);
        renderDebateScreen(this);
        await expandFab(this);
        fireEvent.click(activeRender(this).getByRole('button', { name: 'Post as Tark' }));

        await waitFor(() => {
            assert.ok(
                activeRender(this).getByRole('dialog', { name: 'Post composer' })
            );
            const tarkRadio = activeRender(this).getByRole('radio', { name: 'Tark' });
            assert.equal(tarkRadio.getAttribute('aria-checked'), 'true');
        });
    }
);

When(
    'I type {string} in the post text area',
    function (this: PodiumFabCollapseWorld, postText: string) {
        fireEvent.change(activeRender(this).getByRole('textbox', { name: 'Post text' }), {
            target: { value: postText },
        });
    }
);

When('I tap the Publish button', function (this: PodiumFabCollapseWorld) {
    fireEvent.click(activeRender(this).getByRole('button', { name: 'Publish post' }));
});

Then(
    'the post is submitted with side Tark and text {string}',
    async function (this: PodiumFabCollapseWorld, expectedText: string) {
        await waitFor(() => {
            const timelineItems = Array.from(
                activeRender(this).container.querySelectorAll<HTMLElement>(
                    '.timeline__list > li'
                )
            );
            assert.equal(timelineItems.length, this.baselineCount + 1);

            const latestTimelineItem = timelineItems[timelineItems.length - 1];
            assert.ok(latestTimelineItem);
            assert.ok(
                latestTimelineItem.classList.contains('timeline__item--tark')
            );
            assert.ok(latestTimelineItem.textContent?.includes(expectedText));
        });
    }
);

Then('the bottom sheet closes', async function (this: PodiumFabCollapseWorld) {
    await waitFor(() => {
        assert.equal(
            activeRender(this).queryByRole('dialog', { name: 'Post composer' }),
            null
        );
    });
});

Then('I do not see the Podium FAB', function (this: PodiumFabCollapseWorld) {
    assert.equal(
        activeRender(this).queryByRole('button', { name: 'Open post composer' }),
        null
    );
    assert.equal(
        activeRender(this).queryByRole('dialog', { name: 'Post composer' }),
        null
    );
});

Then('I see the inline Podium', function (this: PodiumFabCollapseWorld) {
    assert.ok(activeRender(this).getByRole('switch', { name: 'Post as Tark' }));
    assert.ok(activeRender(this).getByRole('textbox', { name: 'Post text' }));
    assert.ok(activeRender(this).getByRole('button', { name: 'Publish post' }));
});
