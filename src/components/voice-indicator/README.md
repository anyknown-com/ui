# VoiceIndicator

A small pill that shows at a glance whether the voice agent is idle, listening, thinking or speaking, drawn as one animated line next to a status sentence.

## When to use

- Showing the stage of a voice turn: listening (speech to text), thinking (the model), speaking (text to speech).
- Telling the person they can interrupt: speaking reads "說話中…插話會打斷".

## When not to use

- For the bar that replaces the chatbox during a call, with timer, mute and hang up, use [CallBar](../call-bar/README.md).
- For a plain "still running" mark, use [LiveDot](../live-dot/README.md).

## Usage

```tsx
import { VoiceIndicator } from "@anyknown/ui"

<VoiceIndicator state={voiceState} level={micLevel} />
```

`state` is `"idle" | "listening" | "thinking" | "speaking"` (the exported `VoiceState`). `level` (0–1, default 0.4) sets how far the line swings while listening. `statusLabel` replaces the bold state word. The line has a fixed size, so changing state never shifts the layout.

## Accessibility

- The line is an `aria-hidden` SVG. The text is a `role="status"` span, so each state change is announced politely, for example "聆聽中…說完就送".
- Idle draws a flat gray line; the other states draw it in `signal` and also change the words, so state is not color alone.
- `prefers-reduced-motion: reduce` stops the animation frame loop and freezes the line, and shows a small uppercase mono label with the state word (`aria-hidden`, so it is not read twice).
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. `statusLabel` replaces the bold word only; "通話待命 · " and the trailing hints cannot be changed.

## Keyboard

No keyboard interaction of its own.

## Related

- [CallBar](../call-bar/README.md) — the controls during a voice call.
- [Composer](../composer/README.md) — its mic toggle starts voice input.
- [LiveDot](../live-dot/README.md) — a simpler "still running" mark.
