# Text

A block of text in one of the library's type styles, rendered as any element you choose.

## When to use

- Headings, body copy, captions and inline mono readings that should match the rest of the library.
- A heading whose look and level differ: pick the look with `variant` and the element with `as`.

## When not to use

- For rendered markdown from a model, use [Markdown](../markdown/README.md).
- For keyboard shortcuts, use [Kbd](../kbd/README.md).
- For a short state label, use [Badge](../badge/README.md).

## Usage

```tsx
import { Text } from "@anyknown/ui"

<Text as="h1" variant="display">Memory</Text>
<Text>Important things are kept automatically and travel with every handoff.</Text>
<Text variant="caption">Last synced 14:32</Text>
```

Variants: `display` and `title` (display face, weight 600), `body` (default, 15 px, line height 1.6), `caption` (smaller, muted), `mono`. `as` sets the element; the default is `<p>`. `sx` takes StyleX styles that replace the base and variant values; a `className` is kept but does not override them.

## Accessibility

- Renders the element in `as`, `<p>` by default. `variant="title"` or `"display"` does not make a heading; pass `as="h2"` (or the right level) so the document outline is correct.
- `caption` uses `textMuted`, which passes 4.5:1 on every background in the palette.
- No role, no aria attributes, no motion.

## Keyboard

No keyboard interaction of its own.

## Related

- [Card](../card/README.md) — the sheet text usually sits on.
- [Markdown](../markdown/README.md) — for model output with headings, lists and code.
- [Kbd](../kbd/README.md) — for shortcuts inside a sentence.
