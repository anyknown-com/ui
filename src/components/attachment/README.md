# Attachment

The files a message carries, shown as 150px tiles in a wrapping row: a picture fills its tile with the caption in white over it, any other file shows a glyph under its name.

## When to use

- Showing the files attached to a sent message, inside or next to the message.
- Previewing images with `preview` and naming other files by kind (`PDF`, `JPG`).

## When not to use

- For files picked but not sent yet, use [PendingFiles](../pending-files/README.md).
- For a file manager list with selection and actions, use [FileRow](../file-row/README.md).

## Usage

The family:

- `AttachmentGrid` — the wrapping row (16px gaps).
- `AttachmentTile` — one file: `name`, a one-word `label` for its kind, and `preview` (an image URL) for pictures.

```tsx
import { AttachmentGrid, AttachmentTile } from "@anyknown/ui"

<AttachmentGrid>
  <AttachmentTile name="living-room.jpg" label="JPG" preview={photoUrl} />
  <AttachmentTile name="lease-draft.pdf" label="PDF" />
</AttachmentGrid>
```

Tiles are not clickable. To open a file, wrap the tile in your own link or button.

## Accessibility

- Each tile is a `<figure>` with a `<figcaption>` holding the name and kind. The grid is a plain `<div>`, not a list.
- A preview image has `alt=""`: the name is already in the caption, and reading it twice is noise. The file glyph is decorative.
- A long name is clipped with an ellipsis and keeps its full text in `title`.
- Caption text over a picture is white with a soft shadow; contrast depends on the image.
- No motion and no keyboard focus.

## Keyboard

No keyboard interaction of its own.

## Related

- [PendingFiles](../pending-files/README.md) — files before they are sent.
- [Bubble](../bubble/README.md) — the message the files belong to.
- [FileRow](../file-row/README.md) — files in a storage list.
