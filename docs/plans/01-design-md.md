# design.md: letting outside agents build one-off AnyKnown pages

Status: built. The visual language this plan was written against (Ledger: warm paper, a viridian accent, serif headings, a woven button fill) has since been replaced by Tactile; see [02-tactile.md](02-tactile.md). The parts of this plan that described the old look now describe the current system. The structure (DESIGN.md, `brand.css`, the eval loop) is unchanged.

Based on Vercel's approach (vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md): one document of judgment, one public stylesheet with a bounded vocabulary, and an eval loop that routes feedback back into them. All three layers are needed; give an agent only a token table and it still builds a generic SaaS dashboard.

There are two kinds of reader: agents inside our apps (which already use `@anyknown/ui` with StyleX), and outside agents (v0, Claude, Codex) that produce one-off HTML pages that never enter the repo: reports, proposals, benchmarks, event pages. The outside agents have no bundler and no React; they can only consume plain CSS and plain documents.

## Where we stand

| Vercel | This repo today | Missing |
| --- | --- | --- |
| design.md (judgment) | Five guides, all engineering-oriented (component decisions, a11y debt) | A document on how to put a page together and what must never appear |
| vercel-brand.css (bounded vocabulary) | `tokens.css` (`--ak-*` variables) | Variables aren't a vocabulary: an outside agent with only variables still does its own layout. We need a class-level stylesheet |
| Eval loop | Internal rule: mock + agent-browser light/dark screenshots, done only once the CEO has looked | Fixed scenarios, countable mechanical errors, a place for each kind of feedback to land |
| Public channels | `llms.txt` / `llms-full.txt` / `docs/*.md` | Two stable URLs: `design.md` and `brand.css` |

## 1. `DESIGN.md` (handwritten, judgment only)

Lives at the repo root, next to the README. It covers only what the code and tokens can't tell you and copies no values (values are generated and appended, see section 3). Sections:

1. What this is: one paragraph on the visual tone. Today that is Tactile: white paper on a neutral gray desk, ink for the primary action and links, blue only for agent activity, focus and progress; Figtree with Noto Sans TC for text, Geist Mono for data.
2. Frame the reader's task, then pick a structure. For every one-off page, first answer "what does the reader need to decide when they open this?", then pick from a few skeletons: single-column long read (report), conclusion first plus evidence grid (proposal, benchmark), controls first (interactive planning page). Same type scale and spacing; structure follows the reader's goal.
3. Laying out evidence: numbers that are compared go on the same ruler (same column, same unit, same baseline); evidence tables run full width, never inset in a card; one main chart per page, everything else is a table.
4. Hierarchy and type: one display heading per page; `text.xl` and up only at the start of a block; body lines 60–75 characters; spacing only from the `space.*` steps, never made-up values such as 13px.
5. Copy: sentence case, not Title Case; buttons start with a verb; errors say how to fix, not sorry; numbers are tabular.
6. Motion: only ease-out and linear, no bounce; if it can stay still, keep it still.
7. Anti-patterns, each by name. This is the section agents need most: the generic SaaS row of three KPI cards; gradient cards and frosted glass; icons on colored circles; a hero image per section; two primary buttons on one page; a table stuffed into a card with a shadow; made-up hex; `useEffect` (internal agents); overshoot béziers.
8. Pre-delivery check: look at both light and dark; it must read at 375px wide; a screenshot next to the components on ui.anyknown.com shouldn't look like it came from somewhere else.

Written per `writing-and-planning-style`: no bold, short sentences, and every rule comes with one sentence of why.

## 2. `brand.css` (bounded vocabulary, plain CSS)

For pages without a bundler: one file to `<link>` and it works. The source is `src/brand.css`. At build time `tokens.css` is inlined into it (one file, no relative paths to manage) and a Google Fonts `@import` is added (Figtree, Noto Sans TC and Geist Mono are all on Google Fonts; outside pages have no `@fontsource`).

The vocabulary is small on purpose, around fifteen classes, all prefixed `ak-`:

- Skeleton: `ak-page` (max width, side margins, background), `ak-section`, `ak-grid-2` / `ak-grid-3`
- Text: `ak-display`, `ak-h1`, `ak-h2`, `ak-prose` (with styles for p / ul / ol / a / code), `ak-muted`, `ak-mono`
- Evidence: `ak-table` (full width, tabular-nums), `ak-stat` (big number plus a muted label), `ak-callout` (info / warning / danger set by a modifier)
- Actions: `ak-btn`, `ak-btn-secondary`. `ak-btn` is the solid ink primary action, drawn from the same tokens as the component library's Button, so a button on an outside page is recognizably ours.

No card, no hero, no pile of badge variants. A class that isn't in the vocabulary is not allowed; that is what "bounded" means.

Dark follows the OS, as in `tokens.css`; two classes, `.ak-theme-light` / `.ak-theme-dark`, are for pages that need to lock a theme by hand.

Output: `site/dist/brand.css`, served at `https://ui.anyknown.com/brand.css`; it is also in the package `exports` as `./brand.css`, so internal static pages can use it too.

## 3. Generation and publishing (extending `scripts/llms-txt.mjs`)

1. `design.md` = the `DESIGN.md` source + a generated appendix: the token table (read from `tokens.stylex.ts`, with light and dark columns) and the `brand.css` class list (scanned from the `.ak-` selectors in the CSS, each with a one-line purpose written in a CSS comment and scanned out). Numbers are never copied by hand; same idea as `gen:themes`.
2. Write `site/dist/design.md`. The first entry in `llms.txt` points to it, along with the `brand.css` URL and the shortest working example (a snippet of HTML: link `brand.css`, wrap the page in `ak-page`, add one `ak-h1`, one `ak-prose` and one `ak-table`).
3. `scripts/design-check.mjs` joins `pnpm check`: every `ak-*` class mentioned in DESIGN.md must exist in `brand.css`, and every class in `brand.css` must appear in DESIGN.md at least once. If the document and the vocabulary drift apart, the check fails.

## 4. Eval loop

Without this layer, the first two slowly go stale.

1. Five fixed scenarios in `site/eval/scenarios/`, each a prompt plus fake data: a usage report for product, a pricing comparison for call, a feature proposal for storage, a benchmark, and an event sign-up page. The scenarios don't change, so differences can be measured.
2. How to run: a subagent builds one page per scenario with `design.md` + `brand.css`, and one without; agent-browser takes one light and one dark screenshot of each. Follow the `e2e-subagent-user-story` rules: run in batches of at most three.
3. `scripts/design-lint.mjs` counts mechanical errors in the output HTML: made-up hex, colors other than `--ak-*`, out-of-vocabulary classes, non-token fonts, overshoot easing, inline styles. Only with numbers do we know whether the document helps; Vercel's 57% was measured this way.
4. Route the feedback, every time after a walkthrough: judgment fixes go into `DESIGN.md`; layout needs that keep coming up go into `brand.css` (with a matching line in DESIGN.md); anything a rule can catch goes into `design-lint.mjs`. Each problem lands in exactly one of the three places, the one closest to the machine.
5. Success isn't zero errors; it is the same kind of complaint showing up less often in the next round of the same kind of scenario.

## Order and acceptance

1. First draft of `DESIGN.md` → check: the CEO reads it once and agrees with every anti-pattern on the list.
2. `brand.css` → check: a plain HTML example opened through `site`, with light and dark screenshots placed next to the playground's Button, doesn't look like two brands.
3. Generation and check → check: `pnpm site:build` outputs `design.md` / `brand.css`, and `pnpm check` fails on a deliberately wrong class.
4. First round of the five scenarios → check: compare mechanical error counts with and without design.md, and record them at the end of this file as the baseline.
5. Minor release; add the two URLs to the infrastructure table in the README.

## Not doing

- No design agent in Slack; our entry point is Claude Code.
- No class-level component library (dialog, select and the like); one-off pages don't need interactive components, and when they do, they go back to `@anyknown/ui`.
- No multiple brands or themes; there is one visual language.

## First-round baseline (2026-09-02)

Two pages per scenario, built by sonnet subagents, measured with `node scripts/design-lint.mjs site/eval/out/*.html`:

| | hex | color | class | font | easing | inline |
| --- | --- | --- | --- | --- | --- | --- |
| With design.md + brand.css (5 pages total) | 0 | 0 | 0 | 0 | 0 | 0 |
| Without (5 pages total) | 79 | 9 | 229 | 7 | 0 | 17 |

All five pages without the document came out as generic SaaS: a row of KPI cards, tables stuffed into cards, icons on colored circles, all-caps eyebrows, the conclusion in a dark box at the very end. The five pages with it had zero mechanical errors and looked like they came from the same place as `example.html`.

Feedback routing for this round:

- The sign-up page's form controls had no vocabulary, so the agent left native inputs. Added `ak-field` to brand.css and one sentence to the third skeleton in section 2 of DESIGN.md.
- No judgment fixes; no new lint rules.

The next round doesn't look at this table (the pages with the document are already at zero). It looks at judgment problems: whether the conclusion is on the first screen, whether stats hold only conclusion-level numbers, whether a page has only one `ak-btn`. Lint can't catch these; a person has to look.

## Second round (2026-09-02, same day)

A person reviewed the five first-round pages built with the document and found five judgment problems: every page reflexively opened with three stats, mostly numbers already in the table; two-column full-width tables pushed the numbers to the far right; numbers in the same unit were split across several tables; callouts took up a section of their own or repeated the lede; the sign-up form wasn't on the first screen. Routing: stat misuse and two-column tables are countable, so they went into lint (`stat`, `table2`); the rest went into sections 2 and 3 of DESIGN.md. After regenerating design.md, five new pages were built:

| | stat | table2 |
| --- | --- | --- |
| Round one (with the document) | 6 | 5 |
| Round two (with the document) | 4 | 1 |

By eye: same-unit numbers were merged into one table (02), the sign-up page put the form on the first screen with 「剩 12 個名額」 ("12 seats left") next to the button (05), and the callout sat next to its table (03). What didn't converge is stats repeating table values (three in 01, one in 02). The rule was rewritten in positive form, "a stat holds a difference computed from the table: a ratio, a delta, what's left", and the next round checks this item.
