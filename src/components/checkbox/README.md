# Checkbox

A native checkbox with a drawn box and tick, for an on/off choice that takes effect when the form is submitted.

## When to use

- An option inside a form that is saved with the form ("Remember this device").
- Several independent options, any number of which can be on.
- A "select all" parent whose children are partly selected (`indeterminate`).

## When not to use

- For a setting that takes effect at once, use [Switch](../switch/README.md).
- For exactly one choice out of several, use [Radio](../radio/README.md).
- For a toggle inside a menu, use [DropdownMenu](../dropdown/README.md)'s `DropdownCheckboxItem`.

## Usage

```tsx
import { Checkbox } from "@anyknown/ui"

<Checkbox
  label="Notify me at every handoff"
  description="You get a desktop notification each time."
  checked={notify}
  onCheckedChange={setNotify}
/>
```

It works controlled (`checked` + `onCheckedChange`) or uncontrolled (`defaultChecked`). The native `onChange` is still called.

## Accessibility

- Renders a native `<input type="checkbox">`, visually transparent and placed over the drawn box, inside a `<label>`. The tick SVG is `aria-hidden`.
- Accessible name: `label`, through `aria-labelledby`. Without `label`, pass `aria-label`.
- `description` is added to `aria-describedby`, before any Field help or error.
- `indeterminate` is written to the native element's `indeterminate` property, so assistive technology reports "mixed".
- `aria-invalid="true"` comes from `aria-invalid` or a Field `error`; the box border turns `danger`.
- Inside a [Field](../label/README.md), give only `help`, `error` or `disabled`; the Checkbox already has its own label.
- Focus ring: a 2px `focusRing` outline around the box when the input has `:focus-visible`.
- The tick draw (160ms) and color transitions are instant under `prefers-reduced-motion: reduce`.
- Disabled: the whole row dims to 50% and shows `not-allowed`.
- Known gap (A11Y-DEBT): without `label` the hit area is 16.8px, below 24px. With a label the whole label row is the hit area.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Toggles the checkbox (native checkbox). |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus in and out. |

## Related

- [Switch](../switch/README.md) — for settings that apply immediately.
- [Radio](../radio/README.md) — for one choice out of several.
- [Label](../label/README.md) — `Field` adds help and error text.
