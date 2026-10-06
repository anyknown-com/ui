# Badge

Small pill labels. The family exports:

- `Badge` — a read-only semantic label, with an optional status `dot` and `count`.
- `Chip` — an interactive filter unit: removable with `onRemove`, a button with `onClick`, or a toggle with `pressed` / `defaultPressed` / `onPressedChange`.

## When to use

- Marking the state or kind of an item: draft, in progress, handed off, read-only (`Badge`).
- A short mono reading such as a token count (`Badge variant="mono"`).
- An active filter the person can remove (`Chip` with `onRemove`).
- A row of filters the person turns on and off (`Chip` with `pressed` and `onPressedChange`, or `defaultPressed`).

## When not to use

- For the running state at the head of something the AI drives, use [StatusBadge](../status-badge/README.md).
- For a tool's one-letter status code, use [StatusChip](../status-chip/README.md).
- For a plain action, use [Button](../button/README.md); a chip is a filter, not a command.

## Usage

```tsx
import { Badge, Chip } from "@anyknown/ui"

<Badge variant="success">Handed off</Badge>
<Badge dot="danger">Disconnected</Badge>
<Badge variant="accent" count={3}>Waiting · </Badge>

<Chip onRemove={clearWorkspace} removeLabel="Remove filter: workspace anyknown">
  Workspace: anyknown
</Chip>
<Chip pressed={showFailed} onPressedChange={setShowFailed}>Failed 2</Chip>
<Chip defaultPressed>Mine</Chip>
```

Badge variants: `neutral` (default), `accent`, `success`, `danger`, `outline`, `mono`. Dots: `accent`, `faint`, `danger`, `warning`. `Chip` defaults to `outline`. Any of `pressed`, `defaultPressed` or `onPressedChange` makes the chip a toggle; `onClick` alone makes a plain button.

## Accessibility

- `Badge` is a `<span>` with no role; its text is the label. The `dot` is `aria-hidden`, so the text must carry the state on its own. The `count` is plain text read after the children.
- `Chip` with neither `onClick` nor a toggle prop is a `Badge`. Otherwise it is a native `<button type="button">`. A toggle chip carries `aria-pressed`; a chip with only `onClick` does not. The pressed state inverts colors, not only the hue.
- The remove control is a native `<button>` whose `aria-label` is `removeLabel`. `removeLabel` is required by the type whenever `onRemove` is given. Its hit area is 24 px through an invisible `::after`, though it looks 16 px.
- Do not give one `Chip` both `onClick` and `onRemove`: that renders a button inside a button.
- Focus ring: a 2 px `focusRing` outline on `:focus-visible` for both the chip button and the remove button.
- A pressable `Chip` does not forward `ref`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to a button chip or to a chip's remove button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggles a toggle chip, activates an `onClick` chip, or removes the chip from its remove button (native `<button>`). |

## Related

- [StatusBadge](../status-badge/README.md) — a live state pill with a breathing dot.
- [StatusChip](../status-chip/README.md) — tool status codes in a 16 px mono pill.
- [Kbd](../kbd/README.md) — for keyboard shortcuts, not labels.
