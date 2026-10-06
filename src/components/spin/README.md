# Spin

A 12 px spinning ring in the current text color, the one thing on a button or chip that moves while it waits.

## When to use

- Inside a [Button](../button/README.md) label while its action is in flight.
- Inside a chip or toast line that is waiting (the `a` variant of [StatusChip](../status-chip/README.md) and loading toasts use it).
- `small` (9 px) when the host text is the 16 px mono size.

## When not to use

- For a standalone loading indicator that should be announced, use `Spinner` from [Progress](../progress/README.md).
- For the agent's ongoing work in a log, use [LiveDot](../live-dot/README.md).
- For loading content with a known shape, use [Skeleton](../skeleton/README.md).

## Usage

```tsx
import { Button, Spin } from "@anyknown/ui"

<Button disabled={saving} aria-busy={saving} onClick={save}>
  {saving && <Spin />}
  Save changes
</Button>
```

`Spin` takes only `small` and `sx`. The ring uses `currentColor`, so it matches the label of whatever holds it.

## Accessibility

- A `<span aria-hidden="true">`: it has no name and is never announced.
- The caller must say that something is waiting in a way assistive technology can read, for example `aria-busy` on the button, a changed label ("Saving…"), or a toast.
- It turns once every 0.7 s. Under `prefers-reduced-motion: reduce` it stops turning and stays as a still ring.

## Keyboard

No keyboard interaction of its own.

## Related

- [Progress](../progress/README.md) — `Spinner`, the announced loading indicator.
- [Button](../button/README.md) — the usual host.
- [StatusChip](../status-chip/README.md) — its `a` variant includes a small spin.
