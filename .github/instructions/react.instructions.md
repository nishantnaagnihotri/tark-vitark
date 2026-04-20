---
applyTo: "**/*.tsx"
---
# React Component Standards

## Validation Boundary

The component that owns the `<form>` element is the sole validation boundary.
Downstream handlers (`onPublish`, `handlePublish`, etc.) must not re-validate
the same input — they trust the caller.

If a handler is called from multiple entry points without a form, the handler
validates once internally.

```tsx
// Avoid: double validation
function handleSubmit(text: string) {
  const validation = validatePost(text); // ← form component already did this
  if (!validation.valid) return;
  onPublish(text);
}

// Prefer: trust the form boundary
function handleSubmit(text: string) {
  onPublish(text);
}
```

## Domain Naming

Use domain terminology in component names, prop names, and event handlers.
Avoid generic names like `item`, `data`, `handleClick` — prefer `tark`,
`vitark`, `onPublish`, `onChallenge`.
