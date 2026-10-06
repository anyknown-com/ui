# Input

A single-line text field drawn as a sunken cell on the page, with the same border, focus and error styling as Textarea, Select and PasswordInput.

## When to use

- Short free text: a name, an email, a URL, a search query.
- Keys, ids and URLs that people read character by character (`mono`).
- A search box with a leading icon (`leadingIcon`).

## When not to use

- For more than one line, use [Textarea](../textarea/README.md).
- For a password or vault passphrase, use [PasswordInput](../password-input/README.md).
- For a choice from a known list, use [Select](../select/README.md).

## Usage

```tsx
import { Field, Input } from "@anyknown/ui"

<Field label="Workspace name" help="You can change this later in settings.">
  <Input value={name} onValueChange={setName} placeholder="e.g. anyknown" />
</Field>

<Input defaultValue="anyknown" onValueChange={save} aria-label="Workspace" />
```

`value` / `defaultValue` work as on a native input. `onValueChange` gets the new string on every edit and runs after the native `onChange`, which still fires. `size` is `"md"` (40px, default) or `"sm"` (32px), matching the Button heights.

## Accessibility

- Renders a native `<input>` and forwards every native prop.
- The accessible name comes from the caller: wrap it in a [Field](../label/README.md) with `label`, point a `Label` at it with `htmlFor`, or pass `aria-label`. Nothing is built in.
- Inside a Field, the Field owns the `id` (a caller `id` is ignored) and supplies `aria-describedby` (error, then help), `required` and `disabled`.
- `aria-invalid="true"` is set from `invalid`, from `aria-invalid`, or from a Field `error`. The border turns `danger`; the focus ring stays the same.
- `leadingIcon` is wrapped in `aria-hidden="true"` and ignores the pointer.
- Focus ring: on `:focus-visible` the border turns `focusRing` and a 2px solid `focusRing` outline sits 1px outside.
- The border-color transition is turned off under `prefers-reduced-motion: reduce`.
- On phones the font is 16px so iOS Safari does not zoom the page on focus.
- The placeholder uses `textMuted` (at least 4.5:1). It is still not a label: put requirements in the Field `help`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus in and out (native `<input>`). |
| Text editing keys | Native text input behavior; the component adds no handlers. |

## Related

- [Label](../label/README.md) — `Field` wires the label, help and error to the input.
- [Textarea](../textarea/README.md) — the multi-line version with the same styling.
- [PasswordInput](../password-input/README.md) — masked input with a reveal toggle and a strength meter.
