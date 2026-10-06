# Markdown

Renders one message's markdown — GFM tables, fenced code, task lists and TeX maths — as React elements, never through `innerHTML`.

## When to use

- Showing model or user text that is markdown, inside a message or any other reading surface.
- Showing maths on its own: `Formula` turns one TeX string into MathML.
- Letting a shell draw some fenced blocks itself (mermaid, a chart spec) through `renderBlock`.

## When not to use

- For a single snippet of code with a copy button, use [CodeBlock](../code-block/README.md).
- For a tool's raw arguments or result, use [PayloadBlock](../payload-block/README.md).
- For a whole message row in the product shell, use [Bubble](../bubble/README.md), which wraps this.

## Usage

The family:

- `Markdown` — the renderer. `children` is the markdown string; `tables` is `"grid"` (default) or `"ruled"`; `renderBlock`, `copyLabel` and `copiedLabel` pass through to fenced blocks; `labels` overrides the task-box names.
- `Formula` — TeX to MathML. `display` makes it a block.

```tsx
import { Formula, Markdown } from "@anyknown/ui"

<Markdown
  renderBlock={({ lang, code }) => (lang === "mermaid" ? <Diagram source={code} /> : undefined)}
>
  {message.text}
</Markdown>

<Formula display>{"\\int_0^1 x^2\\,dx = \\frac{1}{3}"}</Formula>
```

A single newline is a line break (`breaks: true`): this is a message, not a document. Maths is `$…$`, `\(…\)`, `$$…$$` or `\[…\]`; `$5 to $10` stays text. Returning `undefined` from `renderBlock` falls back to the built-in code block.

## Accessibility

- Real elements: `<p>`, `<h1>`–`<h3>` (deeper headings are capped at `<h3>`), `<ul>`/`<ol>`, `<blockquote>`, `<table>` with `<th>`, `<img alt>` from the markdown alt text.
- Links open in a new tab with `rel="noopener noreferrer nofollow"`; they do not announce that they open a new tab.
- Raw HTML is shown as source in a code block (block) or as text (inline), never parsed.
- Task list boxes are the design system's `Checkbox`, disabled, with `aria-label` "已完成" or "未完成" ("Done" / "Not done" in `en`).
- Fenced code blocks are [CodeBlock](../code-block/README.md): a focusable, named scroll region.
- `Formula` outputs MathML, so screen readers get real maths; display maths has `role="math"`. Until the Temml chunk loads, or if it fails, the TeX source shows instead.
- Wide tables and display maths scroll inside their own box. The table wrapper is not focusable.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): the task-box names `taskDone` and `taskOpen`, and the code blocks' own words. Override the task-box names with `labels`; `copyLabel` and `copiedLabel` override the code block button.

## Keyboard

No keyboard interaction of its own. Focusable children are links, code block copy buttons and code regions (<kbd>Tab</kbd> reaches them; arrow keys scroll a focused code region).

## Related

- [CodeBlock](../code-block/README.md) — what fenced blocks and inline code render as.
- [Bubble](../bubble/README.md) — a message row that renders its reply with this.
- [Checkbox](../checkbox/README.md) — the task list box.
