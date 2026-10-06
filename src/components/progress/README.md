# Progress

Progress and loading indicators. A bar uses the blue `signal` fill because it means "the agent is working"; rings are readings (such as context use) and stay ink. The family exports:

- `Progress` — a 6 px bar. With `value` it is determinate; without it, a segment sweeps the track and a mono line below names the current stage.
- `ProgressRing` — a 60 px ring with the percentage written in its center, for an exact reading.
- `ProgressBall` — the same arc without the center text, at any `size` (default 48).
- `Spinner` — an arc that turns, at `sm` / `md` / `lg` = 18 / 28 / 40 px (default `md`), announced as a status.

## When to use

- A long agent task with a known fraction done (`Progress` with `value`) or an unknown one (`Progress` without `value`).
- A reading such as context window use (`ProgressRing`, or `ProgressBall` where space is tight).
- A region that is loading with no shape to predict (`Spinner`).

## When not to use

- For content whose layout you know, use [Skeleton](../skeleton/README.md) so the page does not jump when it arrives.
- For a waiting button, use [Spin](../spin/README.md) inside the label.
- For "still running" beside a log line, use [LiveDot](../live-dot/README.md).

## Usage

```tsx
import { Progress, ProgressRing, Spinner } from "@anyknown/ui"

<Progress value={64} aria-label="Sync thread" valueText="64% · handing off 3 messages" />
<ProgressRing value={42} aria-label="Context use" valueText="128k of context used, 42%" />
```

Without `value` the bar is indeterminate. `stages` sets the lines that cycle under it every 1.8 s:

```tsx
<Progress
  aria-label="Tidy memory"
  valueText="Tidying memory"
  stages={["Scanning the conversation", "Picking what to keep", "Merging duplicates", "Saving"]}
/>
<Spinner size="sm" label="Loading threads" />
<Spinner labels={{ loading: "Fetching" }} />
```

## Accessibility

- `Progress`, `ProgressRing` and `ProgressBall` render `role="progressbar"` with `aria-valuemin="0"` and `aria-valuemax="100"`. `aria-label` and `valueText` (sent as `aria-valuetext`) are required props.
- Determinate bars and rings set `aria-valuenow` to the rounded, clamped value (0–100). The indeterminate bar sets no `aria-valuenow` and shows no percentage, because there is no real progress to report.
- The ring's visible percentage is `aria-hidden`; the reading comes from `valueText`. The indeterminate stage line is plain visible text, not a live region.
- `Spinner` is `role="status"` with `aria-label` from `label` and the same text in a visually hidden span. The SVG is `aria-hidden`.
- Built-in words follow `<LocaleProvider>` (zh-TW, en): `Spinner`'s default label (`labels.loading`) and the indeterminate bar's four default stages (`labels.stageScan`, `stagePick`, `stageMerge`, `stageSave`). `label` wins over `labels.loading`; `stages` wins over the stage labels.
- Under `forced-colors: active` the bar track keeps a `CanvasText` border, the fill and ring arcs paint in `Highlight`, and the ring track in `GrayText`. The spinner arc uses `currentColor`.
- Under `prefers-reduced-motion: reduce` the determinate fill jumps without a transition, the indeterminate segment stops at the start of the track, and the spinner stops turning. The stage line still changes every 1.8 s.

## Keyboard

No keyboard interaction of its own.

## Related

- [Skeleton](../skeleton/README.md) — loading placeholders shaped like the content.
- [Spin](../spin/README.md) — the small unannounced ring for buttons.
- [LiveDot](../live-dot/README.md) — "still running" without a reading.
