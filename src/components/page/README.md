# Page

The words and surfaces around a settings or dashboard page's rows: the page's one heading line, section labels, sentences under a section, a code snippet, a sunken panel, and small stats.

## When to use

- The top of a page in the web shell: an `<h1>` with a summary and actions on one line (`PageHead`).
- Naming each section on the page, with an optional count at the end (`SectionLabel`).
- A sunken region for prose or free layout inside a section (`Panel`), or a command to copy (`Snippet`).
- A small reading such as "3 / 8 configured" with a thin bar (`StatLine`, `StatBar`), or one bar per day (`Bars`).

## When not to use

- For the rows in a section, use [SettingsRows](../settings-rows/README.md), [Group](../group/README.md), [Table](../table/README.md) or [List](../list/README.md). These parts only go around them.
- For code with a language label and a copy button, use [CodeBlock](../code-block/README.md). `Snippet` is a muted `<pre>` with neither.
- For task progress, use [Progress](../progress/README.md). `StatBar` is a 4px reading, not a loading bar.

## Usage

All of these assume they sit on the shell's white sheet (`layer2`).

The family:

- `PageHead` — the `<h1>` `title`, a `lead` summary beside it, then a `summary` and `actions` pushed to the right.
- `PageNumber` — a number inside a summary or stat line, mono, in the text color.
- `SectionLabel` — a section's mono `t1` label, with an `end` slot on the right. `first` reduces the top margin.
- `PageSub`, `FootNote`, `Hint` — muted sentences (under a section, under a group, above a control).
- `Snippet` — a muted mono `<pre>` that wraps.
- `Panel` — a sunken `surface` region, with no border. `padded` is for prose.
- `StatLine`, `StatBar` (`percent`, `label`, `text`), `Bars` (`values`, `tip`, `from`, `to`, `labels`).
- `Faint` — muted inline text.
- `B` and `Sub` are deprecated aliases of `PageNumber` and `PageSub`.

```tsx
import { PageHead, PageNumber, PageSub, SectionLabel, StatBar, StatLine } from "@anyknown/ui"

<PageHead
  title="Connections"
  lead={<>Connected <PageNumber>3</PageNumber> · Tools <PageNumber>49</PageNumber></>}
  summary={
    <StatLine>
      <StatBar percent={37.5} label="Configured" text="3 of 8" />
      <PageNumber>3 / 8</PageNumber>
    </StatLine>
  }
/>
<SectionLabel first end={<PageNumber>3</PageNumber>}>MCP servers</SectionLabel>
<PageSub>Servers the agent can call during a task.</PageSub>
```

## Accessibility

- `PageHead` renders the page's `<h1>`. Use one per page.
- `SectionLabel` is a `<div>`, not a heading, so sections do not appear in a screen reader's heading list. Wrap it in your own `<h2>` if the page needs that structure.
- `StatBar` is `role="progressbar"` with `aria-valuemin` 0, `aria-valuemax` 100 and a rounded `aria-valuenow`. `label` becomes its `aria-label`. It is optional in the type, but pass it. `text` becomes `aria-valuetext`.
- `Bars` is a `role="group"` named by `labels.range(from, to)` ("9/1 到 9/3" / "9/1 to 9/3"; follows `<LocaleProvider>`, and `labels` (`PageLabels`) overrides it). Each bar has only a `title` (from `tip`), so the values are not exposed to screen readers. Give the same numbers in text near the chart.
- `Snippet` is a plain `<pre>` with no copy button.
- No focus handling or motion of their own. `Bars`' range name is the only built-in word.

## Keyboard

No keyboard interaction of its own. Focusable children are whatever you pass in as `actions` or `summary`, such as a [Button](../button/README.md).

## Related

- [SettingsRows](../settings-rows/README.md) — setting rows under a `SectionLabel`.
- [Group](../group/README.md) — grouped-list settings.
- [Table](../table/README.md) — a ledger under a `SectionLabel`.
- [CodeBlock](../code-block/README.md) — code with a language label and copy.
