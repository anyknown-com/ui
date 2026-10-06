# Tooltip

A small floating hint that appears after 400ms of hover or at once on keyboard focus, with one line of text and an optional shortcut, built on Base UI Tooltip.

## When to use

- Naming an icon-only control, or adding a short hint to a control that already has a name.
- Showing a keyboard shortcut next to the hint (`shortcut`, usually a `KbdGroup`).

## When not to use

- For anything interactive (links, buttons), use [Popover](../popover/README.md). A tooltip never holds interactive content.
- For information the user must read to finish a task, put it in the page or in a [Field](../label/README.md) `help`.
- For an icon button, use [IconButton](../icon-button/README.md), which already includes its tooltip.

## Usage

```tsx
import { Button, KbdGroup, Tooltip } from "@anyknown/ui"

<Tooltip content="Generate a handoff summary" shortcut={<KbdGroup keys={["⌘", "⇧", "H"]} />}>
  <Button variant="secondary">Start handoff</Button>
</Tooltip>
```

Props: `content`, `shortcut`, `side` (`"top"` default), `align` (`"center"` default), `delay` (hover delay, 400ms default), `disabled` (renders the child untouched). `TooltipProvider` (Base UI Tooltip.Provider) can wrap a region so that, after one tooltip opens, moving to a neighboring trigger opens the next at once.

## Accessibility

- Base UI Tooltip: the child element becomes the trigger. The popup has `role="tooltip"`, and the trigger gets `aria-describedby` pointing at it only while it is open, so the reference never points at a missing element.
- The tooltip describes; it does not name. An icon-only trigger still needs its own accessible name (`aria-label`, or IconButton's `label`).
- The child must be one focusable element, so keyboard users can open the tooltip by focusing it.
- The tooltip has no built-in words; `content` is yours, so nothing here follows `<LocaleProvider>`.
- It sits above dialogs and popovers.
- Under `prefers-reduced-motion: reduce` the hover delay is 0 and the fade-in is off.
- A transparent border keeps an edge in forced-colors mode.

## Keyboard

Base UI Tooltip handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> to the trigger | Focusing the trigger shows the tooltip at once (no delay). |
| <kbd>Tab</kbd> away | Hides the tooltip. |
| <kbd>Escape</kbd> | Hides the tooltip; focus stays on the trigger. |

## Related

- [IconButton](../icon-button/README.md) — an icon button with a built-in tooltip.
- [Popover](../popover/README.md) — for interactive anchored content.
- [Kbd](../kbd/README.md) — for the shortcut hint.
