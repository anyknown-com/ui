# Stat

A big number with a small grey label above it and an optional one-line note below. No card, fill or line: size, weight and one grey carry the order. The family exports:

- `Stat` — `label`, `value` and optional `note`. The value is 22px at weight 600 with tabular figures.

## When to use

- A conclusion-level number the reader decides on: a ratio, a delta, what is left.
- A short row of at most four numbers, placed in a row [Stack](../stack/README.md).

## When not to use

- For numbers that are compared against each other, use [Table](../table/README.md); a stat row invites no comparison.
- For a reading with a track, such as a meter or a percentage bar, use [Progress](../progress/README.md).
- For a word that marks a state, use [Badge](../badge/README.md).

## Usage

```tsx
import { Stack, Stat } from "@anyknown/ui"

<Stack direction="row" gap="lg">
  <Stat label="Runs" value="42" />
  <Stat label="Spend" value="$3.10" note="up 12% on last week" />
</Stack>
```

`value` is shown as given: it is not parsed, rounded or given thousands separators. Format it before you pass it, with the unit after one space.

## Accessibility

- `Stat` is a `<div>` of three `<span>`s with no role. A screen reader reads label, value, note in that order, so the label always names the number.
- Text is `textMuted` for the label and note and `text` for the value; both pass 4.5:1 on `bg` in light and dark.
- The note carries its meaning in words ("up 12%"), never in colour alone.
- Figures are tabular, so numbers in a row of stats keep their width when they change.

## Related

- [Stack](../stack/README.md) — lays a row of stats out and wraps it when narrow.
