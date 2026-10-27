# SubThreadRow

A sub agent's run inside a thread, drawn the way Anyknown Desktop draws it: the title in weight 500 from the left edge with the chevron after the words, and the status as a coloured word on the line under it. No fill. The whole row opens the run. While the run is not over, what it is doing shows indented one step under it.

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

- `status` is `"queued" | "running" | "waiting" | "blocked" | "done" | "failed" | "cancelled"` (`SubThreadStatus`). `queued` and `running` read the same, in `signal` (doing); paused and stuck are `warning` (waiting for you), done is `success`, failed is `danger`, cancelled is muted. Colour sits only on the word.
- `children` is the run's content. It is drawn while the run is `queued`, `running`, `waiting` or `blocked`, and hidden once it is `done`, `failed` or `cancelled`.
- The row starts at the thread's left edge; `children` are indented one step (16px). On hover the grey status line goes darker; nothing else changes.

## Accessibility

- The row is one native `<button>` ([Ghost](../ghost/README.md)); its name is the title followed by the status word, so the status is read with it. Status is told by the word, not colour alone.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `running`, `paused`, `blocked`, `done`, `failed`, `cancelled`. Override any with `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Calls `onOpenRun` (native `<button>`). |

## Related

- [ToolGroup](../tool-group/README.md) — the agent's own tool calls.
