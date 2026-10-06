# Dropzone

A drop area for uploading files, with a "Choose files" button so dragging is never the only way in, and an `UploadList` that shows each file's progress or failure.

## When to use

- A page or dialog whose main job is adding files to storage.
- Checking size, type and count before the upload starts (`maxSize`, `accept`, `multiple`), and telling the person what was turned away.
- Showing in-flight uploads with progress and a cancel button (`UploadList`).

## When not to use

- To attach files to a message in the composer, use [AttachButton](../attach-button/README.md) and [PendingFiles](../pending-files/README.md).
- For files that are already stored, use [FileRow](../file-row/README.md).

## Usage

The family:

- `Dropzone` — the drop area. It calls `onFiles` with the files that pass and `onReject` with a `Rejection` (`file`, `reason`: `"size"`, `"type"` or `"count"`) for each one that does not. It checks dropped files too, because a drop skips the input's own `accept` and `multiple`.
- `UploadList` — one row per `UploadJob` (`queued`, `encrypting`, `uploading`, `done`, `failed`), with a pill progress bar and a cancel button.

```tsx
import { Dropzone, UploadList, type UploadJob } from "@anyknown/ui"

const MAX = 10 * 1024 * 1024

<Dropzone
  maxSize={MAX}
  accept="image/*,.pdf"
  onFiles={(files) => startUploads(files)}
  onReject={(rejections) =>
    addJobs(
      rejections.map(({ file, reason }): UploadJob => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        state: "failed",
        limit: reason === "size" ? MAX : undefined,
      })),
    )
  }
/>
<UploadList jobs={jobs} onCancel={cancelUpload} />
```

A failed row says why. With `error` it uses your words. With `limit` it names the limit ("超過 10 MB 上限…"), not the file's size. Otherwise it uses a general "try again" sentence.

## Accessibility

- The drop area is a plain `<div>` with no role and no focus. The way in for keyboard and screen-reader users is the native "Choose files" button (`pickLabel`). It opens a hidden file input that is `aria-hidden` and `tabIndex={-1}`.
- The upload icon and the dashed outline are `aria-hidden`. `disabled` disables the button and ignores drops.
- On drag-over, the dashed outline moves. Under `prefers-reduced-motion: reduce`, it is still and the color transitions are instant.
- `UploadList` is a `<ul>` named by `label` (default "上傳中的檔案"). A separate, visually hidden `role="status"` paragraph announces "name: state" for each job. It holds no buttons, so cancel buttons do not leak out of an open modal.
- Each cancel button is named "取消上傳 {name}". Progress is a `progressbar` with `aria-valuetext` "{name} {state} N%".
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. Use `title`, `hint`, `pickLabel` and `label` to change some, and `UploadJob.error` for a failure. The state words and the cancel label cannot be changed today.
- Known gap (A11Y-DEBT): the cancel button hit area is 22.4px.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to "Choose files", then to each cancel button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On "Choose files": opens the system file picker. On a cancel button: cancels that upload. |

Dropping needs a pointer. The button covers the same function.

## Related

- [FileRow](../file-row/README.md) — the stored files the uploads become.
- [AttachButton](../attach-button/README.md) — picking files for a message.
- [Progress](../progress/README.md) — progress outside an upload list.
