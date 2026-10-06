# HandoffReceipt

A quiet divider in the thread's past that marks a session rotation — "換班完成 · time · ctx 50% → 新 session" — and expands in place to show what was handed over.

## When to use

- Marking the point where the agent's context was handed to a new session. It is the only place the person sees a rotation.
- Letting the person check the handoff: memories kept, summary passed on, records left behind and still searchable.

## When not to use

- For a request that needs an answer, use [InteractionCard](../interaction-card/README.md).
- For a generic section divider or status line, use your own layout; this component's row text is fixed to the rotation.

## Usage

```tsx
import { HandoffReceipt } from "@anyknown/ui"

<HandoffReceipt
  at="14:32"
  ctxPercent={50}
  memory={{ count: 3, items: ["Prefers pnpm", "Deploys on Cloudflare"] }}
  ledgerCount={42}
  handoffSummary="Pricing table done; FAQ is next."
  open={open}
  onOpenChange={setOpen}
/>
```

`reason` is `"soft-threshold"` (default), `"hard-limit"` or `"state-transition"`; the last two add "(硬上限)" or "(狀態切換)" to the row text. It starts collapsed; `defaultOpen` starts it open, or control it with `open` and `onOpenChange`. It is a receipt, not a control: there are no action buttons, only the toggle.

## Accessibility

- The row is a native `<button>` with `aria-expanded` and `aria-controls`; its accessible name is the full row sentence. The dashed rules are `aria-hidden`. 2px focus ring with an offset.
- The collapsed body uses `inert`, not `hidden`: it is out of the accessibility tree and tab order but stays in layout so the open and close animation can run.
- The reason is written into the row text, not shown by color alone.
- `prefers-reduced-motion: reduce` removes the height, opacity, color and chevron transitions.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): the row words `rotated`, `newSession`, `hardLimit`, `stateTransition`, and the checks' `memoryTitle` / `memoryLabel(count, items)`, `summaryTitle` / `summaryLabel`, `ledgerTitle` / `ledgerLabel(count)`. Override any with `labels`; the same-named props win over `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Expands or collapses the summary (native `<button>`). |

## Related

- [InteractionCard](../interaction-card/README.md) — the other receipts in the thread's past.
- [ReasoningFold](../reasoning-fold/README.md) — another row that expands in place.
