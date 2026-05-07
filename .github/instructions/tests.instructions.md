---
applyTo:
  - "**/tests/**"
  - "**/features/**/*.feature"
  - "**/features/step-definitions/**/*.ts"
---
# Test Standards

## Domain Language

Test descriptions and assertions must use domain terminology.
Infrastructure terms must not appear in scenario names or `it()` descriptions.

```ts
// Avoid
it('renders the component with correct DOM elements')
it('component state updates on click')

// Prefer
it('publishes a tark when the submit button is pressed')
it('shows a vitark after a challenge is accepted')
```

## BDD Step Quality

Gherkin scenarios (`features/*.feature`) must map one step to one observable
behavior. Steps must not bundle multiple actions or assertions into one line.

```gherkin
# Avoid
When I fill in the form and click submit and see the result

# Prefer
When I fill in the tark text
And I press "Publish"
Then a new tark appears in the debate
```

## Acceptance Criteria Traceability

Each `it()` or `test()` block must trace back to an acceptance criterion in
the corresponding `.feature` file. The scenario title or a comment must make
this link explicit.

## Stateful Behavior Coverage

When a behavior has more than one observable state, tests must cover at least
one real state transition instead of asserting only an initial or final static
state.

```ts
// Avoid
it('shows the published state')

// Prefer
it('moves from draft to published when publish is confirmed')
```

## External Source Synchronization

When behavior depends on a source of truth outside the unit under direct test,
cover both initial derivation and re-synchronization after that source changes.
Examples include URL state, storage, document attributes, system preference,
shared context, or server-provided data.

```ts
// Avoid
it('reads the initial preference from storage')

// Prefer
it('re-aligns with the stored preference after the preference changes')
```
