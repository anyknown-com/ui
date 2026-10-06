# RecoveryKey

The card that shows a vault's recovery key once, when the vault is created or the key is reissued. The key is blurred until revealed, with copy, download, a warning, and an "I have written it down" checkbox.

## When to use

- The one moment a recovery key is shown and must be saved somewhere outside the app.
- Making the person confirm that they saved it before they can go on. Read `ack` and use it to enable your own continue button.

## When not to use

- To enter or confirm a passphrase, use [PasswordInput](../password-input/README.md).
- To show a secret again later, such as an API key the person can copy at any time, use [SettingsRows](../settings-rows/README.md)' `SettingsValue` or a [CodeBlock](../code-block/README.md).

## Usage

```tsx
import { Button, RecoveryKey } from "@anyknown/ui"

const [saved, setSaved] = useState(false)

<RecoveryKey value={recoveryKey} ack={saved} onAckChange={setSaved} />
<Button disabled={!saved} onClick={finishSetup}>
  Continue
</Button>
```

The key is split on `-` and shown in mono groups. Copy writes the full key with its dashes. Download saves `filename` (default `anyknown-storage-recovery-key.txt`). The card has no primary button of its own, so you must check `ack` before letting the person continue.

## Accessibility

- The key is plain text, so screen readers can read it even while it is blurred. The blur and the "hover to reveal" veil are only visual, and the veil is `aria-hidden`.
- Reveal is a native button with `aria-pressed`. Its text switches between `revealLabel` and `hideLabel`. The key also shows on pointer hover.
- Copy and download are native buttons, and their icons are `aria-hidden`. After a copy, the button text changes to `copiedLabel` for 2 seconds. This change is not announced in a live region.
- The warning is `role="note"`.
- The acknowledgement is a [Checkbox](../checkbox/README.md) labeled by `ackLabel`.
- With `prefers-reduced-motion: reduce`, the blur and button transitions are instant.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. Change them with `intro`, `warning`, `ackLabel`, `revealLabel`, `hideLabel`, `veilLabel`, `copyLabel`, `copiedLabel` and `downloadLabel`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves through reveal, copy, download and the checkbox. The key area itself is not focusable. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates reveal, copy or download (native `<button>`). |
| <kbd>Space</kbd> | Toggles the acknowledgement checkbox. |

## Related

- [PasswordInput](../password-input/README.md) — the passphrase this key backs up.
- [Checkbox](../checkbox/README.md) — the acknowledgement control.
- [Dialog](../dialog/README.md) — a modal step that can hold this card.
