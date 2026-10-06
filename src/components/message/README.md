# Message

The desktop conversation layout: a `Thread` of turns, where the person's words sit in a right-aligned sunken bubble and the agent's reply runs full width on the paper.

## When to use

- Laying out the past of a desktop agent conversation, turn by turn.
- Showing a reply that is still streaming (a blinking caret on the last text part) or not started yet (a pulsing `signal` dot).
- Hosting an [ActionBar](../action-bar/README.md), tool cards and reasoning folds inside an assistant turn.

## When not to use

- For the product shell's one-bubble-per-row layout, use [Bubble](../bubble/README.md).
- For markdown content inside a turn, put [Markdown](../markdown/README.md) in the turn; `TextPart` renders a plain paragraph.

## Usage

The family:

- `Thread` — the column of turns (24px between turns).
- `UserMessage` — the person's bubble, right aligned, at most 85% wide.
- `AssistantMessage` — a full-width turn; `streaming` and `pending` show progress.
- `TextPart` — one paragraph of reply text. `ActionBar.Copy` copies these parts.
- `useMessageBody()` — returns a ref to the current assistant turn's element, for parts that read the message (as `ActionBar.Copy` does).

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
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `userAuthor`, `assistantAuthor`, `pending`. Override any with `labels` on `UserMessage` / `AssistantMessage`; `authorLabel` and `pendingLabel` win over `labels`.
- In forced-colors mode the user bubble gets a 1px outline and the caret and pending dot paint in `CanvasText`.

## Keyboard

No keyboard interaction of its own. Focusable children are whatever the turn holds, such as [ActionBar](../action-bar/README.md) buttons or [ToolCard](../tool-card/README.md) rows.

## Related

- [ActionBar](../action-bar/README.md) — copy and regenerate under an assistant turn.
- [Bubble](../bubble/README.md) — the product shell's message row.
- [Markdown](../markdown/README.md) — rich reply content.
- [ReasoningFold](../reasoning-fold/README.md) — the thinking that came before a reply.
