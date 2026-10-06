# LiveDot

A single breathing `signal` dot that says "still running", for the current action in a tool log or a sub thread in progress.

## When to use

- Next to the line that describes what the agent is doing right now.
- On a sub thread or task row while it is in progress.
- Inside a custom status pill (as [StatusBadge](../status-badge/README.md) does).

## When not to use

- For a determinate or indeterminate progress reading, use [Progress](../progress/README.md).
- For "loading" while content is fetched, use [Skeleton](../skeleton/README.md) or `Spinner` from [Progress](../progress/README.md).
- For a running state with words in a pill, use [StatusBadge](../status-badge/README.md).

## Usage

```tsx
import { LiveDot } from "@anyknown/ui"

<span>
  <LiveDot label="Still running" />
  Reading packages/runtime/src/loop.ts
</span>
```

Without `label` the dot is decorative; give it one when nothing else on screen says the work is running.

## Accessibility

- Without `label`: a bare `<span aria-hidden="true">`, invisible to assistive technology.
- With `label`: a `<span role="status">` that holds the decorative dot and the label in a visually hidden span. The region announces the label when it appears or changes.
- `label` is plain text from the caller; the component has no built-in words.
- The dot breathes from full opacity to 0.35 and back over 1.6 s, never fading out, so it does not read as a flashing alert.
- Under `prefers-reduced-motion: reduce` the animation stops; the dot stays visible.

## Keyboard

No keyboard interaction of its own.

## Related

- [StatusBadge](../status-badge/README.md) — a state pill built around this dot.
- [Progress](../progress/README.md) — when there is a reading to report.
- [CallBar](../call-bar/README.md) — uses a decorative live dot beside the call status.
