# InteractionCard

The two cards an agent shows when it is waiting on the person — `PermissionCard` asks to do something, `DecisionCard` asks for a choice — each of which collapses into a read-only receipt once answered.

## When to use

- `PermissionCard`: the agent wants to run a command or touch something that needs consent (allow once, always allow, reject).
- `DecisionCard`: the agent needs the person to pick options or write a short answer; `blocking` when work cannot continue until they do.
- Keeping the answered card in the thread as a receipt (`resolved`).

## When not to use

- For a destructive confirmation in your own UI, use [Dialog](../dialog/README.md)'s `dialog.confirm`.
- For a form that is not a reply to the agent, use [RadioGroup](../radio/README.md), [Checkbox](../checkbox/README.md) and [Textarea](../textarea/README.md) directly.

## Usage

`DecisionCard` content is a list of `blocks`: `markdown` (shown as plain text), `options` (radios, or checkboxes with `multiple`) and `text` (a free-text box). Submit stays disabled until every `required` block has a value; when an option is `recommended`, a second button "照建議" submits the recommendation.

```tsx
import { DecisionCard, PermissionCard } from "@anyknown/ui"

<PermissionCard
  verb="Run command"
  subject="pnpm publish --access public"
  onReply={(reply) => send(reply)}
  resolved={receipt}
/>

<DecisionCard
  blocking
  title="Which pricing section ships first?"
  blocks={[
    { kind: "options", id: "variant", required: true, options: plans },
    { kind: "text", id: "note", label: "Note", placeholder: "Anything to add (optional)" },
  ]}
  onAnswer={(answer) => send(answer)}
  resolved={decision ? { text: decision } : undefined}
/>
```

`onReply` receives `"once"`, `{ always: scope }` or `{ reject: true }`. `onAnswer` receives `{ [blockId]: string | string[] }`.

## Accessibility

- `PermissionCard` is a `role="group"` named "`verb`:`subject`". The subject is a `<pre role="region" tabIndex={0}>` named by `verb`, so a long command can be scrolled from the keyboard. `DecisionCard` has no group role or name of its own.
- Reply buttons are [Button](../button/README.md)s. The shortcut glyphs (⏎, ⌘⏎, Esc) are `aria-hidden`; "總是允許" and "拒絕" carry `aria-keyshortcuts`.
- Options are native radios (inside a `RadioGroup` `<fieldset>`) or native checkboxes (inside a `<fieldset>`). With no block `label`, the group takes `aria-label` from `title`. Required groups set `aria-required`.
- A free-text block is a `<textarea>` named by its `label`, or by `title`.
- Each card has an `aria-live="polite"` paragraph that exists while pending (visually hidden, empty) and fills with the receipt when `resolved` arrives, so the answer is announced.
- Rejected receipts are marked by color only (a red check); the receipt text should say "rejected".
- `prefers-reduced-motion: reduce` removes the ring and border transitions.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. Props cover `scope`, `blockingLabel`, `submitLabel`, `recommendedLabel` and `deadlineLabel`; the reply button names, "已回覆", "決定", "已決定" and "建議" cannot be changed.
- Known gap: free-text placeholders use `textFaint` (3.75:1 in light), below 4.5:1 (see `A11Y-DEBT.md`).

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button (native `<button>`); plain Enter is never intercepted. |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> | `PermissionCard`: always allow, while focus is on one of its three buttons. |
| <kbd>Esc</kbd> | `PermissionCard`: reject, while focus is on one of its three buttons. |
| Arrow keys | Move the choice within a radio group (native radios). |
| <kbd>Space</kbd> | Toggles a checkbox option (native checkbox). |

## Related

- [HandoffReceipt](../handoff-receipt/README.md) — another read-only receipt in the thread.
- [ToolCard](../tool-card/README.md) — what the agent did, as opposed to what it asks.
- [Dialog](../dialog/README.md) — confirmations that are not part of the conversation.
