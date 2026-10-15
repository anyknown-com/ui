# ToolGroup

A run of tool calls in a thread, drawn the way Anyknown Desktop draws it: a quiet header that counts the calls and names each tool once ("用了 3 次工具：read ×2、shell"), and a framed list with one row per call. A row opens to the call's input and output.

## When to use

- Showing the tool calls an agent made between two pieces of its reply. Put consecutive calls in one group; a group starts again after text.
- Letting the reader check what a call was given and what it gave back, without the calls taking over the thread.

## When not to use

- For a sub agent's run, use [SubThreadRow](../sub-thread/README.md). A sub agent is its own row, not a call in a group.
- For one payload on its own, use [PayloadBlock](../payload-block/README.md).
- For the agent's thinking, use [ReasoningFold](../reasoning-fold/README.md).
- For a request that waits on the person, use [InteractionCard](../interaction-card/README.md).

## Usage

```tsx
import { ToolGroup } from "@anyknown/ui"

<ToolGroup
  calls={[
    { id: "c1", tool: "read", summary: "src/thread/rows.ts", input: { path: "src/thread/rows.ts" }, output: "export function …" },
    { id: "c2", tool: "read", summary: "src/thread/types.ts" },
    { id: "c3", tool: "shell", summary: "pnpm test", output: "84 passed" },
    { id: "c4", tool: "mcp_call", summary: "stripe/charges_create", risk: ["花錢"] },
  ]}
/>

<ToolGroup calls={calls} open={open} onOpenChange={setOpen} highlight={(code) => <Highlighted code={code} />} />
```

- A call is `{ id, tool, summary, input?, output?, risk? }`. `summary` is the row's one line (cut with `…`); `tool` is counted in the header and is the row's tooltip.
- `input` shows in a [PayloadBlock](../payload-block/README.md) as `JSON.stringify(input, null, 2)`; `highlight` is passed through to it. `output` is plain text under it. Leave either out and it is not drawn.
- `risk` is a list of words already in the reader's language, drawn muted after the summary and joined with " · ".
- The group starts open (`defaultOpen`, default `true`); `open` and `onOpenChange` control it. Each row starts closed and keeps its own state.

## Accessibility

- The header and each row are native `<button>`s ([Ghost](../ghost/README.md)) with `aria-expanded`. Closed content is not rendered.
- A row's `title` is the tool name, so the tooltip says which tool made the call.
- Rows sit inside a framed list with `overflow: hidden`, so their focus ring is drawn inside the row (offset −2).
- `prefers-reduced-motion: reduce` removes the header chevron's turn.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `title(count, tools)`. Override it with `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the header | Shows or hides the list. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a row | Opens or closes that call's input and output. |

## Related

- [SubThreadRow](../sub-thread/README.md) — the other kind of work row in a thread.
- [PayloadBlock](../payload-block/README.md) — the input block inside an open row.
- [ReasoningFold](../reasoning-fold/README.md) — the other fold in a turn.
