# PendingFiles

A wrapping row of outline chips, one per file picked for the next message and not sent yet, each with a `×` to take it off.

## When to use

- Showing what will be sent with the next message, next to an [AttachButton](../attach-button/README.md).
- Letting the person remove a file before sending.

## When not to use

- For uploads with progress and errors, use [Dropzone](../dropzone/README.md)'s `UploadList`.
- For files already sent in a message, use [Attachment](../attachment/README.md).
- For a file manager list with selection and actions, use [FileRow](../file-row/README.md).

## Usage

```tsx
import { PendingFiles } from "@anyknown/ui"

<PendingFiles
  files={[{ id: "1", name: "lease-draft.pdf" }, { id: "2", name: "living-room.jpg" }]}
  onRemove={(id) => setFiles((now) => now.filter((file) => file.id !== id))}
/>
```

The component keeps no state: `files` is what it shows and `onRemove(id)` asks to remove one.

## Accessibility

- A plain `<div>` of [Chip](../badge/README.md)s; there is no list role or count.
- Each chip's `×` is a native `<button>` with `aria-label` from `removeLabel(name)` (default "移除 `name`"). Its hit area is enlarged to 24px.
- Focus does not move after a chip is removed; the caller decides where it goes.
- No motion of its own.
- The built-in word is a fixed Chinese default and does not follow `<LocaleProvider>`; pass `removeLabel`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to each chip's remove button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Removes that file (native `<button>`). |

## Related

- [AttachButton](../attach-button/README.md) — picks the files.
- [Badge](../badge/README.md) — the `Chip` each file is drawn with.
- [Attachment](../attachment/README.md) — the files once sent.
