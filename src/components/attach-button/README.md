# AttachButton

A 36px round `+` button for a chatbox that opens the system file picker and hands back the files chosen.

## When to use

- Letting a person attach files to the next message from a chatbox toolbar.
- Pairing with [PendingFiles](../pending-files/README.md) to show what is attached before sending.

## When not to use

- For a drag-and-drop area with upload progress, use [Dropzone](../dropzone/README.md).
- For a text button that opens a picker in a form, use [Button](../button/README.md) with your own `<input type="file">`.

## Usage

```tsx
import { AttachButton, PendingFiles } from "@anyknown/ui"

<AttachButton
  accept="image/*,application/pdf"
  onFiles={(picked) => setFiles((now) => [...now, ...picked.map(toPendingFile)])}
/>
<PendingFiles files={files} onRemove={(id) => setFiles((now) => now.filter((f) => f.id !== id))} />
```

`multiple` defaults to `true`. After each pick the input is cleared, so choosing the same file again fires `onFiles` again.

## Accessibility

- The control is an [IconButton](../icon-button/README.md): a native `<button>` whose `aria-label` and tooltip are `label` (default "附加檔案"). 2px focus ring.
- The real `<input type="file">` is `hidden` and `tabIndex={-1}`; keyboard and screen reader users only meet the button.
- `disabled` disables both the button and the input.
- No motion of its own.
- The built-in word is a fixed Chinese default and does not follow `<LocaleProvider>`; pass `label`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Opens the file picker (native `<button>`). |

The tooltip opens on keyboard focus (Base UI Tooltip).

## Related

- [PendingFiles](../pending-files/README.md) — the chips for picked files.
- [Dropzone](../dropzone/README.md) — a full drop area with an upload list.
- [Composer](../composer/README.md) — the prompt bar a chatbox is built around.
