# Radio

`Radio` is a native radio button with a drawn dot; `RadioGroup` holds a set of them under a `fieldset` and `legend` and owns the selected value.

## When to use

- Exactly one choice out of two to about six options that should all stay visible.
- Options that need a sentence of explanation each (`description`).
- A choice between plans or sources shown as selectable cards (`variant="card"`).

## When not to use

- For many options, or options that need search, use [Select](../select/README.md).
- For a compact view or mode switch of a few words, use [Segmented](../segmented/README.md).
- For a continuous amount, use [Slider](../slider/README.md).

## Usage

```tsx
import { Radio, RadioGroup } from "@anyknown/ui"

<RadioGroup legend="Handoff threshold" value={threshold} onValueChange={setThreshold}>
  <Radio value="50" label="50% (recommended)" description="Hands off at half the context." />
  <Radio value="75" label="75%" />
  <Radio value="90" label="90%" />
</RadioGroup>
```

`RadioGroup` works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). A `Radio` outside a `RadioGroup` throws.

## Accessibility

- `RadioGroup` renders a native `<fieldset>`; `legend` becomes the group's accessible name. Pass a `legend` (or an `aria-label` on the group).
- Each `Radio` renders a native `<input type="radio">`, visually transparent over the drawn dot, inside a `<label>`. The dot is `aria-hidden`.
- All radios share one `name` (the `name` prop, or a generated id), so the browser treats them as one group.
- Accessible name of each radio: `label`, through `aria-labelledby`; without `label`, pass `aria-label`. `description` goes into `aria-describedby`.
- `disabled` on the group disables the `fieldset`, which disables every radio.
- Inside a [Field](../label/README.md), a Radio takes the Field's `aria-describedby` and `disabled` but not its `id`, so a Field `label` does not name it. Use `legend` instead.
- Focus ring: a 2px `focusRing` outline around the dot when the input has `:focus-visible`.
- The dot scale (160ms) and color transitions are instant under `prefers-reduced-motion: reduce`.
- `variant="card"` marks the selected card with an ink border and `accentSubtle` fill; the native checked state carries the meaning.
- Known gap (A11Y-DEBT): without `label` the hit area is 16.8px, below 24px.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the group (to the checked radio) and out of it (native radio group). |
| <kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>←</kbd> / <kbd>→</kbd> | Moves to the previous or next radio and selects it. |
| <kbd>Space</kbd> | Selects the focused radio when none is selected. |

## Related

- [Select](../select/README.md) — for long lists of options.
- [Segmented](../segmented/README.md) — a compact pressed-button group.
- [Checkbox](../checkbox/README.md) — for independent on/off options.
