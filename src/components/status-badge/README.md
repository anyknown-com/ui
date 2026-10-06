# StatusBadge

A state pill for the head of something that runs on its own, such as a screen the AI is driving: `live` while it runs, `warn` when it needs you, `plain` when it is over.

## When to use

- Saying that the AI is operating a view right now (`live`, with a breathing [LiveDot](../live-dot/README.md)).
- Flagging that a running thing needs the person's attention (`warn`).
- Showing that the run has finished (`plain`).

## When not to use

- For a tool's status code inside a tool card, use [StatusChip](../status-chip/README.md).
- For the 22 px mono pills on a fold's first line, use `Pill` from [StatusChip](../status-chip/README.md).
- For a dot plus a word in a settings row, use `Status` from [Group](../group/README.md).
- For a general label such as "draft" or "read-only", use [Badge](../badge/README.md).

## Usage

```tsx
import { StatusBadge } from "@anyknown/ui"

<StatusBadge tone={running ? "live" : "plain"}>{running ? "AI is operating" : "Done"}</StatusBadge>
<StatusBadge tone="warn">Needs your input</StatusBadge>
```

`children` must be a string: a `live` badge also hands it to the dot as its spoken label.

## Accessibility

- A `<span>` with no role for `warn` and `plain`; the text is read in place and is not a live region.
- With `tone="live"` the badge contains a `LiveDot` with `role="status"` that carries the text in a visually hidden span, and the visible text is `aria-hidden`. A screen reader hears the state once, and again when the text changes.
- Color is never the only signal: each tone shows its state in words.
- Under `prefers-reduced-motion: reduce` the live dot stops breathing but stays visible.

## Keyboard

No keyboard interaction of its own.

## Related

- [LiveDot](../live-dot/README.md) — the breathing dot inside a live badge.
- [StatusChip](../status-chip/README.md) — tool status codes and fold pills.
- [Badge](../badge/README.md) — general read-only labels.
