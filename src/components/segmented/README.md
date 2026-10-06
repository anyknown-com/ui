# Segmented

A row of a few short words on a sunken track, where the chosen one is a raised sheet: a radio group drawn as a segmented control.

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
  onValueChange={setView}
  options={[
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board", disabled: true },
  ]}
/>

<Segmented label="Theme" defaultValue="auto" options={themes} />
```

It works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`, which defaults to the first option). `onChange` is deprecated: use `onValueChange` (both are called with the same value). `options` and `label` are required. `disabled` turns off the whole group; `options[].disabled` turns off one option.

## Accessibility

- Renders a `<div role="radiogroup">` named by `label` (`aria-label`). Each option is a native `<button type="button" role="radio">` with `aria-checked`; its name is its `label`.
- Roving tabindex: only the checked option is a tab stop (or the first enabled option when none is checked or the checked one is disabled).
- A disabled option is a native `disabled` button, so it takes no focus and the arrow keys skip it. With `disabled` on the group, every option is disabled, the group gets `aria-disabled="true"`, and Tab skips it.
- Focus ring: a 2px `focusRing` outline inset 2px on `:focus-visible`.
- Under `forced-colors: active` the checked option fills with `Highlight` and `HighlightText` words (its focus ring is `HighlightText`); disabled options draw in `GrayText`.
- Each option is 28px tall (40px on phones), above the 24px minimum target. On phones the track scrolls sideways when it does not fit.
- Options shrink to 0.98 on press (shared `press.button`); no scale and no transition under `prefers-reduced-motion: reduce`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus into the group (to the checked option) and out of it. |
| <kbd>→</kbd> / <kbd>↓</kbd> | Moves focus to the next enabled option and checks it; wraps from last to first. |
| <kbd>←</kbd> / <kbd>↑</kbd> | Moves focus to the previous enabled option and checks it; wraps from first to last. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Moves focus to the first / last enabled option and checks it. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Checks the focused option (native `<button>`). |

In a right-to-left context (computed `direction: rtl`), <kbd>←</kbd> and <kbd>→</kbd> swap so they follow the visual order; <kbd>↑</kbd> and <kbd>↓</kbd> do not change.

## Related

- [Tabs](../tabs/README.md) — the `pills` variant shares this look but switches panels.
- [RadioGroup](../radio/README.md) — for form choices.
- [Switch](../switch/README.md) — for one on/off setting.
