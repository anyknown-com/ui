# Text layout

Some components need to know how tall a piece of text will be before the browser lays it out. Today that is [Textarea](../../src/components/textarea/README.md) with `autoGrow`. The package can use an optional text layout engine for this, and falls back to plain DOM measurement without one.

## Pretext

[Pretext](https://github.com/chenglou/pretext) (`@chenglou/pretext`) measures and wraps text in JavaScript. It measures segment widths once with a canvas (using the browser's own font engine), then computes line breaks and height with arithmetic. No element is created or read, so there is no layout reflow, which is the expensive part of measuring text in the DOM.

It is an **optional peer dependency** (`^0.0.9`). The package never imports it, so it adds nothing to your bundle unless you install and register it.

## Register the engine

```bash
pnpm add @chenglou/pretext
```

Register the module namespace once, at the app entry, before the first render:

```ts
// main.tsx
import * as pretext from "@chenglou/pretext"
import { setTextLayoutEngine } from "@anyknown/ui"

setTextLayoutEngine(pretext)
```

`setTextLayoutEngine(null)` removes it again. Registering or removing an engine also drops the cache of prepared texts.

## How Textarea auto-grow uses it

`<Textarea autoGrow maxRows={8} />` sizes itself in this order:

1. **CSS.** Where the browser supports `field-sizing: content`, CSS grows the field and no script runs.
2. **The engine.** Otherwise, if an engine is registered and web fonts have loaded, the height is computed from the textarea's computed font, line height, padding, border and content width, with `whiteSpace: "pre-wrap"`. An empty field, or one ending in a newline, gets a trailing space so the last line counts, as it does in a real textarea.
3. **`scrollHeight`.** Otherwise the classic way: set `height: auto`, read `scrollHeight`, set the height. This forces a layout on every keystroke.

Paths 2 and 3 re-measure on input, when a controlled `value` or the `placeholder` changes, and when the width changes. The height is clamped to `maxRows`.

**Web fonts.** A width measured with a fallback font is wrong, and Pretext caches widths per font string. So while fonts are loading, Textarea uses `scrollHeight`. When `document.fonts.ready` resolves, and on every `loadingdone` event after that, it clears the layout caches and measures again. `loadingdone` matters for Noto Sans TC, whose `unicode-range` slices load only when a character from that slice is first typed.

## Without the engine

Nothing breaks. `measureTextHeight` returns `null`, and Textarea uses `scrollHeight` (path 3). Browsers with `field-sizing: content` never reach either path. Pretext is worth adding when you support browsers without `field-sizing` and the reflow per keystroke shows up, for example in a long composer.

## Measure text yourself

The same entry point is public:

```ts
import { measureTextHeight } from "@anyknown/ui"

const height = measureTextHeight("First line\nSecond line", {
  font: '400 15px "Figtree Variable"',
  width: 320,
  lineHeight: 24,
  whiteSpace: "pre-wrap",
})
// number of px, or null when no engine is registered
```

`MeasureTextOptions`:

| Option | Type | Meaning |
| --- | --- | --- |
| `font` | `string` | Canvas font shorthand, for example `500 14px "Geist Variable"`. Build it from computed style (`fontStyle fontWeight fontSize fontFamily`) to match the DOM. |
| `width` | `number` | Content-box width in px. |
| `lineHeight` | `number` | Line height in px. |
| `whiteSpace` | `TextWhiteSpace` | `"normal"` (default) or `"pre-wrap"`, which keeps spaces, tabs and newlines. |

The result is cached per text, font and `whiteSpace` (the last 256), so calling it again with a new `width` only re-runs the cheap layout step.

The package does not export a way to clear that cache other than registering the engine again. If your own measurements must survive a font load, reset both caches yourself:

```ts
import * as pretext from "@chenglou/pretext"
import { setTextLayoutEngine } from "@anyknown/ui"

document.fonts.addEventListener("loadingdone", () => {
  pretext.clearCache()
  setTextLayoutEngine(pretext)
})
```

## Use another engine

`TextLayoutEngine` is the subset of the Pretext API the package calls, so any object with this shape works:

```ts
type TextLayoutEngine<Prepared = unknown> = {
  prepare(text: string, font: string, options?: { whiteSpace?: TextWhiteSpace }): Prepared
  layout(prepared: Prepared, maxWidth: number, lineHeight: number): { height: number; lineCount: number }
  clearCache?(): void
}
```

`src/lib/textLayout.ts` is the only file that calls the engine, so a change in Pretext's API touches only that file.

## Server rendering and tests

- `measureTextHeight` and `setTextLayoutEngine` touch no DOM. Textarea measures only in a ref callback, so server rendering never runs it.
- Pretext measures with a canvas, so it needs a browser. Register it in client code only.
- jsdom has no layout and no canvas. Don't register Pretext in tests. To test code that measures, register a fake engine with `prepare` and `layout`, as `src/lib/textLayout.test.ts` and `src/components/textarea/Textarea.test.tsx` do, and call `setTextLayoutEngine(null)` after each test.
