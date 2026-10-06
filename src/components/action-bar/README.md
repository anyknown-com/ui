# ActionBar

The row of quiet actions under an assistant message — copy, regenerate, or your own — that fades in on hover without ever changing the turn's height.

## When to use

- Giving an assistant turn its per-message actions.
- Showing "重新生成" only on the last reply, and "複製" on every reply.

## When not to use

- For actions on a whole page or panel, use [Button](../button/README.md) or [IconButton](../icon-button/README.md) in your own layout.
- For a menu of many actions, use [DropdownMenu](../dropdown/README.md).

## Usage

The bar must be a child of [`AssistantMessage`](../message/README.md): it is positioned in the turn's reserved bottom space, and `ActionBar.Copy` reads the turn's text.

- `ActionBar` — the toolbar. `visible` keeps it shown without hover.
- `ActionBar.Copy` — copies the turn's `TextPart`s joined by blank lines, or `text` when given.
- `ActionBar.Regenerate` — calls `onRegenerate`.
- `ActionBar.Button` — a button in the same style, with an optional `icon`.

```tsx
import { ActionBar, AssistantMessage, TextPart } from "@anyknown/ui"

<AssistantMessage>
  <TextPart>{reply}</TextPart>
  <ActionBar>
    <ActionBar.Copy />
    {isLast && <ActionBar.Regenerate onRegenerate={regenerate} />}
  </ActionBar>
</AssistantMessage>
```

`ActionBar.Copy` only sees `TextPart`s. If the reply is [Markdown](../markdown/README.md), pass the source as `text`.

## Accessibility

- A `<div role="toolbar">` named by `label` (default "訊息動作"), holding native `<button>`s with visible text. Icons are `aria-hidden`.
- The bar is transparent until the turn is hovered, but it becomes visible whenever focus is inside it (`:focus-within`), and it is always visible on devices without hover. 2px focus ring on each button.
- Copy confirms in words: the button text becomes `copiedLabel` (default "已複製 ✓") for 2 seconds. The change is not announced through a live region.
- `prefers-reduced-motion: reduce` removes the fade.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`; pass `label` on the bar and `label` / `copiedLabel` on each action.
- Known gap: it has `role="toolbar"` but no arrow-key navigation; each button is its own <kbd>Tab</kbd> stop.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to each button in turn; focus reveals the bar. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button (native `<button>`). |

## Related

- [Message](../message/README.md) — the turn the bar belongs to.
- [CodeBlock](../code-block/README.md) — has its own copy button for one snippet.
