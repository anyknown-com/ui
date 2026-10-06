# FileRow

One row of a file browser (type icon, name, mono size, modified time, and a checkbox and actions that appear on hover), placed in a `FileList` card.

## When to use

- Browsing stored files and folders, where you can select several and act on one.
- Showing a file that is still encrypting or uploading in the same list (`state`, `progress`).

## When not to use

- For files the person is adding right now, use [Dropzone](../dropzone/README.md)'s `UploadList`.
- For files attached to a message, use [Attachment](../attachment/README.md) or [PendingFiles](../pending-files/README.md).
- For records with sortable columns and inline edit, use [DataTable](../data-table/README.md).

## Usage

The family:

- `FileList` — the rest card (`surfaceRaised`, `shadow.rest`) with hairlines between rows. Given `selectedCount`, it shows a live selection count under it.
- `FileRow` — one row for a `FileItem` (`kind`, `name`, `size`, `mtime`). A click toggles the selection and a double-click calls `onOpen`. `actions` are icon buttons; pressing one does not change the selection.

```tsx
import { FileList, FileRow } from "@anyknown/ui"

<FileList label="Files in Taxes" selectedCount={selected.size}>
  {items.map((item) => (
    <FileRow
      key={item.name}
      item={item}
      selected={selected.has(item.name)}
      onSelectedChange={(on) => toggle(item.name, on)}
      onOpen={() => openItem(item)}
      actions={[
        { icon: <DownloadIcon />, label: `Download ${item.name}`, onAction: () => download(item) },
      ]}
    />
  ))}
  <FileRow item={{ kind: "file", name: "contract.pdf" }} state="uploading" progress={62} />
</FileList>
```

Selection is controlled (`selected` + `onSelectedChange`) or uncontrolled (`defaultSelected`). A folder, or a file with no `size`, shows `—` in the size column. A busy row (`encrypting`, `uploading`) has no checkbox and no actions. `icon` replaces the file or folder glyph.

Deprecated: `onSelectChange` (use `onSelectedChange`), `selectLabel` (use `labels={{ select }}`) and FileList's `selectedLabel` (use `labels={{ selected }}`). While passed, they win over `labels`.

## Accessibility

- `FileList` is `role="grid"` with `aria-multiselectable="true"`. `label` (required) is its `aria-label`.
- Each `FileRow` is `role="row"` with `role="gridcell"` children. It is focusable (`tabIndex={0}`) and has `aria-selected`. The icon cell is `aria-hidden`. The name has a `title` with the full name.
- The checkbox is native, named by `labels.select(name)`, and sits in a 24px label; clicking the label toggles the row once.
- Each action is a native button named by its `label`. Include the file name in it.
- The checkbox and actions appear on hover, on focus within the row, when the row is selected, and always on devices without hover (`(hover: none)`).
- A busy row has `aria-busy="true"`. An encrypting row says `labels.encrypting`. An uploading row has a `progressbar` named by the file name, with `aria-valuetext` from `labels.uploading(name, percent)`.
- `selectedCount` renders an `aria-live="polite"` line with `labels.selected(count)`, empty at 0.
- The words (`select`, `encrypting`, `uploading`, `selected`) follow `<LocaleProvider>` (zh-TW by default). `FileRow` and `FileList` both take `labels` (`Partial<FileRowLabels>`).
- Focus rings are 2px `focusRing` outlines. With `prefers-reduced-motion: reduce`, the encrypting spinner stops.
- Known gap: the grid has no arrow-key navigation, and every row is its own Tab stop.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to the row, then to its checkbox and action buttons, then to the next row. |
| <kbd>Space</kbd> | On a focused row: toggles its selection. On the checkbox: toggles it. |
| <kbd>Enter</kbd> | On a focused row: calls `onOpen`. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On an action: runs it (native `<button>`). |

A busy row takes focus but ignores these keys.

## Related

- [Dropzone](../dropzone/README.md) — adding files, and the upload list.
- [DataTable](../data-table/README.md) — a table with sorting, filtering and selection.
- [Checkbox](../checkbox/README.md) — a labeled checkbox outside a row.
