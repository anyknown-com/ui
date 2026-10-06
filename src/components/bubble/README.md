# Bubble

One message as the product shell's thread shows it: the person's words verbatim in a sunken bubble, or the reply as markdown on the paper with ruled tables.

## When to use

- Rendering one row of a product-shell conversation from a plain string.
- Showing a reply whose text is markdown, with tables drawn as hairline rules.

## When not to use

- For the desktop turn layout (right-aligned 85% bubble, streaming caret, action bar), use [Message](../message/README.md).
- For markdown outside a message row, use [Markdown](../markdown/README.md) directly.

## Usage

```tsx
import { Bubble } from "@anyknown/ui"

<Bubble from="user">Find places in Da'an under 25k a month</Bubble>
<Bubble from="assistant">{replyMarkdown}</Bubble>
```

`from="user"` prints `children` as typed. `from="assistant"` passes `children` to `Markdown` with `tables="ruled"`. Position and width belong to the thread around it; the bubble fills its row. The prop is `from`, not `role`, because `role` is an ARIA attribute.

## Accessibility

- A plain `<div>`; no role and no author label. The thread must make clear who is speaking if the layout alone does not.
- An assistant bubble inherits everything [Markdown](../markdown/README.md) does: real headings, lists and tables, links that open in a new tab with `rel="noopener noreferrer nofollow"`, and HTML shown as source.
- No motion.
- In forced-colors mode the user bubble gets a 1px outline so it stays apart from the reply.

## Keyboard

No keyboard interaction of its own. An assistant bubble can contain focusable links, code block copy buttons and scrollable code regions from [Markdown](../markdown/README.md).

## Related

- [Message](../message/README.md) — the desktop turn layout.
- [Markdown](../markdown/README.md) — what renders the reply.
- [Attachment](../attachment/README.md) — files a message carries.
