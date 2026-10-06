# EmptyState

An invitation to act where there is nothing to show yet: an optional line icon, a heading, one sentence, and the next action, in a sunken area of the sheet.

## When to use

- A list, page or panel that has no items yet, with a first action to take.
- A search or filter that found nothing, with a way to widen it.
- A read-only empty area, where the heading and description are enough (omit `action`).

## When not to use

- For content that is still loading, use [Skeleton](../skeleton/README.md).
- For an error that needs the person's attention now, use [Toast](../toast/README.md) or [Dialog](../dialog/README.md).
- For a static block of content on a sheet, use [Card](../card/README.md).

## Usage

```tsx
import { Button, EmptyState } from "@anyknown/ui"

<EmptyState
  icon={<MemoryIcon />}
  title="No memories yet"
  description="Start your first thread. Important things are kept automatically and travel with every handoff."
  action={<Button onClick={startThread}>Start a thread</Button>}
  headingLevel={2}
/>
```

Write the description as the next step, not only "there is nothing here". The icon should be a line drawing in `currentColor`; it is not set on a round backing.

## Accessibility

- A `<div>` with no role. The title is a real heading, `<h3>` by default; set `headingLevel` (1–6) to fit the page outline.
- The `icon` slot is wrapped in `aria-hidden="true"`, so the icon is never read. Do not put meaning only in the icon.
- The description is a `<p>`. The `action` slot renders what you pass; use a real [Button](../button/README.md) or link so it is focusable.
- No motion and no built-in words.

## Keyboard

No keyboard interaction of its own. The control you pass in `action` (usually a Button) is in the normal tab order.

## Related

- [Skeleton](../skeleton/README.md) — the loading state before an empty state.
- [Button](../button/README.md) — the usual `action`.
- [Icon](../icon/README.md) — size and stroke for the line icon.
