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

- `FileList` — the rest card (`surfaceRaised`, `shadow.rest`) with hairlines between rows. It shows an optional selection count under it.
- `FileRow` — one row for a `FileItem` (`kind`, `name`, `size`, `mtime`). Click toggles the selection and double-click calls `onOpen`. `actions` are icon buttons.

```tsx
import { FileList, FileRow } from "@anyknown/ui"

<FileList label="Files" selectedCount={selected.size} selectedLabel={(n) => `${n} selected`}>
  {items.map((item) => (
    <FileRow
      key={item.name}
      item={item}
      selected={selected.has(item.name)}
      onSelectChange={(on) => toggle(item.name, on)}
      onOpen={() => openItem(item)}
      selectLabel={(name) => `Select ${name}`}
      actions={[
        { icon: <DownloadIcon />, label: `Download ${item.name}`, onAction: () => download(item) },
      ]}
    />
  ))}
  <FileRow item={{ kind: "file", name: "contract.pdf" }} state="uploading" progress={62} />
</FileList>
```

A folder, or a file with no `size`, shows `—` in the size column. A busy row (`encrypting`, `uploading`) has no checkbox and no actions.

## Accessibility

- `FileList` is `role="grid"` with `aria-multiselectable="true"`. `label` (required) is its `aria-label`.
- Each `FileRow` is `role="row"` with `role="gridcell"` children. It is focusable (`tabIndex={0}`) and has `aria-selected`. The icon cell is `aria-hidden`. The name has a `title` with the full name.
- The checkbox is native and named by `selectLabel(name)` (default "選取 {name}").
- Each action is a native button named by its `label`. Include the file name in it.
- The checkbox and actions appear on hover, on focus within the row, when the row is selected, and always on devices without hover (`(hover: none)`).
- A busy row has `aria-busy="true"`. An uploading row has a `progressbar` with `aria-valuetext` "{name} 上傳中 N%".
- `selectedCount` renders an `aria-live="polite"` line with `selectedLabel(count)`.
- Focus rings are 2px `focusRing` outlines. With `prefers-reduced-motion: reduce`, the encrypting spinner stops.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. `selectLabel` and `selectedLabel` change two of them. "加密中" and "上傳中" cannot be changed today.
- Known gaps: the grid has no arrow-key navigation, and every row is its own Tab stop. The row checkbox hit area is 16px (A11Y-DEBT).

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
