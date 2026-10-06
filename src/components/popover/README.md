# Popover

A floating card anchored to a trigger, built on Base UI Popover, for rich content such as memory details or a member card.

## When to use

- Details about an object that the user opens on demand and dismisses by clicking away.
- Small interactive content next to its trigger: a couple of buttons, a short form.

## When not to use

- For a one-line hint on hover or focus, use [Tooltip](../tooltip/README.md).
- For a list of actions, use [DropdownMenu](../dropdown/README.md).
- For a task that must be finished or cancelled before going on, use [Dialog](../dialog/README.md).

## Usage

```tsx
import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@anyknown/ui"

<Popover>
  <PopoverTrigger>
    <Button variant="secondary">Deploys go through Cloudflare</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" titled>
    <PopoverTitle>Deploys go through Cloudflare</PopoverTitle>
    <PopoverDescription>Written by the handoff on 2026-08-12.</PopoverDescription>
    <Button size="sm" variant="secondary" onClick={edit}>Edit</Button>
  </PopoverContent>
</Popover>
```

The family is `Popover` (root; `open` / `defaultOpen` / `onOpenChange`, `modal`), `PopoverTrigger`, `PopoverContent` (`side`, `align`, `sideOffset`), `PopoverTitle`, `PopoverDescription` and `PopoverClose`.

## Accessibility

- Base UI Popover: the trigger gets `aria-expanded`; the popup is `role="dialog"`, labelled by `PopoverTitle` and described by `PopoverDescription`.
- The popup needs a name, and the types enforce it: pass `aria-label="…"` to `PopoverContent`, or pass `titled` and render a `PopoverTitle` inside.
- `PopoverTrigger` and `PopoverClose` render their single child element; it must be focusable and have its own name.
- Focus moves into the popup when it opens. Escape and a click outside close it, and focus returns to the trigger.
- The popup is portalled to `document.body` and sits above dialogs, so a Popover inside a Dialog is not hidden.
- The grow-in and fade-out are off under `prefers-reduced-motion: reduce`. A transparent border keeps an edge in forced-colors mode.
- Width is capped at `min(22rem, 100vw − 2rem)`, so long text wraps on narrow screens.

## Keyboard

Base UI Popover handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger | Opens the popover (native `<button>`) and moves focus into it. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the content. |
| <kbd>Escape</kbd> | Closes the popover and returns focus to the trigger. |

## Related

- [Tooltip](../tooltip/README.md) — for a non-interactive hint.
- [DropdownMenu](../dropdown/README.md) and [Select](../select/README.md) — share the same floating surface.
- [Dialog](../dialog/README.md) — for modal tasks.
