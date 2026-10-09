# DataTable

A real `<table>` with header sorting, a filter box, row selection and inline cell editing; its first consumer is the i18n dictionary editor.

## When to use

- Records you sort, filter, select or edit in place, such as translation keys and their strings.
- Many rows in a capped scroll area, thousands included (`maxHeight`, 20rem by default), with a `footer` like "Load more" that scrolls with the rows.
- A table that sits full width in its own section, not in a card.

## When not to use

- For a read-only mono ledger that wraps to two lines on a phone, use [Table](../table/README.md).
- For a list of things you click to open, use [List](../list/README.md).
- For files with icons, sizes and hover actions, use [FileRow](../file-row/README.md).

## Usage

The table does not filter or sort by itself: it reports `filter` and `sort`, and you pass in the rows to show. Pass `total` so the count reads "shown / total".

```tsx
import { DataTable, type DataTableColumn, type SortState } from "@anyknown/ui"

type Entry = { key: string; en: string }

const columns: DataTableColumn<Entry>[] = [
  { id: "key", header: "key", mono: true, sortable: true, value: (row) => row.key },
  {
    id: "en",
    header: "en",
    sortable: true,
    editable: true,
    value: (row) => row.en,
    onCommit: (row, next) => saveString(row.key, next),
  },
]

<DataTable
  label="Dictionary"
  rows={visibleRows}
  total={entries.length}
  rowKey={(row) => row.key}
  columns={columns}
  filter={filter}
  onFilterChange={setFilter}
  sort={sort}
  onSortChange={setSort}
  defaultSelected={new Set()}
  labels={{ filterPlaceholder: "Filter keys or strings" }}
/>
```

`filter`, `sort` and `selected` each work controlled (`filter` / `sort` / `selected` with their `on…Change`) or uncontrolled (`defaultFilter`, `defaultSort`, `defaultSelected`). Giving `onFilterChange` or `defaultFilter` shows the filter box; giving `selected` or `defaultSelected` adds the checkbox column. `onClearFilter` adds a "clear filter" button to the empty row; it empties the filter, then calls you.

`onOpen` makes each row open something (a detail page, a side sheet): it runs on a click on the row and on <kbd>Enter</kbd> when the row has focus, and it makes the rows keyboard-navigable (see Keyboard). A click on a checkbox, a link, a button or an editable cell stays that control's and does not open the row. Without `onOpen`, rows are not focusable, as before.

```tsx
<DataTable label="Calls" rows={calls} rowKey={(call) => call.id} columns={columns} onOpen={(call) => openCall(call.id)} />
```

Above 1,000 rows the table mounts only the rows in and near the scroll area ([TanStack Virtual](https://tanstack.com/virtual)), with blank rows above and below that keep the scrollbar true to the full list. Nothing to configure: row heights are measured as rows mount, wrapped rows included. At 1,000 rows or fewer every row is in the DOM. The count, sorting and filtering are unchanged; pass the full filtered list as `rows`.

A column's `cell` renders custom content (such as a Badge); `value` is still what gets edited and compared. An empty value shows a muted `—`. `maxHeight` caps the scroll area (20rem by default); `footer` scrolls with the rows.

`filterPlaceholder`, `countLabel`, `selectLabel`, `selectAllLabel`, `editLabel` and `clearLabel` are deprecated; use `labels`. While they are still passed, they win over `labels`.

## Accessibility

- Renders a native `<table>` named by `label` (required), inside a scroll container with `role="region"`, the same name, and `tabIndex={0}`, so keyboard users can scroll it.
- Column headers are `<th scope="col">`. The sorted column has `aria-sort` (`ascending` / `descending`), and only one column has it at a time. A sortable header is a native button. The arrow is `aria-hidden`.
- The filter is an `<input type="search">` named by `labels.filterPlaceholder`. The "shown / total" count is an `aria-live="polite"` region.
- Row checkboxes are native and named by `labels.select(key)`. The header checkbox is named by `labels.selectAll` and becomes `indeterminate` when only some rows are selected. Each checkbox sits in a 24px label, so the whole target toggles it.
- With `onOpen`, the body rows use a roving tabindex: one row is in the tab order (`tabIndex={0}`, the first row until another gets focus), the rest are `tabIndex={-1}`. Focus shows as a 2px `focusRing` outline on the row. Keys pressed inside a cell (an editor, a checkbox) belong to that cell.
- Above 1,000 rows, the table carries `aria-rowcount` (all rows plus the head) and each mounted row its `aria-rowindex`, so a screen reader reports a row's place in the whole list, not in the mounted window. The blank spacer rows are `aria-hidden`. Moving past the last mounted row with <kbd>↓</kbd> scrolls the next row in and focuses it.
- Editable cells are focusable (`tabIndex={0}`). The editor input is named by `labels.edit(column, key)`. It takes focus when it opens, and focus goes back to the cell after Enter or Escape.
- The words (`filterPlaceholder`, `count`, `select`, `selectAll`, `edit`, `clearFilter`, `noMatch`) follow `<LocaleProvider>` (zh-TW by default); override any with `labels`. `emptyState(query)` replaces the empty-row text.
- Focus rings are 2px `focusRing` outlines. With `prefers-reduced-motion: reduce`, transitions are instant.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves through the filter, the scroll region, sort buttons, the rows (one stop, with `onOpen`), checkboxes and editable cells. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | On a focused row (with `onOpen`): moves focus to the next or previous row. |
| <kbd>Enter</kbd> | On a focused row (with `onOpen`): opens it. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On a sort header: cycles ascending → descending → unsorted. |
| <kbd>Space</kbd> | On a checkbox: toggles the row, or all rows from the header. |
| <kbd>Enter</kbd> / <kbd>F2</kbd> | On an editable cell: opens the editor (double-click does too). |
| <kbd>Enter</kbd> | In the editor: commits and returns focus to the cell. |
| <kbd>Escape</kbd> | In the editor: cancels and returns focus to the cell. |
| <kbd>Tab</kbd> (in the editor) | Moving focus away commits, like Enter. |
| Arrow keys | On the focused scroll region (not on a row): scroll it (native). |

## Related

- [Table](../table/README.md) — the low-level ledger parts, with no sorting or editing.
- [List](../list/README.md) — rows that open something.
- [Badge](../badge/README.md) — a status in a custom `cell`.
- [EmptyState](../empty-state/README.md) — a whole-page empty state; the table has its own empty row.
