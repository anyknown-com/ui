# Message

The desktop conversation layout: a `Thread` of turns, where the person's words sit right aligned at weight 500 with no bubble, and the agent's reply runs full width from the left edge at weight 400.

## When to use

- Laying out the past of a desktop agent conversation, turn by turn.
- Showing a reply that is still streaming (a blinking caret on the last text part) or not started yet (a pulsing `signal` dot).
- Hosting an [ActionBar](../action-bar/README.md), tool cards and reasoning folds inside an assistant turn.

## When not to use

- For markdown content inside a turn, put [Markdown](../markdown/README.md) in the turn; `TextPart` renders a plain paragraph.

## Usage

The family:

- `Thread` — the column of turns (24px between turns and above the first; 16px above the first on phone). It adds no inline padding: put the `Thread` and the [Composer](../composer/README.md) in one column so they share the same left and right edges.
- `UserMessage` — the person's words, right aligned, weight 500, `type.t3`, at most 85% wide. Add the time as a `textMuted` `type.t1` line after them.
- `AssistantMessage` — a full-width turn at weight 400; `streaming` and `pending` show progress. Add the time and model as a `textMuted` `type.t1` line after the parts.
- `TextPart` — one paragraph of reply text. `ActionBar.Copy` copies these parts.
- `useMessageBody()` — returns a ref to the current assistant turn's element, for parts that read the message (as `ActionBar.Copy` does).

Inside an assistant turn the parts follow the tight rhythm:

- `TextPart` next to `TextPart`: 4px. Consecutive text parts are grouped into one run.
- Any other part is a block (a ToolGroup, SubThreadRow, ReasoningFold, InteractionCard, HandoffReceipt, PayloadBlock or CodeBlock, attachments, your own card): 12px above and below it.
- A `TextPart` counts as text only when it is a direct child of `AssistantMessage`. Wrapped in another component, it is a block.
- Do not add margins between parts; the turn spaces them.

```tsx
import { AssistantMessage, TextPart, Thread, UserMessage } from "@anyknown/ui"

<Thread>
  <UserMessage>Fold session.retrying into the footer status.</UserMessage>
  <AssistantMessage streaming={isStreaming}>
    <TextPart>{reply}</TextPart>
  </AssistantMessage>
  <AssistantMessage pending />
</Thread>
```

## Accessibility

- Plain `<div>` and `<p>` elements; no landmark or list role.
- Each turn starts with a visually hidden author label so a linear read says who spoke ("你說:" / "助理說:", "You said:" / "Assistant said:" in `en`).
- `pending` renders a `role="status"` region with a hidden pending word ("回覆中", "Replying" in `en`); the dot itself is `aria-hidden`.
- The streaming caret is `aria-hidden` and only on the last `TextPart`.
- `prefers-reduced-motion: reduce` stops the caret blink and the pending pulse.
- On devices without hover (`(hover: none)`), the action bar inside an assistant turn is always visible.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `userAuthor`, `assistantAuthor`, `pending`. Override any with `labels` on `UserMessage` / `AssistantMessage`; `pendingLabel` wins over `labels.pending`.
- In forced-colors mode the caret and pending dot paint in `CanvasText`.

## Keyboard

No keyboard interaction of its own. Focusable children are whatever the turn holds, such as [ActionBar](../action-bar/README.md) buttons or [ToolGroup](../tool-group/README.md) rows.

## Related

- [ActionBar](../action-bar/README.md) — copy and regenerate under an assistant turn.
- [Markdown](../markdown/README.md) — rich reply content.
- [ReasoningFold](../reasoning-fold/README.md) — the thinking that came before a reply.
