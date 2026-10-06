# Label

`Label` is a form label with required and optional markers; `Field` wraps one control with its label, help text and error, and wires them together.

## When to use

- `Field` for almost every form control: it connects `for`, `aria-describedby`, `aria-invalid`, `required` and `disabled` for you.
- `Label` alone when the label and the control live in different places and you connect them with `htmlFor`.
- `help` for requirements the user must read before typing (not the placeholder).

## When not to use

- For a group of radios, use the `legend` of [RadioGroup](../radio/README.md), not a Field label.
- For [Checkbox](../checkbox/README.md) and [Switch](../switch/README.md), use their own `label`. Inside a Field, give them only `help`, `error` or `disabled`.
- For a section heading in a settings page, use [SettingsRows](../settings-rows/README.md).

## Usage

```tsx
import { Field, Input } from "@anyknown/ui"

<Field label="Email" required error={emailError} help="We never send marketing email.">
  <Input type="email" />
</Field>
```

```tsx
import { Input, Label } from "@anyknown/ui"

<Label htmlFor="display-name" optional optionalLabel="optional">Display name</Label>
<Input id="display-name" />
```

## Accessibility

- `Label` renders a native `<label>`. The required `*` is `aria-hidden="true"`; the requirement is announced by the control's native `required`, which `Field` sets.
- The optional marker is visible text. Its word comes from `optionalLabel` (default `選填`); it does not follow `<LocaleProvider>`.
- `Field` renders a `<div>` with the `Label` (`htmlFor` = the control id), the child, the error and the help.
- `Field` owns the control `id`: a caller `id` on the child is ignored, so put exactly one control in a Field.
- The control gets `aria-describedby` pointing at the error then the help, `aria-invalid="true"` when `error` is set, and `required` / `disabled` from the Field (a prop on the control wins).
- The error is a `<p role="alert">`, so it is announced when it appears.
- The whole Field dims to 50% when its control is disabled.
- Controls that read the Field: Input, Textarea, Checkbox, Switch, PasswordInput. Radio reads `aria-describedby` and `disabled` but not the `id`. Select and Slider do not read the Field; give them their own `aria-label` or `label`.

## Keyboard

No keyboard interaction of its own. The Field contains one focusable control; see that control's README.

## Related

- [Input](../input/README.md) — the most common child of a Field.
- [RadioGroup](../radio/README.md) — groups radios under a `fieldset` and `legend`.
- [Checkbox](../checkbox/README.md) — carries its own label.
