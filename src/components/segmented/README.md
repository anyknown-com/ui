# Segmented

A row of a few short words on a sunken track, where the chosen one is a raised sheet; each word is a pressed/unpressed button.

## When to use

- Switching a view or mode between two to four short options ("List" / "Grid").
- A compact filter or state picker inside a toolbar or settings row.

## When not to use

- For switching between content panels, use [Tabs](../tabs/README.md).
- For a form choice with descriptions, use [RadioGroup](../radio/README.md).
- For a single on/off setting, use [Switch](../switch/README.md).

## Usage

```tsx
import { useState } from "react"
import { Segmented } from "@anyknown/ui"

const [view, setView] = useState<"list" | "grid">("list")

<Segmented
  label="View"
  value={view}
  onChange={setView}
  options={[
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
  ]}
/>
```

Segmented is always controlled: `value`, `options`, `onChange` and `label` are required.

## Accessibility

- Renders a `<div>` holding one native `<button type="button">` per option. Each button's name is its `label`; the chosen one has `aria-pressed="true"`, the rest `aria-pressed="false"`.
- `label` (required) is set as `aria-label` on the wrapping `<div>`.
- Known gap: the wrapper has no role, so many screen readers ignore its `aria-label`; the group name may not be announced.
- Focus ring: a 2px `focusRing` outline inset 2px on `:focus-visible`.
- Buttons shrink to 0.98 on press (shared `press.button`).
- On phones each button is 40px tall and the track scrolls sideways when it does not fit.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between the buttons; each one is a tab stop. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Chooses the focused option (native `<button>`). |

There is no arrow-key navigation.

## Related

- [Tabs](../tabs/README.md) — the `pills` variant shares this look but switches panels.
- [RadioGroup](../radio/README.md) — for form choices.
- [Switch](../switch/README.md) — for one on/off setting.
