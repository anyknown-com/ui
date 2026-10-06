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
  labels={{ fold: (count) => `⋯ ${count} unchanged lines` }}
/>
```

`collapseContext` is the number of unchanged lines kept around each change (3 by default, and `Infinity` never folds). `wordDiff={false}` turns off the word marks. The header shows a kind dot (modified, added or deleted), the path, and `+N −N`. `labels` (`DiffViewerLabels`: `modified`, `added`, `deleted`, `addedLine`, `removedLine`, `region(path)`, `fold(count)`) overrides any built-in word; `foldLabel(count)` still works and wins over `labels.fold`.

## Accessibility

- The header states the kind in visually hidden text ("已修改" / "Modified", "新增檔案" / "Added file", "已刪除" / "Deleted") next to the `aria-hidden` color dot. The `+N −N` counts are visible text.
- The lines sit in a scroll container with `role="region"`, named "{path} 的變更" / "Changes to {path}", and `tabIndex={0}`, so keyboard users can scroll it.
- Every added or removed line keeps a visible `+` / `−` sign, and starts with visually hidden "新增行" / "Added line" or "刪除行" / "Removed line", so the change is not shown by color alone. Line numbers and signs are `aria-hidden`.
- Changed words are `<ins>` (underlined) and `<del>` (struck through) on top of the tint; in forced-colors mode they use `Mark` / `MarkText`.
- Each fold is a native button with `aria-expanded` and `aria-controls`. The folded lines are `hidden` until it opens.
- Focus rings are `focusRing` outlines. With `prefers-reduced-motion: reduce`, the fold opens without its unfold animation and the chevron turns instantly.
- All built-in words follow `<LocaleProvider>` (`zh-TW` without one, `en` for other locales); `labels` overrides single words.

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
