# Table

Low-level parts for a mono ledger: a full-width grid with one mono head line on a sunken strip, 34px rows with a hairline under each, and rows that wrap to two lines on a phone.

## When to use

- A read-only record of things on a dashboard or settings page: keys, hosts, sizes, states. Identifiers and numbers are mono, and numbers are right-aligned.
- Rows that open a detail under them (`Toggle` + `Detail`), or end with a "show more" line (`MoreRow`).
- A ledger that scrolls on its own to the bottom of the window (`ListScroll`), with a `sticky` head.

## When not to use

- To sort, filter, select or edit rows, use [DataTable](../data-table/README.md).
- For rows that each open something, with no mono, use [List](../list/README.md).
- For settings with a control on the right, use [SettingsRows](../settings-rows/README.md) or [Group](../group/README.md).

## Usage

The family:

- `Table` — the wrapper. It is full width and never in a card.
- `TableHead` — the mono head line. `columns` is the grid template that every row shares. `sticky` keeps it at the top of a `ListScroll`. It is hidden on a phone.
- `Tr` — a 34px row on the same `columns`. `hover` lifts it to `layer3`.
- `TableCell` — a cell: `mono`, `num` (right-aligned), `faint`. For the phone layout: `order`, `prefixed` (`· ` before it), `pushed` (to the line end), `grow` and `hidden`.
- `StatusCell` — the state column: nothing when fine, a warning dot and a code when `warn`.
- `Subject` — a mono identifier that is also a button (for example, filter by it).
- `Toggle` — the chevron button at a row's end that opens a `Detail`. `open` is required; `onOpenChange(!open)` and `onPress` are both called on press.
- `Detail` — the content under a row.
- `Break` — the line break where a phone row wraps.
- `MoreRow` — a 40px "show more" button at the end.
- `ListScroll` — a scroll area that ends 24px above the bottom of the window.
- `Head` and `Cell` are deprecated aliases of `TableHead` and `TableCell`.

```tsx
import { Detail, StatusCell, Table, TableCell, TableHead, Toggle, Tr } from "@anyknown/ui"
import { Fragment } from "react"

const COLS = "minmax(0, 1fr) 6rem 5rem 24px"

<Table>
  <TableHead columns={COLS}>
    <span>key</span>
    <span>state</span>
    <span>size</span>
    <span />
  </TableHead>
  {keys.map((key) => (
    <Fragment key={key.id}>
      <Tr columns={COLS} hover>
        <TableCell mono>{key.name}</TableCell>
        <StatusCell warn={key.expired}>{key.expired ? "expired" : null}</StatusCell>
        <TableCell num>{key.uses}</TableCell>
        <Toggle
          open={openId === key.id}
          onOpenChange={(open) => setOpenId(open ? key.id : null)}
          label={`Details for ${key.name}`}
          controls={`key-${key.id}`}
        />
      </Tr>
      {openId === key.id && <Detail id={`key-${key.id}`}>{key.note}</Detail>}
    </Fragment>
  ))}
</Table>
```

## Accessibility

- Everything is a `<div>` or `<span>`. There is no `table`, `row` or `cell` role, so a screen reader reads each row as a line of text. On a phone the head is `display: none`.
- `Toggle` is a native button with `aria-expanded`. `label` is required and becomes its `aria-label`. Pass `controls` (the `Detail`'s `id`) to set `aria-controls`.
- `Subject` and `MoreRow` are native buttons named by their children. A `Subject` or a string `mono` cell gets a `title` with the full text, so a clipped name can be read on hover.
- The `StatusCell` warning dot is `aria-hidden`. Put the state in words in its children, not only the color.
- `Break` is `aria-hidden`.
- Focus rings are 2px `focusRing` outlines. With `prefers-reduced-motion: reduce`, the chevron turn and the `MoreRow` transition are instant.
- `ListScroll` has no `tabIndex`. If nothing in it can take focus, keyboard users cannot scroll it.
- No built-in words.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates a `Toggle`, `Subject` or `MoreRow` (native `<button>`). |

The table itself has no keyboard interaction.

## Related

- [DataTable](../data-table/README.md) — sorting, filtering, selection and inline edit.
- [List](../list/README.md) — rows that open something, with no mono.
- [Page](../page/README.md) — `SectionLabel` and `PageHead` above a ledger.
- [Group](../group/README.md) — `Status` for a state in words after a dot.
