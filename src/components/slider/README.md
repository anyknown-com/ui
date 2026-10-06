# Slider

A horizontal control for one continuous amount, such as how much the agent thinks or a threshold, with no tick marks.

## When to use

- A continuous value where the exact number matters less than "more" or "less".
- A value you want to save once per gesture (`onValueCommit`), not on every pixel of a drag.

## When not to use

- For a few discrete steps, use [RadioGroup](../radio/README.md) or [Select](../select/README.md). If it needs tick marks, it is not a Slider.
- For an exact number the user types, use [Input](../input/README.md) with `type="number"`.
- For showing progress the user does not control, use [Progress](../progress/README.md).

## Usage

```tsx
import { Slider } from "@anyknown/ui"

const effortLabel = (v: number) => (v < 0.3 ? "Low" : v < 0.6 ? "Medium" : "High")

<Slider
  label={`Thinking · ${effortLabel(effort)}`}
  value={effort}
  onChange={setEffort}
  onValueCommit={saveEffort}
  valueText={effortLabel}
/>
```

The Slider is always controlled: `value` and `onChange` are required. `min` / `max` / `step` default to 0 / 1 / 0.01; every value is clamped and snapped to `step`. `onChange` fires while the value moves. `onValueCommit` fires once when a drag ends (including `pointercancel`) and once per key press that moved the value, and never when the value did not change. Save in `onValueCommit`.

## Accessibility

- Renders a `<div role="slider">` written by hand (not Base UI) with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation="horizontal"` and, from `valueText`, `aria-valuetext`.
- Accessible name: `label` (rendered as text and linked with `aria-labelledby`) or `aria-label`. One of them is needed.
- Use `valueText` so the value is read as a word ("High"), not "0.62".
- Disabled: `aria-disabled="true"`, `tabIndex={-1}` (out of the tab order), keys and pointer ignored, 50% opacity.
- Focus ring: a 2px `focusRing` outline on `:focus-visible`.
- The fill and thumb move together (200ms ease-out); the transition is off while dragging and under `prefers-reduced-motion: reduce`.
- Pointer: pressing the track focuses the slider and captures the pointer until release.
- The Slider does not read [Field](../label/README.md) context; use its own `label`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>→</kbd> / <kbd>↑</kbd> | Increases by 5% of the range (not by `step`), then snaps. |
| <kbd>←</kbd> / <kbd>↓</kbd> | Decreases by 5% of the range, then snaps. |
| <kbd>Home</kbd> | Moves to `min`. |
| <kbd>End</kbd> | Moves to `max`. |

The value stops at the ends; it does not wrap.

## Related

- [RadioGroup](../radio/README.md) — for a few discrete choices.
- [Progress](../progress/README.md) — a read-only bar.
- [Select](../select/README.md) — for named steps.
