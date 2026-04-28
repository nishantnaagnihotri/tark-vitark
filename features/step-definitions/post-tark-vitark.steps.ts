import {
  After,
  Before,
  Given,
  Then,
  When,
  World,
  setWorldConstructor,
} from '@cucumber/cucumber';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import * as assert from 'assert';
import { createElement } from 'react';
import { DebateScreen } from '../../src/components/DebateScreen';
import { Podium } from '../../src/components/Podium';
import type { Side } from '../../src/data/debate';
import {
  activeDebateFixture,
  seedActiveDebateFixture,
} from '../../tests/fixtures/activeDebateFixture';

function activeRender(world: PostTarkVitarkWorld): RenderResult {
  assert.ok(world.renderResult, 'Expected an active rendered view.');
  return world.renderResult;
}

function toSideLabel(side: Side): string {
  return side === 'tark' ? 'Tark' : 'Vitark';
}

function expandComposerOptions(world: PostTarkVitarkWorld): void {
  const view = activeRender(world);
  if (view.queryByRole('button', { name: 'Post as Tark' })) {
    return;
  }

  fireEvent.click(view.getByRole('button', { name: 'Open post composer' }));
}

async function openBottomSheetForSide(world: PostTarkVitarkWorld, side: Side = 'tark'): Promise<void> {
  const view = activeRender(world);

  if (!view.queryByRole('dialog', { name: 'Post composer' })) {
    expandComposerOptions(world);

    await waitFor(() => {
      const sideButton = activeRender(world).getByRole('button', {
        name: side === 'tark' ? 'Post as Tark' : 'Post as Vitark',
      }) as HTMLButtonElement;
      assert.equal(sideButton.disabled, false);
    });

    fireEvent.click(
      activeRender(world).getByRole('button', {
        name: side === 'tark' ? 'Post as Tark' : 'Post as Vitark',
      })
    );
    return;
  }

  const sideToggle = view.getByRole('radio', { name: toSideLabel(side) });
  if (sideToggle.getAttribute('aria-checked') !== 'true') {
    fireEvent.click(sideToggle);
  }
}

async function composerInput(world: PostTarkVitarkWorld): Promise<HTMLTextAreaElement> {
  const view = activeRender(world);
  const existingComposerInput = view.queryByRole('textbox', {
    name: 'Post text',
  });
  if (existingComposerInput) {
    return existingComposerInput as HTMLTextAreaElement;
  }

  await openBottomSheetForSide(world);
  return activeRender(world).getByRole('textbox', {
    name: 'Post text',
  }) as HTMLTextAreaElement;
}

async function publishButton(world: PostTarkVitarkWorld): Promise<HTMLButtonElement> {
  const view = activeRender(world);
  const existingPublishButton = view.queryByRole('button', {
    name: 'Publish post',
  });
  if (existingPublishButton) {
    return existingPublishButton as HTMLButtonElement;
  }

  await openBottomSheetForSide(world);
  return activeRender(world).getByRole('button', {
    name: 'Publish post',
  }) as HTMLButtonElement;
}

function debateItems(world: PostTarkVitarkWorld): HTMLElement[] {
  return activeRender(world).queryAllByRole('listitem');
}

function buildText(length: number): string {
  return 'a'.repeat(length);
}

async function submitComposer(world: PostTarkVitarkWorld): Promise<void> {
  const composerPublishButton = await publishButton(world);

  await waitFor(() => {
    assert.equal(composerPublishButton.disabled, false);
  });

  fireEvent.click(composerPublishButton);
}

class PostTarkVitarkWorld extends World {
  baselineCount = 0;
  latestPublishedText = '';
  publishCalls = 0;
  resolvePendingPublish: (() => void) | null = null;
  restoreStorage: (() => void) | null = null;
  renderResult: RenderResult | null = null;

  renderDebateScreen(): void {
    cleanup();
    this.renderResult = render(createElement(DebateScreen));
    this.baselineCount = debateItems(this).length;
  }
}

setWorldConstructor(PostTarkVitarkWorld);

Before(function (this: PostTarkVitarkWorld) {
  cleanup();
  window.localStorage.clear();
  this.baselineCount = 0;
  this.latestPublishedText = '';
  this.publishCalls = 0;
  this.resolvePendingPublish = null;
  this.restoreStorage = null;
  this.renderResult = null;
});

After(function (this: PostTarkVitarkWorld) {
  this.resolvePendingPublish?.();
  this.resolvePendingPublish = null;
  this.restoreStorage?.();
  this.restoreStorage = null;
  this.renderResult?.unmount();
  this.renderResult = null;
  cleanup();
});

Given('an active debate exists in storage', function (this: PostTarkVitarkWorld) {
  seedActiveDebateFixture(window.localStorage);
  this.baselineCount = activeDebateFixture.arguments.length;
});

Given('no active debate exists in storage', function (this: PostTarkVitarkWorld) {
  window.localStorage.clear();
  this.baselineCount = 0;
});

Given('the debate screen is loaded', function (this: PostTarkVitarkWorld) {
  this.renderDebateScreen();
});

Then('the composer controls are visible', function (this: PostTarkVitarkWorld) {
  const view = activeRender(this);

  assert.ok(view.getByRole('button', { name: 'Open post composer' }));
  assert.equal(view.queryByRole('button', { name: /sign in|log in/i }), null);
  assert.equal(view.queryByLabelText(/image|media|upload/i), null);
});

Then('Tark is selected by default', async function (this: PostTarkVitarkWorld) {
  await openBottomSheetForSide(this, 'tark');

  await waitFor(() => {
    const tarkOption = activeRender(this).getByRole('radio', { name: 'Tark' });
    assert.ok(tarkOption);
    assert.equal(tarkOption.getAttribute('aria-checked'), 'true');
  });
});

When('the visitor selects the Vitark side', function (this: PostTarkVitarkWorld) {
  return openBottomSheetForSide(this, 'vitark');
});

Then('Vitark remains selected', function (this: PostTarkVitarkWorld) {
  const visibleVitarkChip = activeRender(this).queryByRole('radio', { name: 'Vitark' });
  if (visibleVitarkChip) {
    assert.equal(visibleVitarkChip.getAttribute('aria-checked'), 'true');
    return;
  }

  const items = debateItems(this);
  const latestItem = items[items.length - 1];
  assert.ok(latestItem, 'Expected a latest debate item after publishing.');
  const latestVitarkCard = latestItem.querySelector('.argument-card--vitark');
  assert.ok(latestVitarkCard, 'Expected the latest published argument to remain on the Vitark side.');
  assert.ok(
    latestItem.textContent?.includes(this.latestPublishedText),
    'Expected the latest Vitark argument text to remain visible in the timeline.'
  );
});

When('the visitor enters whitespace-only post text', async function (this: PostTarkVitarkWorld) {
  fireEvent.change(await composerInput(this), { target: { value: '      ' } });
});

When('the visitor enters a post with {int} characters', async function (this: PostTarkVitarkWorld, length: number) {
  this.latestPublishedText = buildText(length);
  fireEvent.change(await composerInput(this), { target: { value: this.latestPublishedText } });
});

When('the visitor enters valid multiline post text', async function (this: PostTarkVitarkWorld) {
  this.latestPublishedText = 'Line one has spaces\nLine two stays valid.';
  fireEvent.change(await composerInput(this), { target: { value: this.latestPublishedText } });
});

When('the visitor submits the post', async function (this: PostTarkVitarkWorld) {
  await submitComposer(this);
});

When('the visitor publishes the post text {string}', async function (this: PostTarkVitarkWorld, text: string) {
  this.latestPublishedText = text;
  fireEvent.change(await composerInput(this), { target: { value: text } });
  await submitComposer(this);
});

Then('a validation error appears saying {string}', async function (this: PostTarkVitarkWorld, message: string) {
  assert.equal(activeRender(this).getByRole('alert').textContent?.trim(), message);
  assert.equal((await composerInput(this)).getAttribute('aria-invalid'), 'true');
});

Then('no new debate post is added', function (this: PostTarkVitarkWorld) {
  assert.equal(debateItems(this).length, this.baselineCount);
});

Then('one new debate post is added', async function (this: PostTarkVitarkWorld) {
  await waitFor(() => {
    assert.equal(debateItems(this).length, this.baselineCount + 1);
  });
});

Then('no validation error is shown', function (this: PostTarkVitarkWorld) {
  assert.equal(activeRender(this).queryByRole('alert'), null);
  const composerTextInput = activeRender(this).queryByRole('textbox', { name: 'Post text' });
  if (composerTextInput) {
    assert.notEqual(composerTextInput.getAttribute('aria-invalid'), 'true');
  }
});

Then('the latest debate post text is {string}', async function (this: PostTarkVitarkWorld, expected: string) {
  await waitFor(() => {
    const items = debateItems(this);
    const latestItem = items[items.length - 1];
    assert.ok(latestItem);
    assert.ok(latestItem.textContent?.includes(expected));
  });
});

Then('the composer input is cleared', async function (this: PostTarkVitarkWorld) {
  const input = await composerInput(this);

  await waitFor(() => {
    assert.equal(input.value, '');
  });
});

Given('a publish is already in progress in the composer', async function (this: PostTarkVitarkWorld) {
  cleanup();
  this.renderResult = render(
    createElement(Podium, {
      selectedSide: 'tark',
      onSideChange: () => {},
      onPublish: () =>
        new Promise<void>((resolve) => {
          this.publishCalls += 1;
          this.resolvePendingPublish = resolve;
        }),
    })
  );

  fireEvent.change(await composerInput(this), { target: { value: 'This text has enough length.' } });
  await submitComposer(this);

  await waitFor(() => {
    assert.equal(this.publishCalls, 1);
  });
});

When('the visitor attempts another publish while busy', async function (this: PostTarkVitarkWorld) {
  fireEvent.click(await publishButton(this));
});

Then('the second publish attempt is blocked', async function (this: PostTarkVitarkWorld) {
  assert.equal(this.publishCalls, 1);
  assert.equal((await publishButton(this)).disabled, true);
});

When('the page is refreshed', function (this: PostTarkVitarkWorld) {
  cleanup();
  this.renderResult = render(createElement(DebateScreen));
});

Then('the published post remains in the debate after refresh', async function (this: PostTarkVitarkWorld) {
  await waitFor(() => {
    assert.equal(debateItems(this).length, this.baselineCount + 1);
    assert.ok(activeRender(this).queryByText(this.latestPublishedText));
  });
});
