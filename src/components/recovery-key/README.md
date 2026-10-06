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

The key is split on `-` and shown in mono groups; the dashes are visually hidden text, so selecting the key by hand also yields them. Copy writes the full key with its dashes. Download saves the key and a newline as `filename` (default `anyknown-storage-recovery-key.txt`). The card has no primary button of its own, so you must check `ack` before letting the person continue.

`labels` (`RecoveryKeyLabels`: `intro`, `warning`, `ack`, `key`, `reveal`, `hide`, `veil`, `copy`, `copied`, `download`) overrides any built-in word. The older single-word props (`intro`, `warning`, `ackLabel`, `revealLabel`, `hideLabel`, `veilLabel`, `copyLabel`, `copiedLabel`, `downloadLabel`) still work and win over `labels`.

## Accessibility

- The key box is `role="region"`, named by `labels.key` ("復原金鑰" / "Recovery key"), with `tabIndex={0}`. Focusing it unblurs the key (like hover) and selects the whole key, dashes included, ready for the system copy shortcut.
- The key is plain text, so screen readers can read it even while it is blurred. The blur and the "hover to reveal" veil are only visual, and the veil is `aria-hidden`.
- Reveal is a native button without `aria-pressed`: its text names the next action, switching between `labels.reveal` and `labels.hide`.
- Copy and download are native buttons, and their icons are `aria-hidden`. After a copy, the button text changes to `labels.copied` for 2 seconds, and a status region that is always mounted announces it once.
- The warning is `role="note"`.
- The acknowledgement is a [Checkbox](../checkbox/README.md) labeled by `labels.ack`.
- With `prefers-reduced-motion: reduce`, the blur and button transitions are instant.
- All built-in words follow `<LocaleProvider>` (`zh-TW` without one, `en` for other locales).

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to the key box (shows and selects the key), then reveal, copy, download and the checkbox. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates reveal, copy or download (native `<button>`). |
| <kbd>Space</kbd> | Toggles the acknowledgement checkbox. |

## Related

- [PasswordInput](../password-input/README.md) — the passphrase this key backs up.
- [Checkbox](../checkbox/README.md) — the acknowledgement control.
- [Dialog](../dialog/README.md) — a modal step that can hold this card.
