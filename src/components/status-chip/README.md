# StatusChip

A mono word, told apart by its colour alone (no fill, frame or ring), that marks what a tool call does or how it went, keyed by a one-letter status code. The folder also exports `Pill`, the mono words (with an optional 6 px dot) a fold's first line is made of.

- `StatusChip` variants: `r` read-only, `w` writes, `n` unmarked and `plain` (the catalogue's auth word) in `textMuted`, `d` destructive (`danger`), `a` active (`signal`, with a spinning ring), `f` failed (`danger` and a 6 px dot).
- `Pill` takes an optional `status` dot (`live`, `paused`, `done`) and `title` for the sub thread's name, which uses the body face and truncates.

## When to use

- Labeling a tool in a tool card or catalogue by what it may do (`r`, `w`, `d`, `n`).
- Showing a tool call that is running (`a`) or has failed (`f`).
- Building the first line of a fold: counts, durations and the sub thread's name (`Pill`).

## When not to use

- For the running state at the head of a screen the AI drives, use [StatusBadge](../status-badge/README.md).
- For a general label or a removable filter, use [Badge](../badge/README.md).

## Usage

```tsx
import { Pill, StatusChip } from "@anyknown/ui"

<StatusChip variant="r">read</StatusChip>
<StatusChip variant="a">running</StatusChip>
<StatusChip variant="f">failed</StatusChip>

<Pill status="live">3 tools</Pill>
<Pill title>Refactor the session loop</Pill>
```

## Accessibility

- Both render a `<span>` with no role; the children are the only thing a screen reader hears.
- The variant's meaning (destructive, active, failed) is shown by color, the spinning ring and the dot, all of which are hidden from assistive technology (`Spin` and the dot are `aria-hidden`). Write the meaning in `children`.
- `Pill`'s `status` dot is `aria-hidden` too; include "paused" or "done" in the text if the state matters.
- `Pill` with `title` and a string child sets the native `title` attribute, so the full name is available when it truncates.
- The `a` ring stops turning under `prefers-reduced-motion: reduce`.

## Keyboard

No keyboard interaction of its own.

## Related

- [Spin](../spin/README.md) — the ring inside an active chip.
- [StatusBadge](../status-badge/README.md) — the larger live state word.
- [Badge](../badge/README.md) — general labels and filter chips.
- [ToolGroup](../tool-group/README.md) and [SubThreadRow](../sub-thread/README.md) — the library's own tool call and sub agent display.
