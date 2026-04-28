import { Given, Then, When, World } from '@cucumber/cucumber';
import {
  fireEvent,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import * as assert from 'assert';
import { ACTIVE_DEBATE_STORAGE_KEY, loadStoredActiveDebateRecord } from '../../src/lib/activeDebateStorage';
import {
  activeDebateFixture,
  createStoredActiveDebateFixtureRecord,
} from '../../tests/fixtures/activeDebateFixture';

interface CreateDebateWorld extends World {
  baselineCount: number;
  renderResult: RenderResult | null;
  restoreStorage: (() => void) | null;
}

function activeRender(world: CreateDebateWorld): RenderResult {
  assert.ok(world.renderResult, 'Expected the debate screen to be rendered.');
  return world.renderResult;
}

function topicInput(world: CreateDebateWorld): HTMLInputElement {
  return activeRender(world).getByRole('textbox', {
    name: 'Debate topic',
  }) as HTMLInputElement;
}

function startButton(world: CreateDebateWorld): HTMLButtonElement {
  return activeRender(world).getByRole('button', {
    name: 'Start',
  }) as HTMLButtonElement;
}

Given('active debate storage contains corrupt payload', function () {
  window.localStorage.setItem(ACTIVE_DEBATE_STORAGE_KEY, '{"version":1');
});

Given('active debate storage is unavailable', function (this: CreateDebateWorld) {
  const windowStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
  const unavailableStorage = {
    clear() {
      throw new Error('Storage unavailable');
    },
    getItem(_key: string) {
      throw new Error('Storage unavailable');
    },
    key(_index: number): string | null {
      throw new Error('Storage unavailable');
    },
    removeItem(_key: string) {
      throw new Error('Storage unavailable');
    },
    setItem(_key: string, _value: string) {
      throw new Error('Storage unavailable');
    },
    get length(): number {
      throw new Error('Storage unavailable');
    },
  } as Storage;

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: unavailableStorage,
  });

  this.restoreStorage = () => {
    if (windowStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', windowStorageDescriptor);
    }
  };
});

Then('the debate topic form is visible in empty state', function (this: CreateDebateWorld) {
  const view = activeRender(this);
  assert.ok(view.getByRole('region', { name: 'Create debate' }));
  assert.ok(topicInput(this));
  assert.ok(startButton(this));
  assert.equal(view.queryByRole('heading', { level: 1 }), null);
});

Then('the start action is disabled', function (this: CreateDebateWorld) {
  assert.equal(startButton(this).disabled, true);
});

Then('podium entry controls are not visible', function (this: CreateDebateWorld) {
  const view = activeRender(this);
  assert.equal(view.queryByRole('button', { name: 'Open post composer' }), null);
  assert.equal(view.queryByRole('dialog', { name: 'Post composer' }), null);
});

Then('podium entry controls are visible', function (this: CreateDebateWorld) {
  assert.ok(
    activeRender(this).getByRole('button', {
      name: 'Open post composer',
    })
  );
});

Then('the hardcoded seeded topic is not shown', function (this: CreateDebateWorld) {
  assert.equal(activeRender(this).queryByText(activeDebateFixture.topic), null);
});

When('the visitor enters {int} topic characters', function (this: CreateDebateWorld, length: number) {
  fireEvent.change(topicInput(this), {
    target: { value: 'a'.repeat(length) },
  });
});

Then('the topic length error is shown', function (this: CreateDebateWorld) {
  assert.ok(activeRender(this).getByRole('alert'));
  assert.equal(topicInput(this).getAttribute('aria-invalid'), 'true');
});

Then('the topic length error is not shown', function (this: CreateDebateWorld) {
  assert.equal(activeRender(this).queryByRole('alert'), null);
  assert.notEqual(topicInput(this).getAttribute('aria-invalid'), 'true');
});

When('the visitor starts a debate with topic {string}', async function (this: CreateDebateWorld, topic: string) {
  fireEvent.change(topicInput(this), {
    target: { value: topic },
  });
  fireEvent.click(startButton(this));

  await waitFor(() => {
    assert.ok(activeRender(this).getByRole('heading', { level: 1 }));
  });
});

Then('the active debate heading is {string}', async function (this: CreateDebateWorld, expectedTopic: string) {
  await waitFor(() => {
    const heading = activeRender(this).getByRole('heading', { level: 1 });
    assert.equal(heading.textContent?.trim(), expectedTopic);
  });

  const storedActiveDebate = loadStoredActiveDebateRecord(window.localStorage).record.activeDebate;
  assert.equal(storedActiveDebate?.topic, expectedTopic);
});

When('the visitor opens New Debate from debate actions', function (this: CreateDebateWorld) {
  fireEvent.click(
    activeRender(this).getByRole('button', {
      name: 'Open debate actions',
    })
  );
  fireEvent.click(
    activeRender(this).getByRole('button', {
      name: 'New Debate',
    })
  );
});

Then('the replace warning is visible', function (this: CreateDebateWorld) {
  const view = activeRender(this);
  assert.ok(view.getByText(/You already have an active debate\./));
  assert.ok(view.getByText(/Starting a new one will replace it\./));
  assert.equal(view.queryByRole('dialog'), null);
});

Then('the replace form is visible', function (this: CreateDebateWorld) {
  const view = activeRender(this);
  assert.ok(view.getByRole('region', { name: 'Replace debate' }));
  assert.ok(view.getByRole('button', { name: 'Cancel' }));
});

When('the visitor cancels replacing the debate', function (this: CreateDebateWorld) {
  fireEvent.click(
    activeRender(this).getByRole('button', {
      name: 'Cancel',
    })
  );
});

Then('the existing active debate remains unchanged', async function (this: CreateDebateWorld) {
  await waitFor(() => {
    const heading = activeRender(this).getByRole('heading', { level: 1 });
    assert.equal(heading.textContent?.trim(), activeDebateFixture.topic);
  });

  assert.equal(activeRender(this).getAllByRole('listitem').length, activeDebateFixture.arguments.length);
  assert.equal(
    window.localStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY),
    JSON.stringify(createStoredActiveDebateFixtureRecord())
  );
});

When(
  'the visitor starts a replacement debate with topic {string}',
  async function (this: CreateDebateWorld, topic: string) {
    fireEvent.change(topicInput(this), {
      target: { value: topic },
    });
    fireEvent.click(startButton(this));

    await waitFor(() => {
      const heading = activeRender(this).getByRole('heading', { level: 1 });
      assert.equal(heading.textContent?.trim(), topic);
    });
  }
);

Then('the active debate timeline is empty', function (this: CreateDebateWorld) {
  assert.equal(activeRender(this).queryAllByRole('listitem').length, 0);
  const storedActiveDebate = loadStoredActiveDebateRecord(window.localStorage).record.activeDebate;
  assert.ok(storedActiveDebate);
  assert.equal(storedActiveDebate.arguments.length, 0);
});

Then('no standalone clear debate action is available', function (this: CreateDebateWorld) {
  const view = activeRender(this);
  assert.equal(view.queryByRole('button', { name: /clear debate/i }), null);
  fireEvent.click(
    view.getByRole('button', {
      name: 'Open debate actions',
    })
  );
  assert.equal(activeRender(this).queryByRole('button', { name: /clear debate/i }), null);
});
