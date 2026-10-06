# Icon

Not a component: a StyleX size helper and a stroke constant, so icons you draw or import line up with the ones in the library.

- `icon` — StyleX styles `xs` / `sm` / `md` / `base` / `lg` = 12 / 14 / 16 / 18 / 20 px, read from the `iconSize` token (`@anyknown/ui/tokens.stylex`). Each sets width and height, `flex-shrink: 0` and `pointer-events: none`.
- `ICON_STROKE` — `2`, the stroke width every library glyph uses (24-unit view box, round caps and joins, `currentColor`).

## When to use

- Sizing an SVG icon (your own, or from an icon set) to one of the five sizes in use.
- Drawing a custom SVG that should match the library's line weight.

## When not to use

- For a clickable glyph, wrap the icon in [IconButton](../icon-button/README.md), or in [Button](../button/README.md) with `icon`.
- For a loading indicator, use [Spin](../spin/README.md) or [Progress](../progress/README.md)'s `Spinner`.

## Usage

```tsx
import * as stylex from "@stylexjs/stylex"
import { ICON_STROKE, icon } from "@anyknown/ui"

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={ICON_STROKE}
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
  {...stylex.props(icon.md)}
>
  <path d="M12 5v14M5 12h14" />
</svg>
```

The glyphs the library draws for itself (check, close, chevron and others) are internal and not exported.

## Accessibility

- The helper sets no role or aria attributes. Mark a decorative icon `aria-hidden="true"`, as the library's own glyphs are.
- An icon that is the only content of a control gets its name from the control: `label` on [IconButton](../icon-button/README.md), `aria-label` on [Button](../button/README.md).
- Use `stroke="currentColor"` so the icon follows the text color of its control, including the system colors under `forced-colors: active`.

## Keyboard

No keyboard interaction of its own.

## Related

- [IconButton](../icon-button/README.md) — the usual home for a lone icon.
- [Button](../button/README.md) — an icon beside a label, or `icon` for a round icon-only button.
- [EmptyState](../empty-state/README.md) — takes a line icon in its `icon` slot.
