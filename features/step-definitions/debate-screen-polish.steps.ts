import { Then, World } from '@cucumber/cucumber';
import type { RenderResult } from '@testing-library/react';
import * as assert from 'assert';

interface DebateScreenPolishWorld extends World {
  renderResult: RenderResult | null;
}

function activeRender(world: DebateScreenPolishWorld): RenderResult {
  assert.ok(world.renderResult, 'Expected the debate screen to be rendered.');
  return world.renderResult;
}

function timelineItems(world: DebateScreenPolishWorld): HTMLElement[] {
  return Array.from(
    activeRender(world).container.querySelectorAll<HTMLElement>('.timeline__list > .timeline__item')
  );
}

function sideItems(world: DebateScreenPolishWorld, side: 'tark' | 'vitark'): HTMLElement[] {
  return timelineItems(world).filter((item) => item.classList.contains(`timeline__item--${side}`));
}

function assertSpineCellAsSecondChild(items: HTMLElement[], side: 'tark' | 'vitark'): void {
  assert.ok(items.length > 0, `Expected at least one ${side} timeline item.`);

  for (const item of items) {
    assert.equal(item.children.length >= 2, true, `Expected ${side} item to have at least 2 children.`);
    const secondChild = item.children.item(1);
    assert.ok(secondChild, `Expected ${side} item to have a second child.`);
    assert.equal(
      secondChild.classList.contains('timeline__spine-cell'),
      true,
      `Expected ${side} item second child to be .timeline__spine-cell.`
    );
  }
}

// AC-1/2/3/5 include pixel/layout/overflow behavior that jsdom cannot verify and are deferred to Gate 5.5 runtime QA.

Then('each timeline item has the timeline__item CSS class', function (this: DebateScreenPolishWorld) {
  const items = timelineItems(this);
  assert.ok(items.length > 0, 'Expected timeline items to exist.');

  for (const item of items) {
    assert.equal(item.classList.contains('timeline__item'), true);
  }
});

Then('each Tark timeline item has the timeline__item--tark class', function (this: DebateScreenPolishWorld) {
  const tarkItems = sideItems(this, 'tark');
  assert.ok(tarkItems.length > 0, 'Expected at least one Tark timeline item.');

  for (const item of tarkItems) {
    assert.equal(item.classList.contains('timeline__item--tark'), true);
  }
});

Then('each Vitark timeline item has the timeline__item--vitark class', function (this: DebateScreenPolishWorld) {
  const vitarkItems = sideItems(this, 'vitark');
  assert.ok(vitarkItems.length > 0, 'Expected at least one Vitark timeline item.');

  for (const item of vitarkItems) {
    assert.equal(item.classList.contains('timeline__item--vitark'), true);
  }
});

Then('each Vitark timeline item has exactly 2 direct children', function (this: DebateScreenPolishWorld) {
  const vitarkItems = sideItems(this, 'vitark');
  assert.ok(vitarkItems.length > 0, 'Expected at least one Vitark timeline item.');

  for (const item of vitarkItems) {
    assert.equal(item.children.length, 2);
  }
});

Then('each Vitark timeline item has a spine cell as its second child', function (this: DebateScreenPolishWorld) {
  assertSpineCellAsSecondChild(sideItems(this, 'vitark'), 'vitark');
});

Then('each Tark timeline item has a spine cell as its second child', function (this: DebateScreenPolishWorld) {
  assertSpineCellAsSecondChild(sideItems(this, 'tark'), 'tark');
});

Then('the number of spine dots equals the number of argument cards', function (this: DebateScreenPolishWorld) {
  const view = activeRender(this);
  const spineDots = view.container.querySelectorAll('.timeline__dot');
  const argumentCards = view.container.querySelectorAll('.argument-card');
  assert.equal(spineDots.length, argumentCards.length);
});
