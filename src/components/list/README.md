# List

A list of things you open, such as memories or questions: a muted head over the columns, then 40px rows, each one button, with no frame and no mono.

## When to use

- Rows that each open a detail or a page.
- Columns whose widths you set yourself. Give the same `gridTemplateColumns` in `sx` to the head and to every row, and put the phone layout (hide the head, wrap a row to two lines) in that same `sx`.
- A head where some columns reorder the list (`ListSort`).
- Questions that need a weight mark in front (`WeightDot`).

## When not to use

- For a mono ledger of keys, sizes and states, use [Table](../table/README.md).
- To sort, filter, select or edit records in place, use [DataTable](../data-table/README.md).
- For settings with a control on the right, use [Group](../group/README.md) or [SettingsRows](../settings-rows/README.md).

## Usage

The family:

- `ListHead` — the column names, `t1` and muted, with a hairline under them. It accepts any `<div>` attribute, such as `aria-hidden`.
- `ListSort` — a column name (a plain string) that orders the list. When `active`, it goes dark, ` ↓` follows it, and its name gains "sorted". `labels.sorted(column)` changes that word.
- `ListRow` — one row, one [Ghost](../ghost/README.md) button. Its children are the cells. It has `minHeight: 40` and grows when it wraps.
- `WeightDot` — the 8px mark in front of a question. `weight="light"` is a grey dot (it goes ahead if nobody answers), `soon` turns it red (about to go ahead), and `weight="heavy"` is an orange ring (it waits for you).

```tsx
import { ListHead, ListRow, ListSort, Status } from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
  grid: {
    gridTemplateColumns: {
      default: "72px minmax(0, 1fr) 56px",
      "@media (max-width: 45rem)": "56px minmax(0, 1fr) 40px",
    },
  },
})

<div>
  <ListHead sx={styles.grid}>
    <span>State</span>
    <span>Memory</span>
    <ListSort active={order === "recent"} onClick={() => setOrder("recent")}>
      Created
    </ListSort>
  </ListHead>
  {memories.map((memory) => (
    <ListRow key={memory.id} sx={styles.grid} onClick={() => openMemory(memory.id)}>
      <Status dot="filled" tone="success">Current</Status>
      <span>{memory.text}</span>
      <span>{memory.created}</span>
    </ListRow>
  ))}
</div>
```

Give the middle column `minmax(0, 1fr)`. Cell text wraps inside its column (`overflow-wrap: anywhere`) and does not spill into the next one.

## Accessibility

- `ListHead` is a plain `<div>`, not a set of column headers. If no column in it can sort, pass `aria-hidden="true"` to hide it from screen readers.
- `ListRow` is a native `<button>`. Its accessible name is the text of all its cells joined together, so keep the cells short.
- `ListSort` is a native `<button>` named by its text. When `active`, its accessible name becomes "Created, sorted" (zh-TW "建立，排序中") and the ` ↓` is `aria-hidden`. It does not set `aria-sort` or `aria-pressed`. An `aria-label` you pass wins.
- `WeightDot` is a `<span>` with only an optional `title`. It has no role and no text, so the weight is invisible to screen readers. Say it in words in the row as well.
- The rows are not a `<ul>`, so there is no list count.
- Focus rings, press scale and reduced motion come from Ghost (a 2px `focusRing` outline, a 0.98 press that is off under `prefers-reduced-motion: reduce`).
- The only built-in word is ListSort's `sorted`; it follows `<LocaleProvider>` and `labels` overrides it.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves through the `ListSort` buttons and then the rows. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates a `ListRow` or `ListSort` (native `<button>`). |

## Related

- [Table](../table/README.md) — the mono ledger.
- [DataTable](../data-table/README.md) — sort, filter, select and edit.
- [Group](../group/README.md) — `Status`, the dot and words used in a state column.
- [Ghost](../ghost/README.md) — the button every row is made of.
