# CallBar

The bar a chatbox turns into during a voice call: a breathing dot, what the call is doing, a `mm:ss` timer, mute, and a red hang-up button.

## When to use

- Replacing the [Composer](../composer/README.md) while a voice call is live.
- Showing call status from the call session, with mute and hang-up controls.

## When not to use

- For a visual of listening, thinking or speaking without call controls, use [VoiceIndicator](../voice-indicator/README.md).
- For a generic toolbar, lay out [IconButton](../icon-button/README.md)s yourself.

## Usage

```tsx
import { CallBar } from "@anyknown/ui"

<CallBar
  status={call.status}
  seconds={call.seconds}
  muted={call.muted}
  onMute={(next) => call.setMuted(next)}
  onHangUp={() => call.end()}
  labels={{ hangUp: "End call" }}
/>
```

It is fully controlled and keeps no state: the call session owns `status`, `seconds` and `muted`, so remounting never resets the timer. `onMute` receives the value to switch to. `status` is one of `listening`, `user-speaking`, `transcribing`, `holding`, `thinking`, `speaking`, `interrupted` (`CallStatus`). When `muted`, the muted word replaces the status.

## Accessibility

- The bar is a `role="group"` named "通話" ("Call" in `en`). The dot is decorative (`aria-hidden`).
- Mute and hang up are [IconButton](../icon-button/README.md)s (native `<button>`) with `aria-label` and tooltip from `labels`. The mute button keeps one name, "靜音" (`labels.mute`), and reports its state with `aria-pressed`; while muted it shows the crossed-out mic on a pressed wash and keeps its tooltip. In forced-colors mode the pressed mute button gets a ring and the bar an outline.
- Status changes are deliberately not a live region: a screen reader talking during a call would cover the other voice.
- `prefers-reduced-motion: reduce` stops the dot breathing (it stays visible).
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): one word per `CallStatus`, plus `muted`, `call`, `mute` and `hangUp`. Override any with `labels`. There is no `unmute` word.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> | Moves to mute, then hang up. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button (native `<button>`); on mute, calls `onMute(!muted)`. |

## Related

- [Composer](../composer/README.md) — what the bar replaces.
- [VoiceIndicator](../voice-indicator/README.md) — the voice turn's stage.
- [LiveDot](../live-dot/README.md) — the breathing dot.
