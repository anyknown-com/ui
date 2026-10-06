# ToolCard

The receipt for one tool call: a single row with the tool's icon, a verb, its main argument, the elapsed time and a chevron that expands to the input and output. A subagent run is a variant of the same card.

## When to use

- Showing that the agent read, edited, ran, searched or fetched something, and how it went (`running`, `completed`, `error`).
- Showing an automatic retry: "3 秒後重試(第 2 / 3 次)" under a failed call.
- Showing a delegated subagent: its model, what it is doing now, and a summary when it is done.

## When not to use

- For the agent's thinking, use [ReasoningFold](../reasoning-fold/README.md).
- For a request that waits on the person, use [InteractionCard](../interaction-card/README.md).
- For a bare payload with no call around it, use [PayloadBlock](../payload-block/README.md).

## Usage

The family:

- `ToolCard` — the card. `tool` picks the icon and default verb (`read`, `edit`, `write`, `shell`, `search`, `fetch`, `subagent`; anything else gets a wrench). `shell`, `edit`, `write` and any `error` start expanded.
- `ToolInput`, `ToolOutput`, `ToolError` — the panes inside the expanded area. `ToolError` adds a copy button.
- `SubagentLine` — the second row of a subagent card: model chip, then `now` or `toolCount`.
- `SubagentSummary` — a three-line summary shown while collapsed (pass as `footer`).
- `SubagentThread`, `SubagentText` — the subagent's task and messages inside the expanded area.

```tsx
import { ToolCard, ToolError, ToolInput, ToolOutput } from "@anyknown/ui"

<ToolCard tool="read" state="completed" subtitle="src/thread/tool-part.tsx" durationMs={300}>
  <ToolInput json={{ filePath: "src/thread/tool-part.tsx" }} />
  <ToolOutput text={fileText} />
</ToolCard>

<ToolCard tool="shell" state="error" subtitle="pnpm build" retry={{ attempt: 2, max: 3, delayMs: 3000 }}>
  <ToolError text={stderr} />
</ToolCard>
```

## Accessibility

- The whole row is one native `<button>` with `aria-expanded` and `aria-controls`; the detail area uses `hidden` when collapsed. 2px focus ring inside the row.
- Completed and failed states change the icon shape (check, cross) and add hidden text from `completedLabel` / `errorLabel`, so state is not color alone.
- A persistent visually hidden `role="status"` region announces the state and the retry sentence (`runningLabel`, `completedLabel`, `errorLabel`, `retryLabel(attempt, max, seconds)`). The visible retry line is `aria-hidden` so it is not read twice.
- A clipped `subtitle` keeps its full text in `title`; expanded, it wraps instead.
- Input, output and error panes are `<pre role="group" tabIndex={0}>` named by their `label` (defaults "輸入", "輸出", "錯誤"), so wide output can be scrolled from the keyboard.
- `prefers-reduced-motion: reduce` stops the progress sweep and the subagent shimmer and removes the chevron transition; the retry spinner keeps turning at half speed.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. The default verbs and `SubagentLine`'s "N 工具" cannot be changed; use `title` for the verb.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Expands or collapses the card (native `<button>`); on `ToolError`'s button, copies the error. |
| <kbd>Tab</kbd> | Moves to the row, then into the open panes and buttons. |
| Arrow keys | Scroll a focused input, output or error pane (native scrolling). |

## Related

- [ReasoningFold](../reasoning-fold/README.md) — the other collapsible row in a turn.
- [PayloadBlock](../payload-block/README.md) — a payload with a copy button.
- [LiveDot](../live-dot/README.md) — a smaller "still running" mark.
- [Message](../message/README.md) — the turn a card sits in.
