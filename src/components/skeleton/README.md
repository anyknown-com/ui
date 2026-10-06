# Skeleton

Loading placeholders shaped like the content they stand in for, with a slow shimmer, so the layout does not jump when the content arrives. The family exports:

- `Skeleton` — one bone: a `line` (default), a `block`, or a `circle`.
- `SkeletonGroup` — wraps the bones of one loading region and announces it once.
- `ThreadSkeleton` — a ready-made thread: a user bubble and an assistant reply per message.

## When to use

- Loading a list, card or thread whose layout you already know.
- Keeping a region's height stable while its data loads.

## When not to use

- For loading with no shape to predict, use `Spinner` from [Progress](../progress/README.md).
- For long agent work with a reading, use `Progress` from [Progress](../progress/README.md).
- For a region that loaded and has nothing in it, use [EmptyState](../empty-state/README.md).

## Usage

```tsx
import { Skeleton, SkeletonGroup, ThreadSkeleton } from "@anyknown/ui"

<SkeletonGroup label="Loading memory">
  <Skeleton shape="circle" size="2rem" />
  <Skeleton />
  <Skeleton width="61%" />
  <Skeleton shape="block" height="6rem" />
</SkeletonGroup>

<ThreadSkeleton messages={2} label="Loading thread" />
```

A `line` is 0.8rem tall and full width unless you set `width` / `height`. A `circle` takes `size` (default 2.25rem). A `block` needs a `height`.

## Accessibility

- Each `Skeleton` is a `<div aria-hidden="true">`; bones are never read.
- `SkeletonGroup` is `role="status"` with `aria-label` from the required `label`, plus the same text in a visually hidden span, so the region is announced once as loading.
- Always wrap bones in a `SkeletonGroup` (or use `ThreadSkeleton`); bare bones give assistive technology no sign that anything is loading.
- `ThreadSkeleton`'s default `label` is hard-coded ("thread 載入中") and does not follow `<LocaleProvider>`; pass `label` in other locales.
- Under `prefers-reduced-motion: reduce` the shimmer gradient and animation are removed; the bones stay as flat shapes.

## Keyboard

No keyboard interaction of its own.

## Related

- [Progress](../progress/README.md) — `Spinner` and progress bars.
- [EmptyState](../empty-state/README.md) — what to show when loading finds nothing.
- [Message](../message/README.md) — the thread layout `ThreadSkeleton` mimics.
