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
import { DEBATE } from '../../src/data/debate';

function activeRender(world: PostTarkVitarkWorld): RenderResult {
  assert.ok(world.renderResult, 'Expected an active rendered view.');
  return world.renderResult;
}

function composerInput(world: PostTarkVitarkWorld): HTMLTextAreaElement {
  return activeRender(world).getByRole('textbox', {
    name: 'Post text',
  }) as HTMLTextAreaElement;
}

function publishButton(world: PostTarkVitarkWorld): HTMLButtonElement {
  return activeRender(world).getByRole('button', {
    name: 'Publish post',
  }) as HTMLButtonElement;
}

function debateItems(world: PostTarkVitarkWorld): HTMLElement[] {
  return activeRender(world).getAllByRole('listitem');
}

function buildText(length: number): string {
  return 'a'.repeat(length);
}

async function submitComposer(world: PostTarkVitarkWorld): Promise<void> {
  await waitFor(() => {
    assert.equal(publishButton(world).disabled, false);
  });

  fireEvent.click(publishButton(world));
}

class PostTarkVitarkWorld extends World {
  baselineCount = DEBATE.arguments.length;
  latestPublishedText = '';
  publishCalls = 0;
  resolvePendingPublish: (() => void) | null = null;
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
  this.baselineCount = DEBATE.arguments.length;
  this.latestPublishedText = '';
  this.publishCalls = 0;
  this.resolvePendingPublish = null;
  this.renderResult = null;
});

After(function (this: PostTarkVitarkWorld) {
  this.resolvePendingPublish?.();
  this.resolvePendingPublish = null;
  this.renderResult?.unmount();
  this.renderResult = null;
  cleanup();
});

Given('the debate screen is loaded', function (this: PostTarkVitarkWorld) {
  this.renderDebateScreen();
});

Then('the composer controls are visible', function (this: PostTarkVitarkWorld) {
  const view = activeRender(this);

  assert.ok(view.getByRole('radiogroup', { name: 'Post side' }));
  assert.ok(composerInput(this));
  assert.ok(publishButton(this));
  assert.equal(view.queryByRole('button', { name: /sign in|log in/i }), null);
  assert.equal(view.queryByLabelText(/image|media|upload/i), null);
});

Then('Tark is selected by default', function (this: PostTarkVitarkWorld) {
  const view = activeRender(this);

  assert.equal(view.getByRole('radio', { name: 'Tark' }).getAttribute('aria-checked'), 'true');
  assert.equal(view.getByRole('radio', { name: 'Vitark' }).getAttribute('aria-checked'), 'false');
});

When('the visitor selects the Vitark side', function (this: PostTarkVitarkWorld) {
  fireEvent.click(activeRender(this).getByRole('radio', { name: 'Vitark' }));
});

Then('Vitark remains selected', function (this: PostTarkVitarkWorld) {
  const view = activeRender(this);

  assert.equal(view.getByRole('radio', { name: 'Vitark' }).getAttribute('aria-checked'), 'true');
  assert.equal(view.getByRole('radio', { name: 'Tark' }).getAttribute('aria-checked'), 'false');
});

When('the visitor enters whitespace-only post text', function (this: PostTarkVitarkWorld) {
  fireEvent.change(composerInput(this), { target: { value: '      ' } });
});

When('the visitor enters a post with {int} characters', function (this: PostTarkVitarkWorld, length: number) {
  this.latestPublishedText = buildText(length);
  fireEvent.change(composerInput(this), { target: { value: this.latestPublishedText } });
});

When('the visitor enters valid multiline post text', function (this: PostTarkVitarkWorld) {
  this.latestPublishedText = 'Line one has spaces\nLine two stays valid.';
  fireEvent.change(composerInput(this), { target: { value: this.latestPublishedText } });
});

When('the visitor submits the post', async function (this: PostTarkVitarkWorld) {
  await submitComposer(this);
});

When('the visitor publishes the post text {string}', async function (this: PostTarkVitarkWorld, text: string) {
  this.latestPublishedText = text;
  fireEvent.change(composerInput(this), { target: { value: text } });
  await submitComposer(this);
});

Then('a validation error appears saying {string}', function (this: PostTarkVitarkWorld, message: string) {
  assert.equal(activeRender(this).getByRole('alert').textContent?.trim(), message);
  assert.equal(composerInput(this).getAttribute('aria-invalid'), 'true');
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
  assert.equal(activeRender(this).getByRole('alert').textContent?.trim(), '');
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
  await waitFor(() => {
    assert.equal(composerInput(this).value, '');
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

  fireEvent.change(composerInput(this), { target: { value: 'This text has enough length.' } });
  await submitComposer(this);

  await waitFor(() => {
    assert.equal(this.publishCalls, 1);
  });
});

When('the visitor attempts another publish while busy', function (this: PostTarkVitarkWorld) {
  fireEvent.click(publishButton(this));
});

Then('the second publish attempt is blocked', function (this: PostTarkVitarkWorld) {
  assert.equal(this.publishCalls, 1);
  assert.equal(publishButton(this).disabled, true);
});

When('the page is refreshed', function (this: PostTarkVitarkWorld) {
  cleanup();
  this.renderResult = render(createElement(DebateScreen));
});

Then('the debate resets to baseline static content', function (this: PostTarkVitarkWorld) {
  assert.equal(debateItems(this).length, DEBATE.arguments.length);
  assert.equal(activeRender(this).queryByText(this.latestPublishedText), null);
});