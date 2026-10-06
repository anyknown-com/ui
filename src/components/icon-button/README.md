# IconButton

A round button that holds one glyph and shows its name in a tooltip, for toolbars, sidebars and other tight chrome.

## When to use

- A toolbar or sidebar action where a glyph is enough and the name can live in a tooltip.
- A navigation button that stands for a page (`current` sets `aria-current="page"`).
- A button that owns a popover or a toggled mode and should look held down while it is open (`open`).
- A glyph with a small count in its corner (`badge`).

## When not to use

- For an action that needs a visible word, use [Button](../button/README.md).
- For an icon-only button inside a row of sized pill buttons, use [Button](../button/README.md) with `icon`.
- For a set of mutually exclusive options, use [Segmented](../segmented/README.md).

## Usage

```tsx
import { IconButton } from "@anyknown/ui"

<IconButton label="New thread" side="bottom" onClick={newThread}>
  <PlusIcon aria-hidden="true" />
</IconButton>
```

Sizes are 36 / 32 / 28 px for `md` / `sm` / `xs` (default `md`). `side` places the tooltip (default `right`). `badge` shows a count when it is above 0. All other `<button>` props pass through except `type`, which is always `button`.

## Accessibility

- Renders a native `<button type="button">`. `label` is required: it becomes the `aria-label` and the tooltip text.
- The tooltip is the [Tooltip](../tooltip/README.md) component (Base UI Tooltip). It links itself with `aria-describedby` while open, and opens without delay under `prefers-reduced-motion`.
- `current` sets `aria-current="page"`.
- `open` only changes the look (an ink wash) and removes the tooltip. It does not set `aria-expanded` or `aria-pressed`; pass the one that fits (a popover trigger usually sets `aria-expanded` for you).
- The `badge` count is not part of the accessible name, because `aria-label` replaces the content. If the count matters, put it in `label` (for example "Inbox, 3 unread").
- Every size is at least 28 px across, above the 24 px minimum target.
- Focus ring: a 2 px `focusRing` outline, offset 2 px, on `:focus-visible`. Pressing scales to 0.98; no scale and no transition under reduced motion.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the button; the tooltip shows on focus (Base UI Tooltip). |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the button (native `<button>`). |
| <kbd>Esc</kbd> | Closes the tooltip (Base UI Tooltip). |

## Related

- [Tooltip](../tooltip/README.md) — what shows the name.
- [Button](../button/README.md) — when the action needs a visible label.
- [Popover](../popover/README.md) — what an `open` icon button usually owns.
- [Icon](../icon/README.md) — sizes and stroke for the glyph inside.
