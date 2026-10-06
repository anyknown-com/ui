# Textarea

A multi-line text field with the same styling as Input, which can grow with its content up to a row limit.

## When to use

- Free text longer than one line: a bug report, a handoff note, a description.
- A field that should start small and grow as the user types (`autoGrow` with `maxRows`).

## When not to use

- For one line of text, use [Input](../input/README.md).
- For the chat message box with send, attachments and commands, use [Composer](../composer/README.md).

## Usage

```tsx
import { Field, Textarea } from "@anyknown/ui"

<Field label="Handoff note">
  <Textarea
    autoGrow
    maxRows={8}
    value={note}
    onValueChange={setNote}
    placeholder="What should the next session know?"
  />
</Field>
```

`value` / `defaultValue` work as on a native textarea. `onValueChange` gets the new string on every edit and runs after the native `onChange`, which still fires.

`autoGrow` sizes the field in this order:

1. When the browser supports `field-sizing: content`, CSS does it and no inline height is written.
2. Otherwise, when the app registered a text layout engine, the height is computed with Pretext from the computed font, line height, padding, border and content width.
3. Otherwise, the classic `height: auto` then `scrollHeight`.

Paths 2 and 3 re-measure on input, when a controlled `value` or the `placeholder` changes, and when the width changes (`ResizeObserver`). They also wait for web fonts: while fonts are loading they use `scrollHeight`, and on `fonts.ready` and every `loadingdone` they clear the layout cache and measure again. The height is clamped to `maxRows`, and the resize handle is removed (`resize: none`). Without `autoGrow` the field is 72px tall and resizes vertically.

Pretext (`@chenglou/pretext`) is an optional peer dependency; the package never imports it. Register it once at the app entry:

```ts
import * as pretext from "@chenglou/pretext"
import { setTextLayoutEngine } from "@anyknown/ui"

setTextLayoutEngine(pretext)
```

`src/lib/textLayout.ts` is the only file that calls the Pretext API. It also exports `measureTextHeight(text, { font, width, lineHeight, whiteSpace })`, which returns `null` when no engine is registered.

## Accessibility

- Renders a native `<textarea>` and forwards every native prop, including `ref`.
- The accessible name comes from the caller: a [Field](../label/README.md) `label`, a `Label` with `htmlFor`, or `aria-label`.
- Inside a Field, the Field owns the `id` and supplies `aria-describedby`, `required` and `disabled`.
- `aria-invalid="true"` is set from `invalid`, from `aria-invalid`, or from a Field `error`. The border turns `danger`, and under `forced-colors: active` the invalid frame is 2px dashed.
- Focus ring, reduced-motion handling and the 16px phone font are the same as [Input](../input/README.md).
- The placeholder uses `textMuted` (at least 4.5:1). It is still not a label: put requirements in the Field `help`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> | Inserts a new line (native `<textarea>`). |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus in and out. |

## Related

- [Input](../input/README.md) — the single-line field with the same styling.
- [Label](../label/README.md) — `Field` wires the label, help and error.
- [Composer](../composer/README.md) — the chat input built for sending messages.
