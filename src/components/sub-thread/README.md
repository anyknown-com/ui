# SubThreadRow

A sub agent's run inside a thread, drawn the way Anyknown Desktop draws it: a filled pill with what the sub agent was asked to do, its status and a chevron. The whole pill opens the run. While the run is not over, what it is doing shows indented under the pill.

## When to use

- Showing a sub agent the main agent started, with where its run is: 進行中, 暫停, 卡住了, 完成, 失敗了, 取消了.
- Giving the reader one click into the run's own view.

## When not to use

- For the agent's own tool calls, use [ToolGroup](../tool-group/README.md).
- For a status on its own, outside a thread, use [StatusBadge](../status-badge/README.md) or [StatusChip](../status-chip/README.md).
- For a request that waits on the person, use [InteractionCard](../interaction-card/README.md).

## Usage

```tsx
import { SubThreadRow } from "@anyknown/ui"

<SubThreadRow title="Investigate missing retry events" status="running" onOpenRun={() => openRun(run.id)}>
  <ThreadPreview messages={run.messages} />
</SubThreadRow>

<SubThreadRow title="Investigate missing retry events" status="done" onOpenRun={() => openRun(run.id)} />
```

- `status` is `"queued" | "running" | "waiting" | "blocked" | "done" | "failed" | "cancelled"` (`SubThreadStatus`). `queued` and `running` read the same and show a [LiveDot](../live-dot/README.md); the others show a glyph in their own colour: paused and stuck in warning, done in success, failed in danger, cancelled muted.
- `children` is the run's content. It is drawn while the run is `queued`, `running`, `waiting` or `blocked`, and hidden once it is `done`, `failed` or `cancelled`.
- The row sits 16px in from the thread's edge, as in desktop. Pass `sx` to change that.

## Accessibility

- The pill is one native `<button>` ([Ghost](../ghost/README.md)); its name is the title followed by the status word, so the status is read with it. Status is told by word and glyph shape, not colour alone.
- The LiveDot is decoration here (the word 進行中 is on screen); `prefers-reduced-motion: reduce` stops its breathing.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `running`, `paused`, `blocked`, `done`, `failed`, `cancelled`. Override any with `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Calls `onOpenRun` (native `<button>`). |

## Related

- [ToolGroup](../tool-group/README.md) — the agent's own tool calls.
- [LiveDot](../live-dot/README.md) — the running mark.
