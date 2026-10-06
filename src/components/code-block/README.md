# CodeBlock

A sunken block of monospace code with a language label and a copy button; `InlineCode` is the same treatment for a few words inside a sentence.

## When to use

- Showing a snippet the reader may copy, with its language named.
- Showing code that is still streaming in (`streaming` adds a blinking caret).
- Marking an identifier or path inside running text with `InlineCode`.

## When not to use

- For a tool call's arguments or result, use [PayloadBlock](../payload-block/README.md): no language header, optional highlighter.
- For before/after changes, use [DiffViewer](../diff-viewer/README.md).
- For markdown that contains code, use [Markdown](../markdown/README.md); it renders fences and backticks with these components.

## Usage

```tsx
import { CodeBlock, InlineCode } from "@anyknown/ui"

<CodeBlock lang="ts" code={source} streaming={isStreaming} />

<p>The rule lives in <InlineCode>selectVisibleMessages</InlineCode>.</p>
```

Long lines scroll sideways inside the block; the page never scrolls horizontally. There is no syntax highlighting.

## Accessibility

- The code is a `<pre>` with `role="region"`, `tabIndex={0}` and `aria-label` "`<lang>` 程式碼" (or "程式碼" without `lang`), so keyboard users can reach it and scroll it. It shows a 2px focus ring.
- The copy button is a native `<button>` whose text is the label: `copyLabel` (default "複製"), then `copiedLabel` (default "已複製 ✓") for 2 seconds. The change is not announced through a live region.
- The streaming caret is `aria-hidden`; `prefers-reduced-motion: reduce` stops its blink and the button's color transition.
- `InlineCode` is a plain `<code>` and takes all `<code>` attributes.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`; pass `copyLabel` and `copiedLabel`. The region name cannot be changed.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to the copy button, then to the code region. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Copies the code (native `<button>`). |
| Arrow keys | Scroll the focused code region (native scrolling). |

## Related

- [PayloadBlock](../payload-block/README.md) — tool arguments and results.
- [Markdown](../markdown/README.md) — renders fenced code with this.
- [ToolCard](../tool-card/README.md) — tool input and output panes.
