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

- `ActionBar` — the toolbar. `visible` keeps it shown without hover; `labels` overrides its words and those of the built-in actions inside it.
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

- A `<div role="toolbar">` named "訊息動作" ("Message actions" in `en`), holding native `<button>`s with visible text. Icons are `aria-hidden`.
- Roving tabindex (WAI-ARIA toolbar pattern): the bar is one <kbd>Tab</kbd> stop, landing on the last-focused enabled button, and arrow keys move between buttons. The stop is kept valid when buttons are added, removed or disabled.
- The bar is transparent until the turn is hovered, but it becomes visible whenever focus is inside it (`:focus-within`), and it is always visible on devices without hover. 2px focus ring on each button; every button is at least 24×24px.
- Copy confirms in words: the button text becomes "已複製 ✓" for 2 seconds. The change is not announced through a live region.
- `prefers-reduced-motion: reduce` removes the fade.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `toolbar`, `copy`, `copied`, `regenerate`. Override any with `labels` on the bar; `label` on the bar and `label` / `copiedLabel` on an action win over `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves into the bar (one stop, on the last-focused button) and out again; focus reveals the bar. |
| <kbd>→</kbd> / <kbd>←</kbd> | Next / previous button, wrapping at the ends. Mirrored under `<DirectionProvider direction="rtl">` (even inside `dir="ltr"`) or a computed `direction: rtl` (<kbd>←</kbd> is next). |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button (native `<button>`). |

## Related

- [Message](../message/README.md) — the turn the bar belongs to.
- [CodeBlock](../code-block/README.md) — has its own copy button for one snippet.
