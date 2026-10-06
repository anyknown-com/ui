# Switch

An on/off toggle that takes effect immediately, built on a native checkbox with `role="switch"`.

## When to use

- A setting that applies as soon as it is flipped ("Launch at login").
- Settings rows: text on the left, the switch on the right.

## When not to use

- For an option saved with a form submit, use [Checkbox](../checkbox/README.md).
- For a choice between two named modes, use [Segmented](../segmented/README.md).

## Usage

```tsx
import { Switch } from "@anyknown/ui"

<Switch
  label="Voice wake"
  description="Say “Anyknown” to start a conversation."
  checked={voiceWake}
  onCheckedChange={setVoiceWake}
/>
```

It works controlled (`checked` + `onCheckedChange`) or uncontrolled (`defaultChecked`, with `onCheckedChange` to listen). The native `onChange` is still called.

## Accessibility

- Renders a native `<input type="checkbox" role="switch">` with `aria-checked`, visually transparent over the track, inside a `<label>`. The thumb is `aria-hidden`.
- Accessible name: `label`, through `aria-labelledby`. Without `label`, pass `aria-label`.
- `description` is added to `aria-describedby`, before any Field help or error.
- `aria-invalid="true"` comes from `aria-invalid` or a Field `error`.
- Inside a [Field](../label/README.md), give only `help`, `error` or `disabled`.
- Focus ring: a 2px `focusRing` outline 3px outside the track when the input has `:focus-visible` (`Highlight` under forced colors).
- Under `forced-colors: active` the track gets a `ButtonText` frame; on is a `Highlight` track with a `HighlightText` thumb; disabled draws in `GrayText`.
- The thumb moves with `inset-inline-start`, so it follows `dir="rtl"`.
- The track and thumb transitions (180ms) are instant under `prefers-reduced-motion: reduce`.
- Disabled: the whole row dims to 50% and shows `not-allowed`.
- The track is drawn 22.4px tall, but the transparent native input over it is at least 24px tall, so the target meets 24px even without `label`. With a label the whole row is also clickable.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Toggles the switch (native checkbox). |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus in and out. |

## Related

- [Checkbox](../checkbox/README.md) — for options applied on submit.
- [SettingsRows](../settings-rows/README.md) — the label-left, control-right settings layout.
