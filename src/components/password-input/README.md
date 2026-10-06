# PasswordInput

A password or vault passphrase field with a show/hide toggle, an optional four-bar strength meter, a Caps Lock warning and a "does not match" check for confirm fields.

## When to use

- Creating or entering a password or vault passphrase.
- A confirm field that must match the first entry (`confirmOf`).
- Showing strength while the user types a new passphrase (`meter`).

## When not to use

- For a recovery key the user must copy and keep, use [RecoveryKey](../recovery-key/README.md).
- For a non-secret field, use [Input](../input/README.md).

## Usage

```tsx
import { Field, PasswordInput } from "@anyknown/ui"

<Field label="Vault passphrase" help="At least 12 characters. A lost passphrase cannot be recovered.">
  <PasswordInput meter value={passphrase} onValueChange={setPassphrase} />
</Field>
<Field label="Repeat the passphrase">
  <PasswordInput confirmOf={passphrase} mismatchLabel="Type the same passphrase again." />
</Field>
```

It works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). `scorer` replaces the default scoring (`defaultScorer`, also exported: length thresholds 8 / 12 / 20 times character classes, returning 0–4). `autoComplete` defaults to `"new-password"`; pass `"current-password"` on a sign-in form.

## Accessibility

- Renders a native `<input>` (`type="password"`, or `"text"` while revealed) with the Input styling, and a native toggle `<button>`.
- The accessible name comes from the caller: a [Field](../label/README.md) `label` or `aria-label`. Inside a Field, the Field's id, help and error are wired in.
- Toggle button: named by `showLabel` / `hideLabel`, with `aria-pressed`. After toggling, focus goes back to the field. A visually hidden `role="status"` says `shownStatus` when the text is revealed.
- Meter: the bars are `aria-hidden`; the level text is `aria-live="polite"` and is in the field's `aria-describedby`.
- Caps Lock: a `role="status"` region, mounted from the start, shows `capsLockLabel` while Caps Lock is on; it clears on blur. Set `capsLockWarning={false}` to turn it off.
- Confirm field: once something is typed and it differs from `confirmOf`, `aria-invalid="true"` is set and `mismatchLabel` is shown and added to `aria-describedby`.
- Paste is not blocked.
- Put requirements in the Field `help`, not the placeholder.
- Built-in words are Traditional Chinese defaults and do not follow `<LocaleProvider>`. Override them with `levelLabels`, `capsLockLabel`, `mismatchLabel`, `showLabel`, `hideLabel` and `shownStatus`.
- The meter transition is off under `prefers-reduced-motion: reduce`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves from the field to the show/hide button and on. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the toggle | Shows or hides the text (native `<button>`), then focus returns to the field. |
| <kbd>Caps Lock</kbd> | Its state is read on every key press and release in the field. |

## Related

- [Input](../input/README.md) — the plain field this one shares its styling with.
- [RecoveryKey](../recovery-key/README.md) — for showing a key once.
- [Label](../label/README.md) — `Field` holds the requirement text.
