# Card

A raised sheet of paper on the page: `surfaceRaised` background, card corner radius, rest shadow as its only edge, and large padding.

## When to use

- Grouping related content into one block that sits above the page.
- A container for a form section, a summary, or a preview.

## When not to use

- For a settings list of rows inside one sheet, use [Group](../group/README.md).
- For a sunken empty area that invites a first action, use [EmptyState](../empty-state/README.md).
- For a floating layer that opens from a trigger, use [Popover](../popover/README.md) or [Dialog](../dialog/README.md).

## Usage

```tsx
import { Card, Text } from "@anyknown/ui"

<Card>
  <Text as="h2" variant="title">Workspace</Text>
  <Text variant="caption">142 threads, last handoff at 14:32.</Text>
</Card>
```

`Card` takes every `<div>` prop. To change its look, pass StyleX styles through `sx`: they replace the base value (for example a tighter `padding`). A `className` is kept but does not override the base styles.

## Accessibility

- A plain `<div>` with no role. If the card is a landmark or a labeled region, add `role` and `aria-labelledby` yourself.
- No motion and no focus handling.

## Keyboard

No keyboard interaction of its own. Any focusable content you put inside stays in normal tab order.

## Related

- [Text](../text/README.md) — the type styles to fill a card with.
- [Group](../group/README.md) — a sheet of rows for settings pages.
- [EmptyState](../empty-state/README.md) — the sunken counterpart for an empty area.
