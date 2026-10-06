# Known a11y gaps

An a11y review measured the token pairs in both themes and listed the ones below threshold. The
implementation **does not change the palette on its own**: whether to change it is a design
decision, and this list is that decision's backlog.

Thresholds: text 4.5:1 (small text), UI boundaries and graphics 3:1, hit targets 24px.

## Palette level (one change affects every product)

Numbers are measured against the current output of `scripts/palette.mjs` (12-step neutral
palette, light / dark), as pasted into `src/tokens.stylex.ts`.

| Token pair | Measured | Threshold | Where |
| --- | --- | --- | --- |
| `textFaint` on `surface` | 3.75:1 (light) / 4.88:1 (dark) | 4.5:1 | placeholders in input, select search, composer, interaction-card, data-table filter |
| `successHl` on `successSubtle` / `dangerHl` on `dangerSubtle` | 1.15–1.23:1 | 3:1 | diff-viewer inline word highlight: "which words changed" rests on this background alone |

`textFaint` is a 3:1 color, so the rule is: no text that has to be read. Icons, chevrons,
placeholders, separators, the `—` in an empty cell, and disabled states may use it; all other
text uses `textMuted` (≥ 5.36:1 on every background). The placeholder is the only "text"
exception left. To reach 4.5:1, switch the placeholder to `textMuted`; do not retune `textFaint`.

The diff word highlight is a fill step (step 5) on a subtle background (step 3); the two steps
are close in lightness by design. To reach 3:1, add a non-color mark (underline or bold); do not
hand-tune the `*Hl` values.

## Fixed: moved to the 12-step neutral palette

These rows from the old table pass under the new palette and were removed:

| Token pair | Old | New (light / dark) | Fix |
| --- | --- | --- | --- |
| `textFaint` as text (select group titles and hints, dropdown shortcuts, label "optional", list column names, diff line numbers) | 2.44–3.16 | now `textMuted`: ≥ 5.36 / ≥ 7.30 | all readable text moved to `textMuted` |
| unchecked checkbox / radio border, switch track when off | 1.76 (`borderStrong`) | 3.75 / 3.80 (`borderControl` on `surface`) | control boundaries use `borderControl` |
| `accent` on `accentSubtle` (Badge accent, pills tabs selected) | 4.18 (dark) | 15.31 / 13.62 | ink accent on neutral gray |
| `danger` on `dangerSubtle` (Badge danger) | 4.48 (dark) | 4.59 / 7.47 | red step 9 (light) / step 11 (dark) on red step 3 |

## Hit targets

| Where | Measured | Threshold | Note |
| --- | --- | --- | --- |
| checkbox / radio | 16.8px | 24px | only when `label` is omitted; with a label the whole label is the target |
| switch | 22.4px tall | 24px | same |
| dropzone cancel button / file-row checkbox / data-table checkbox | 22.4 / 16 / 13.6px | 24px | none of these has a label around it to enlarge the target |

Badge's chip `×` already reaches 24px with an `::after` that does not affect layout; the same
trick applies to the three above.

## Intentional

| Where | Value | Note |
| --- | --- | --- |
| scrollbar thumb visible width | 4px (10px minus 3px transparent border on each side) | deliberate, just thin |
