# ReasoningFold

A pill that folds away the agent's thinking: collapsed it says "思考了 N 秒", while streaming it opens and shimmers "思考中…".

## When to use

- Showing the model's reasoning above a reply, as muted italic text the reader can open.
- Streaming reasoning live: uncontrolled, `streaming` opens the fold, and it closes itself one second after streaming ends.

## When not to use

- For a tool call and its input and output, use [ToolCard](../tool-card/README.md).
- For the reply itself, use [Message](../message/README.md) or [Markdown](../markdown/README.md).

## Usage

```tsx
import { ReasoningFold } from "@anyknown/ui"

<ReasoningFold streaming={isThinking} durationSec={12}>
  {reasoningText}
</ReasoningFold>

<ReasoningFold durationSec={12} open={open} onOpenChange={setOpen}>
  {reasoningText}
</ReasoningFold>
```

Without `durationSec` the collapsed label is "思考過程". Once the person toggles the fold, it no longer opens or closes on its own. `defaultOpen` starts it open. `onOpenChange(open)` reports each click, not the automatic open and collapse; `onToggle` is deprecated. Passing `open` controls the fold: it then neither opens for streaming nor collapses after it.

## Accessibility

- The pill is a native `<button>` with `aria-expanded` and `aria-controls`; the body uses `hidden` when closed. 2px focus ring with an offset.
- When the fold closes itself after streaming and focus was inside the body, focus moves back to the pill.
- The streaming label is the visible button text, so the name changes from "思考中…" to the duration text. No live region announces it.
- `prefers-reduced-motion: reduce` stops the shimmer (the label becomes plain muted text) and removes the chevron and color transitions.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `streaming`, `thoughtFor(seconds)`, `reasoning`. Override any with `labels`; `streamingLabel` wins over `labels.streaming`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Opens or closes the fold (native `<button>`). |

## Related

- [ToolCard](../tool-card/README.md) — the other collapsible row in a turn.
- [Message](../message/README.md) — the turn that holds the fold.
