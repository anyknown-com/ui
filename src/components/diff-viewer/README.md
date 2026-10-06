# DiffViewer

A unified diff of one file: line-level additions and removals on soft success and danger backgrounds, the changed words marked inside a line, and long unchanged runs folded away.

## When to use

- Reviewing what an agent's plan changes in a file, before taking over or approving it.
- Comparing two versions of a text, such as a source string and its translation.
- Showing a new file (only `after`) or a deleted one (only `before`). The kind is inferred, or you can set it with `file.kind`.

## When not to use

- To show code that did not change, use [CodeBlock](../code-block/README.md).
- To show a raw request or response body, use [PayloadBlock](../payload-block/README.md).

## Usage

```tsx
import { DiffViewer } from "@anyknown/ui"

<DiffViewer
  file={{ path: "apps/desktop/src/memory/memory-panel.tsx", before: previousSource, after: nextSource }}
  collapseContext={3}
  foldLabel={(count) => `⋯ ${count} unchanged lines`}
/>
```

`collapseContext` is the number of unchanged lines kept around each change (3 by default, and `Infinity` never folds). `wordDiff={false}` turns off the word marks. The header shows a kind dot (modified, added or deleted), the path, and `+N −N`.

## Accessibility

- The header states the kind in visually hidden text ("已修改", "新增檔案", "已刪除") next to the `aria-hidden` color dot. The `+N −N` counts are visible text.
- The lines sit in a scroll container with `role="region"`, `aria-label` "{path} 的變更", and `tabIndex={0}`, so keyboard users can scroll it.
- Line numbers and the `+` / `−` signs are `aria-hidden`. Added and removed lines start with visually hidden "新增行" / "刪除行", so the change is not shown by color alone.
- Changed words are `<mark>` elements.
- Each fold is a native button with `aria-expanded` and `aria-controls`. The folded lines are `hidden` until it opens.
- Focus rings are 2px `focusRing` outlines. With `prefers-reduced-motion: reduce`, the fold opens without its unfold animation and transitions are instant.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. Only the fold text can change, with `foldLabel`. The kind words, line prefixes and region name cannot.
- Known gap (A11Y-DEBT): the word highlight is only a fill, at 1.15–1.23:1 against the line background.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to the scroll region, then to each fold button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On a fold: shows or hides the unchanged lines (native `<button>`). |
| Arrow keys | On the focused region: scroll it (native). |

## Related

- [CodeBlock](../code-block/README.md) — code with no changes.
- [PayloadBlock](../payload-block/README.md) — a raw request or response body.
- [DataTable](../data-table/README.md) — the dictionary editor that the translation diffs go with.
