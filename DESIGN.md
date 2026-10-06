# DESIGN.md

Judgment for agents that build AnyKnown pages. This file covers only what the code and tokens can't tell you: how to put a page together and what must never appear on one. It copies no values. The published `https://ui.anyknown.com/design.md` ends with an appendix (the token table and the `brand.css` vocabulary) that the build generates from source.

There are two kinds of reader. Agents inside our apps already use `@anyknown/ui` with StyleX; component rules live in `src/components/README.md`, and this file covers the page level. Outside agents (v0, Claude, Codex) produce one-off HTML pages (reports, proposals, benchmarks, event pages) with no bundler and no React. They can only `<link>` `https://ui.anyknown.com/brand.css` and lay out the page with its `ak-*` classes. The vocabulary is small on purpose: a class that isn't in the table is not allowed.

## 1. What this is

Tactile. White paper on a neutral gray desk: content is paper, and anything that floats is more paper stacked on top. The closer something is to the user, the rounder its corners and the deeper its shadow.

- Depth comes from tone and shadow, not borders. The desk is `layer1` and the main sheet is `layer2`. To divide a sheet, use a recessed `surface` with no frame. Borders are only for controls that need a 3:1 edge to be seen (inputs, checkboxes). A page full of frames looks like a form.
- There are three shadow levels. Rest is for cards on the paper (tool cards, file rows, attachments), float is for popovers, dropdowns, tooltips and toasts, and modal is for dialogs and sheets. Anything else has no shadow; with more shadows the reader can't tell what sits on top.
- Corner radius follows size; no single value fits everything. Small parts 6, inputs 12, cards 14, floating layers 16, the main sheet 20, dialogs 24, and buttons and badges are pills. When nesting, the inner radius is the outer radius minus the padding, or the corners look off.
- Colors come from five 12-step scales. The gray scale has chroma 0 (pure gray, neither cool nor warm), and every step has a fixed job (1–2 backgrounds, 3–5 fills, 6–8 borders, 9–10 solids, 11–12 text). Pages use only the semantic `--ak-*` variables; the scales themselves are not public.
- One color, one meaning, so the reader never has to guess. Blue (`--ak-signal`, `--ak-focus-ring`, `--ak-info`) means only that the agent is working, focus, or progress. Red means only delete and failure, amber only warning, green only success. Color used as decoration is always wrong.
- The primary action is a solid ink pill, one per page. Links are ink too and stand apart from body text by their underline (`a` inside `ak-prose` already does this), not by blue. Solid red (`--ak-danger-solid` with `--ak-on-danger-solid` text) is only for deletes that can't be undone.
- `--ak-text-faint` has only 3:1 contrast, so it never carries text; it is for icons, placeholders and separators. Use `ak-muted` for secondary text. `--ak-border` is a divider; control edges use `--ak-border-control`.
- Status labels are a tinted background with text in the same hue (`--ak-success-subtle` background with `--ak-success` text), never a solid fill. The three `ak-callout` variants already work this way.
- Headings and body text use Figtree (headings 600 to 700, body 400), falling back to Noto Sans TC for Chinese. Data and code use Geist Mono. Figtree's round letterforms match the pills and large corners.

The tone is still a ledger: quiet, comparable, no ornament. Readers come to make a decision, and the page's job is to line up the evidence, not to persuade.

## 2. Frame the reader's task, then pick a structure

Before laying out any one-off page, answer one question: what does the reader need to decide when they open it? If you can't answer, don't start.

Once you can, pick one of three skeletons. Don't invent your own.

- Single-column long read. Reports and post-mortems. One `ak-display` inside `ak-page`, then `ak-prose`, with evidence tables in between. The reader goes top to bottom.
- Conclusion first, evidence grid after. Proposals, benchmarks, pricing comparisons. The first screen is the conclusion (a paragraph of `ak-prose` and a row of `ak-stat`); below it come `ak-table` and `ak-grid-2` / `ak-grid-3`, split into `ak-section` blocks. The reader sees the answer first and then decides whether to check the evidence.
- Controls first. Interactive planning pages and sign-up pages. `ak-btn` and the form (one `ak-field` per field, label on top) are on the first screen, with the explanation below. The reader came to act, not to read. A sign-up page opens with the form, not a row of stats; one sentence next to the button is enough to say how many seats are left.

All three share the same type scale and spacing. Structure follows the reader's goal, not the amount of data: when there is a lot of data, add sections, don't switch skeletons.

## 3. Laying out evidence

- Put numbers that are compared on the same ruler: same column, same unit, same baseline. When two numbers sit in different columns or units, the reader has to convert them and the comparison fails.
- Evidence tables run full width, never inset in a card. Put `ak-table` straight into `ak-section`, as wide as the body text. A card is for one standalone object (a file, an attachment, the result of one tool call); a table is part of the text, and wrapping it in a card cuts it off from the text.
- One main chart per page; everything else is a table. A chart gives an impression and a table allows comparison. With two or more charts the reader doesn't know where to look.
- Use `ak-stat` for big numbers (one `ak-stat-value` and one `ak-stat-label` inside), at most four in a row, and only for conclusion-level numbers. A conclusion-level number is one the reader can decide on after seeing it, usually a difference computed from the table: a ratio, a delta, what's left, how far over budget. Don't enlarge a cell the table already has (a total, a cost, one option's score); lint checks every stat value against the table cells. If a page has no conclusion-level number, it has no stats. Three stats are not required.
- Numbers in the same unit get exactly one table. If pricing, cost and competitors are all USD per minute, that is one table; split into three, the reader has to compare across tables. Another dimension means another column, not another table.
- Don't make a table out of two columns. In a full-width table with only two columns the numbers get pushed to the far right and the eye loses the row. Use a list in `ak-prose` instead, or fold it into another table as a column.
- For the one sentence the reader must notice, use `ak-callout` with `ak-callout-info` / `ak-callout-warning` / `ak-callout-danger`. At most two per page; when callouts are everywhere, nothing stands out. A callout doesn't repeat the body text and doesn't take up an `ak-section` of its own; it sits right next to the table or button it is about.
- Numbers are tabular (`ak-table` and `ak-stat` already turn this on), decimals line up within a column, and units go in the header, not in every cell.

## 4. Hierarchy and type

- One display heading (`ak-display`) per page. A second display heading means a second page.
- `ak-h1` is for section titles and `ak-h2` for subsections within a section. Text at `text.xl` or larger may only open a block, never sit mid-paragraph or inside a table.
- Body lines are 60 to 75 characters long. `ak-prose` already sets a max width; don't stretch it. On wide screens, leave the extra space empty instead of filling it.
- Spacing uses only the `space.*` steps (table in the appendix). Made-up values such as 13px or 18px are never allowed; if neither neighboring token fits, pick the smaller one.
- Color uses only the `--ak-*` variables. Made-up hex is the most often broken rule in this file, so lint counts it. Never hand-tune a color: to change one, edit the scale in `scripts/palette.mjs` and rerun it, rather than swapping in a similar hex on the page.
- Use `ak-muted` for secondary notes; don't shrink the type to signal that something is secondary. Size expresses hierarchy and color expresses importance; don't stack the two.
- Monospace is only for data, code and identifiers (`ak-mono`). Monospace as decoration pretends the page is a terminal.
- Light is the default and dark follows the OS. `ak-theme-light` / `ak-theme-dark` are only for pages that must lock a theme; lock the whole page, never mix the two on one page.

## 5. Copy

- Use sentence case, not Title Case. A heading is a sentence, not a sign.
- Buttons start with a verb: 「送出報名」 (Submit registration), not 「報名表單」 (Registration form). The reader should know what happens before they press it.
- Errors say how to fix the problem, not sorry. 「金額要大於 0」 (Amount must be greater than 0) helps more than 「抱歉,發生錯誤」 (Sorry, something went wrong).
- Numbers are tabular, thousands are separated with commas, and there is one space between a number and its unit.
- Don't write 「強大」「無縫」「一站式」 (powerful, seamless, all-in-one). A ledger doesn't describe itself.

## 6. Motion

- Only ease-out and linear. No bounce, no overshoot, no spring. `--ak-motion-spring` stays in the tokens only for compatibility; don't use it.
- If something can stay still, keep it still. One-off pages usually need no motion at all; when they do, animate only opacity and transform, with `--ak-motion-*` durations.
- Respect `prefers-reduced-motion`. `brand.css` already handles `ak-btn`; any animation you add is yours to handle.

## 7. Anti-patterns

Each one by name. When you see one, fix it without asking.

- The generic SaaS row of three KPI cards: three rounded cards, each with a number and an icon. Use a row of `ak-stat`, no cards.
- Gradient cards, frosted glass, `backdrop-filter`. Paper has none of these.
- Icons on colored circles. Icons are line, single-color, and the same color as the text. The only exception is the `signalSubtle` icon background on the left of a tool card; it means the agent is working, not decoration.
- A hero image for every section. At most one main image per page (section 3).
- Two primary buttons on one page. One `ak-btn` per page; everything else is `ak-btn-secondary`.
- A table stuffed into a card with a shadow. Tables run full width with no shadow.
- Made-up hex, `rgb()`, `hsl()`. Use only `--ak-*`.
- Made-up classes. Nothing outside the vocabulary is allowed. For a new layout need, change `brand.css` first, then this file.
- Inline styles. One-off pages are no exception; inline style is how made-up values get in.
- Fonts that aren't tokens: Inter, Roboto or `system-ui` written straight into `font-family`. Use `--ak-font-*`.
- Overshoot béziers and `animation: bounce`. See section 6.
- A card inside a card. One rest level is enough; to divide a card, use a recessed `surface`. Nested frames and shadows mean the hierarchy wasn't thought through.
- A 1px border around every block. Depth comes from tone and shadow; borders are only for controls that need a 3:1 edge (section 1).
- All-caps eyebrows (`text-transform: uppercase` plus letter-spacing). That is someone else's language.
- `useEffect` (internal agents). Use a ref callback with cleanup; see `src/components/button` for an example.

## 8. Pre-delivery check

Go through this yourself before handing the page over:

- Check both light and dark. Dark isn't inverted light; it is a separate set of tokens. If you haven't looked at dark, you haven't finished.
- It must read at 375px wide. `ak-grid-*` collapses to one column on its own; tables must scroll sideways instead of widening the page.
- Put a screenshot next to the components on `https://ui.anyknown.com`; no one should be able to tell they come from two places. Buttons especially: `ak-btn` and the playground's Button should look like the same button.
- Run `node scripts/design-lint.mjs <html>`. Made-up hex, out-of-vocabulary classes and inline styles must all be 0.
