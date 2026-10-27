# PayloadBlock

A block of Geist Mono for what a tool was called with or gave back, indented 16px with no background or corner, a copy button at its end and no language header.

## When to use

- Showing a tool call's arguments or result, usually `JSON.stringify(value, null, 2)`.
- Showing machine output the reader may want to copy whole.
- Showing highlighted code when the shell brings its own highlighter through `highlight`.

## When not to use

- For a code snippet with a language label, use [CodeBlock](../code-block/README.md).
- For a run of tool calls with a header and one row per call, use [ToolGroup](../tool-group/README.md); it draws this block inside an open row.

## Usage

```tsx
import { PayloadBlock } from "@anyknown/ui"

<PayloadBlock code={JSON.stringify(input, null, 2)} />

<PayloadBlock code={source} highlight={(code) => <Highlighted code={code} />} />
```

The package ships no highlighter and takes no HTML string. Without `highlight` the code is a plain `<pre>`; with it, the returned node takes the `<pre>`'s place. Copy always copies `code`, not what was drawn.

## Accessibility

- The copy button is an [IconButton](../icon-button/README.md) (native `<button>`, 32px): its `aria-label` and tooltip are "複製", then "已複製" for 1.5 seconds while the icon turns into a check. The change is not announced through a live region.
- The code is a plain `<pre>` in a container that scrolls sideways. The scroll container is not focusable, so keyboard users cannot scroll a wide payload; the copy button still gives them the full text.
- No motion of its own.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `copy`, `copied`. Override either with `labels`; `copyLabel` and `copiedLabel` win over `labels`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Copies `code` (native `<button>`). |

The tooltip opens on keyboard focus; <kbd>Esc</kbd> hides it.

## Related

- [CodeBlock](../code-block/README.md) — code with a language header.
- [ToolGroup](../tool-group/README.md) — the tool call row a payload usually sits in.
- [IconButton](../icon-button/README.md) — the copy button.
