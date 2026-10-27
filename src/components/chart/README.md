# Chart

A small chart drawn in pencil: marks in ink on three faint ticks, labels under them, and no frame, fill or legend. The library draws its own SVG and ships no chart package. The family exports:

- `BarChart` — `labels`, `values` and an optional `unit`. One ink bar per value, from zero.
- `LineChart` — the same props. One 2px ink line through the values; the ticks cover the values only, not zero.

## When to use

- One series of a few to a few dozen numbers where the shape matters more than each value: runs per day, spend per week.
- `BarChart` for counts and amounts that start at zero; `LineChart` for a level over time, such as latency per hour, where the change matters more than the distance from zero.
- The one main chart of a reply or a page, with the exact numbers a hover, tap or Tab away.

## When not to use

- For numbers the reader compares one by one, use [Table](../table/README.md); a chart gives an impression, a table allows comparison.
- For one conclusion-level number, use [Stat](../stat/README.md).
- For a single reading against a maximum, use [Progress](../progress/README.md).
- For more than one series, or a second chart on the same page: put the rest in a table.

## Usage

```tsx
import { BarChart, LineChart } from "@anyknown/ui"

<BarChart labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} values={[12, 8, 15, 9, 4]} unit="runs" />
<LineChart labels={["00:00", "06:00", "12:00", "18:00"]} values={[310, 342, 388, 325]} unit="ms" />
```

`values` are numbers; the chart writes them with thousands separators and at most two decimals, with `unit` after one space ("1,200 runs"). The ticks are three round numbers from the axis (bars always include zero; a line's ticks cover only its values), so the tick labels carry no unit. Past seven values, only every k-th label is shown under the chart; all of them are in the table. Name what the chart shows in the text around it, or pass `aria-label`.

## Accessibility

- The drawing is an `<svg role="img">`. Its name is the chart type and the first and last label ("Bar chart, Mon to Fri"), in the language of `<LocaleProvider>`; `aria-label` replaces it.
- Every number is in a visually hidden `<table>` with a label column and a value column; the unit is in the value column's header, not in each cell.
- The table rows are the focusable values: one Tab stop for the whole chart. When a row has focus, its slot shows the focus ring and its value appears above the bar or above the line's point (drawn as an 8px dot), so a sighted keyboard user sees where they are.
- Each value's slot has a `title` with its label, value and unit. A mouse shows the value while it is over the slot; a tap shows it until the next tap.
- The bars and the line are `text` on `bg` and the tick labels `textMuted`; both pass contrast in light and dark. The ticks are a 1px `washHover` line, a guide only: the tick labels carry the values.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves focus into the chart, on the last value that had focus (the first one at the start). |
| <kbd>→</kbd> / <kbd>↓</kbd> | Moves to the next value. |
| <kbd>←</kbd> / <kbd>↑</kbd> | Moves to the previous value. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Moves to the first or last value. |

## Related

- [Stat](../stat/README.md) — one number with a label; often above a chart in a row [Stack](../stack/README.md).
- [Table](../table/README.md) — every value, for comparing.
