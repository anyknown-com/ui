# Known a11y gaps

An a11y review measured the token pairs in both themes and listed the ones below threshold. The
implementation **does not change the palette on its own**: whether to change it is a design
decision, and this list is that decision's backlog.

Thresholds: text 4.5:1 (small text), UI boundaries and graphics 3:1, hit targets 24px.

Numbers are WCAG 2 contrast ratios computed from the hex values in `src/tokens.stylex.ts`
(the 12-step neutral palette from `scripts/palette.mjs`), light / dark.

## Open: text in `textFaint`

`textFaint` is a 3:1 color, so the rule is: no text that has to be read. Icons, chevrons,
separators, the `—` in an empty cell, and disabled states may use it; all other text uses
`textMuted` (≥ 5.36:1 light / ≥ 7.30:1 dark on every background). This text use is left:

| Where | Pair | Measured | Threshold |
| --- | --- | --- | --- |
| `KbdGroup` separator in a sequence (the caller's "then") | `textFaint` on `bg` / `surface` / `surfaceRaised` | 3.75–3.95 / 4.53–5.15 | 4.5:1 |

It passes in dark mode on these backgrounds and fails in light mode. A glyph separator ("+",
"→") counts as a separator and may stay; a word such as "then" is text. The fix, if the
separator stays a word, is the one the placeholders took: switch it to `textMuted`. Do not
retune `textFaint`.

## Intentional

| Where | Value | Note |
| --- | --- | --- |
| scrollbar thumb visible width | 4px (10px minus 3px transparent border on each side) | deliberate, just thin |

## Resolved in 0.10

| Item | Before | Now |
| --- | --- | --- |
| Placeholders in `Input`, `Textarea`, `PasswordInput`, `Composer` and the `DataTable` filter | `textFaint`: 3.75 / 4.88 | `textMuted`: 6.35 / 9.15 on `surface` |
| `Select` trigger placeholder, `DecisionCard` free-text placeholder | `textFaint` on `surface`: 3.75 / 4.88 | `textMuted`: 6.35 / 9.15 |
| `Select` search box placeholder | `textFaint` on `surfaceRaised`: 3.95 / 4.53 | `textMuted` |
| `DiffViewer` changed words: the only signal was `successHl` on `successSubtle` / `dangerHl` on `dangerSubtle` (1.15–1.23:1) | color only | Added words are `<ins>` with an underline, removed words `<del>` with a strike-through, and `Mark` / `MarkText` under forced colors. Each line has a `+` / `−` sign in `text` and a visually hidden "Added line" / "Removed line" prefix. The fill difference is still 1.15–1.23:1, but it is no longer the only signal. |
| `Checkbox` / `Radio` without a `label` | 16.8px target | a 24px native input over the 16.8px box |
| `Switch` | 22.4px tall | a 24px tall native input over the 22.4px track |
| `Dropzone` cancel button | 22.4px | 30.4px with an `::after` that does not affect layout |
| `FileRow` checkbox | 16px | a 24px `<label>` around the 16px box |
| `DataTable` row and select-all checkboxes | 13.6px | a 24px `<label>` around the box |
| Invalid `Input`, `Textarea`, `PasswordInput`, `Select` under forced colors | the danger border was repainted as the plain frame, so an invalid field looked valid | a 2px dashed frame |
| Invalid `Checkbox` under forced colors | the box opts out of forced colors, so the raw danger color leaked through | a 2px dashed `ButtonText` frame |
| `Ghost` / `IconButton` under forced colors | the hover wash, their only edge, was dropped | a 1px `ButtonText` outline on hover, a `Highlight` focus ring |
| `Slider` under RTL | <kbd>→</kbd> raised the value while the fill grew toward the left | <kbd>←</kbd> raises it and a drag measures from the right edge, under `DirectionProvider` or a computed `direction: rtl` |

## Resolved earlier: moved to the 12-step neutral palette

| Token pair | Old | New (light / dark) | Fix |
| --- | --- | --- | --- |
| `textFaint` as text (select group titles and hints, dropdown shortcuts, label "optional", list column names, diff line numbers) | 2.44–3.16 | now `textMuted`: ≥ 5.36 / ≥ 7.30 | all readable text moved to `textMuted` |
| unchecked checkbox / radio border, switch track when off | 1.76 (`borderStrong`) | 3.75 / 3.80 (`borderControl` on `surface`) | control boundaries use `borderControl` |
| `accent` on `accentSubtle` (Badge accent, pills tabs selected) | 4.18 (dark) | 15.31 / 13.62 | ink accent on neutral gray |
| `danger` on `dangerSubtle` (Badge danger) | 4.48 (dark) | 4.59 / 7.47 | red step 9 (light) / step 11 (dark) on red step 3 |
