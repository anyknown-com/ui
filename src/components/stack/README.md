# Stack

A flex layout with a token gap. Space is the only separator: no line, no fill, no card. The family exports:

- `Stack` — children in a `column` (default) or a `row` that wraps when it gets narrow. `gap` is `sm` (4px), `md` (12px, default) or `lg` (24px): the three steps of the tight density.

## When to use

- Setting parts of one block apart by space: a title, a paragraph and a stat row.
- A row of short items (a row of `Stat`) that should drop to the next line on a narrow screen.

## When not to use

- For a list of rows you tap or select, use [Group](../group/README.md).
- For data in columns that must line up, use [Table](../table/README.md).
- For a page frame with a title and width, use [Page](../page/README.md).

## Usage

```tsx
import { Stack } from "@anyknown/ui"

<Stack gap="lg">
  <Text as="h3" variant="title">This week</Text>
  <Stack direction="row" gap="lg">
    <Stat label="Runs" value="42" />
    <Stat label="Spend" value="$3.10" />
  </Stack>
</Stack>
```

`direction="row"` aligns children on their first text baseline and wraps; each child keeps its own width. `sx` merges StyleX styles after the component's own.

## Accessibility

- `Stack` is a `<div>` with no role, so it adds nothing for a screen reader; the DOM order is the reading order. Do not use `row` to reorder content visually.
- Pass `role="group"` and `aria-label` through when the children form a named set.
- A wrapping row keeps all its content on screen at 375px wide and at 200% zoom: nothing scrolls sideways.

## Related

- [Stat](../stat/README.md) — a number with a label, often placed in a row `Stack`.
