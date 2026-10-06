# Kbd

Keyboard shortcut labels: a key cap drawn with a border and a 1 px bottom shadow in the mono face. The family exports:

- `Kbd` — one key, a native `<kbd>`.
- `KbdGroup` — several keys from `keys`: a combo pressed together (no `separator`), or a sequence pressed in turn (with `separator`).
- `KbdToneContext` — a React context; set it to `"inverted"` to draw keys on a dark or ink surface.

## When to use

- Showing the shortcut for an action in a tooltip, menu or help text.
- Writing a key name inside a sentence.

## When not to use

- For a short state or category label, use [Badge](../badge/README.md).
- For inline code or a file path, use [Text](../text/README.md) with `variant="mono"`.

## Usage

```tsx
import { Kbd, KbdGroup, KbdToneContext, Text } from "@anyknown/ui"

<Text variant="caption">
  Press <KbdGroup keys={["⌘", "⇧", "H"]} /> to preview the handoff, or <Kbd>Esc</Kbd> to cancel.
</Text>

<KbdGroup keys={["g", "t"]} separator="then" />

<KbdToneContext value="inverted">
  <KbdGroup keys={["⌘", "K"]} />
</KbdToneContext>
```

`Kbd` takes every `<kbd>` prop; `KbdGroup` takes every `<span>` prop except `children`.

## Accessibility

- Each key is a native `<kbd>` element; a group is a `<span>` around them. No role or aria attributes are added.
- Screen readers read the key text as written. Symbols such as `⌘` and `⇧` are spoken differently (or not at all) by different readers; if the shortcut matters, also give it in words nearby or in the control's `aria-keyshortcuts`.
- The `separator` text is part of the reading order, so use a word ("then") rather than only a glyph.
- No motion.

## Keyboard

No keyboard interaction of its own.

## Related

- [Tooltip](../tooltip/README.md) — takes a `shortcut` to show beside the name.
- [Dropdown](../dropdown/README.md) — menus that list shortcuts.
- [Text](../text/README.md) — the sentence a key usually sits in.
