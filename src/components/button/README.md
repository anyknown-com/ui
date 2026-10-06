# Button

A pill-shaped push button for an action on the page, from the one ink primary action down to a quiet ghost option.

## When to use

- The main action on a screen (`primary`, one per screen) and the actions beside it (`secondary`, `ghost`).
- An irreversible delete (`danger`, at most one per screen), or a refusal that should read as danger without the weight (`dangerGhost`).
- A round button whose whole label is one icon, inside a row of sized buttons (`icon`).

## When not to use

- For a lone glyph in a toolbar or sidebar with a tooltip name, use [IconButton](../icon-button/README.md).
- For a muted word that acts like a link in dense chrome, use [Ghost](../ghost/README.md).
- For a filter that toggles on and off, use [Badge](../badge/README.md)'s `Chip` with `onClick` and `pressed`.

## Usage

```tsx
import { Button } from "@anyknown/ui"

<Button onClick={save}>Save changes</Button>
<Button variant="secondary" size="sm" onClick={rename}>Rename</Button>
<Button variant="danger" onClick={deleteMemory}>Delete memory</Button>
```

Variants: `primary` (default), `secondary`, `ghost`, `danger`, `dangerGhost`. Sizes are 48 / 40 / 32 px for `lg` / `md` / `sm` (default `md`, the touch height); `xs` (28 px) is only for crowded toolbars. `icon` makes the button a circle whose diameter is the size's height. All other `<button>` props pass through; `sx` overrides the base styles.

## Accessibility

- Renders a native `<button>` with `type="button"` unless you pass another `type`. The label is the children.
- An `icon` button has no text, so you must pass `aria-label`. Mark the glyph inside `aria-hidden`.
- `disabled` is the native attribute: the button leaves the tab order and drops to 50% opacity.
- Focus ring: a 2 px `focusRing` outline, offset 3 px, on `:focus-visible` only.
- Pressing scales to 0.98 over 120 ms. Under `prefers-reduced-motion: reduce` it does not scale and color changes have no transition.
- There is no built-in loading state; put a [Spin](../spin/README.md) in the label and set `aria-busy` yourself if you need one.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus to the button (skipped when `disabled`). |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the button (native `<button>`). |

## Related

- [IconButton](../icon-button/README.md) — a glyph-only button with a tooltip name.
- [Ghost](../ghost/README.md) — a smaller, muted text button or link.
- [Dialog](../dialog/README.md) — where `danger` buttons usually confirm a delete.
- [Spin](../spin/README.md) — the small ring for a button that is waiting.
