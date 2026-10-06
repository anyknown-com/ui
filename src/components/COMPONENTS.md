# Component decision log

Why each component ended up the way it did, the dead ends, and the traps: only what the code and
the types don't already show. For the API read `dist/index.d.ts` (or each folder's `README.md`);
for the look open the [playground](https://ui.anyknown.com).

Known contrast and hit-target gaps are in [A11Y-DEBT.md](./A11Y-DEBT.md).

---

## Forms

### input / textarea
Single- and multi-line text entry. Both share one style language for border, focus and error
(`controlStyles`).

- A sunken cell in the paper: `surface` background plus a 1px `borderControl` frame (a boundary
  needs 3:1 to be seen; background alone isn't enough), `corner.control` (12px). On focus the
  frame turns `focusRing` (= `signal`) with a 2px solid `focusRing` outline around it
  (`outlineOffset: 1`). Earlier it was a 32% pale ring, under 3:1 against the background, so
  focus was invisible. When invalid the frame stays `danger` and the focus outline is still
  solid `focusRing`. Select, Textarea and PasswordInput all use the same `controlStyles`
- **The control sets `boxSizing: border-box` itself**. `<input>` / `<textarea>` get the
  browser's default content-box, so `minHeight` becomes the *content* height plus padding and
  border (the old 36px md actually grew to 54px, and `width: 100%` overflowed the container by
  26px). Don't count on the app happening to have `*{box-sizing:border-box}`. The same trap was
  fixed in Select's multiple trigger (it is a div, so it doesn't get the UA border-box)
- **Single-line controls use `type.dense` line height** (earlier `text.leadingTight`, now
  deprecated). A taller line height pushes md above the button's height and they stop lining up
  side by side. Textarea sets `type.body` back so multi-line text stays readable
- Sizes: md / sm = 40 / 32px, matching the button's default and small; textarea 72px
- **On phones (`breakpoint.phone`, `max-width: 45rem`) field text is `type.phoneInput`
  (16px)** (earlier `text.base`). iOS Safari zooms the whole page when a field under 16px gets
  focus; we don't block it with `maximum-scale`, which would also block the user's own zoom.
  Select's search row, InputCell / TextCell and Composer follow the same rule
- **`autoGrow` tries three paths in order**:
  1. `field-sizing: content` is supported (Chrome / Edge 123, Safari 26.2, Firefox 152 and
     later) → pure CSS, no inline height
  2. Not supported, but the app registered a text layout engine → Pretext computes the height
     from the computed font, line height, padding, border and content width
  3. Neither → the classic `height: auto`, then set to `scrollHeight`

  Paths 2 and 3 re-measure on input, on a controlled `value` change and on width change
  (`ResizeObserver`), clamp to `maxRows`, and show no resize handle (`resize: none`)
- **Pretext is an optional peer dependency**; this package doesn't import it. To use it,
  register it once at the app entry point:

  ```ts
  import * as pretext from "@chenglou/pretext"
  import { setTextLayoutEngine } from "@anyknown/ui"

  setTextLayoutEngine(pretext)
  ```

  `lib/textLayout.ts` is the only place that touches the Pretext API (`prepare` / `layout` /
  `clearCache`); if Pretext changes its API, only that file changes.
  `measureTextHeight(text, { font, width, lineHeight, whiteSpace })` is exported too and
  returns `null` when no engine is registered
- Trap: **widths measured before the font loads are the fallback font's**, and Pretext caches
  them by font string. While fonts are loading (`document.fonts.status === "loading"`) we use
  scrollHeight; on `fonts.ready` and on every `loadingdone` (Noto Sans TC is split by
  unicode-range, so a slice loads only when a character in it appears) we clear the cache and
  re-measure
- Trap: Pretext lays out by block rules: **a trailing newline isn't a line and an empty string
  is 0 lines**. A textarea gives both a line, so we append a space before measuring (trailing
  spaces under pre-wrap take no width)

### label
Form label with required / optional markers. Used together with `Field` (the container for
label + control + help/error), which wires `for` / `aria-describedby` automatically.

- `Field` owns its control's `id` (an `id` the control passes itself is ignored), so **one Field
  holds one control**. Checkbox / Radio / Switch bring their own label; inside a Field give them
  only `help` / `error` / `disabled`
- Field renders the error line with `role="alert"`
- Not every control reads the Field context: Select doesn't (no id, invalid, describedby or
  disabled from the Field), and Radio drops the Field's `invalid`, so an invalid radio never
  shows it

### checkbox
A hidden native `<input type="checkbox">` plus a drawn box.

- Unchecked is a 1.5px `borderControl` ring (earlier `borderStrong`, which was 1.76:1; see
  [A11Y-DEBT.md](./A11Y-DEBT.md)). Checked / indeterminate is a solid `accent` (ink) square with
  an `accentText` check (or dash), drawn with `stroke-dashoffset` in 160ms. Corner `corner.small`
- The dasharray (32) has to be longer than the path (about 18): an earlier 24 with a 28 path
  leaked a tail when unchecked
- The field context's `invalid` draws a `danger` border

### radio
Native `<input type="radio">` plus `fieldset/legend`. `variant="card"` lights up the whole card
when selected.

- Unselected is a 1.5px `borderControl` ring (earlier `borderStrong`). Selected is a solid
  `accent` (ink) circle with an `accentText` dot (same pairing as the checkbox check); the dot
  scales 0 → 1 in 160ms ease-out, no overshoot
- The `card` frame is `corner.control`

### switch
An on/off that takes effect immediately (versus Checkbox, which takes effect on submit). Native
checkbox plus `role="switch"`.

- The track is a solid pill: off `borderControl` (earlier `borderStrong`, under 3:1), on `accent`
  (ink). The thumb is a round knob floating on the track, with `shadow.rest`. Off, it is always
  white (`bg` would turn it black in dark mode); on, it is `accentText`: white in light mode; in
  dark mode the ink is light, so the knob flips to dark, otherwise a white knob on a near-white
  track can't be told apart
- The thumb slides in 180ms ease-out, **no overshoot**. A double bounce with
  `cubic-bezier(.34,1.56,.64,1)` was tried; overshoot is always out
- The knob moves `inset-inline-start`, not `translate`: translate's x is physical, so under
  `dir="rtl"` the knob would run off the track
- The usual settings-row layout: text on the left, switch on the right

### slider
One continuous quantity (how much thinking, a threshold). **No stops**: if it has stops it
should be a Radio or Select.

- **Deliberately not Base UI**: its arrow keys move one `step`, and "continuous drag, 5% per
  arrow key" would mean fighting it for keydown. A hand-written one-way `role="slider"` is more
  honest
- Arrow keys ±5% (of the range, not the step), Home / End to the ends; values always clamp,
  then snap back to the step
- Track `layer4`, fill `accent`, thumb a 1.5rem `accentText` circle with a 0.2rem `accent` ring
  and no shadow (same colors as the switch knob when on). Earlier: `borderStrong` fill and a
  pill-shaped `surfaceRaised` thumb with `shadow.rest`
- Thumb moves in `motion.normal` (200ms) `easeOut`, and **the transition is off while
  dragging** (otherwise the finger leads and the thumb lags). The fill width moves with the same
  duration and curve and is also off while dragging; if only the thumb animated, clicking the
  track would jump the fill into place first and the two wouldn't match
- `valueText` reads a label, not a number: 0.62 reads as "more" (多)
- Save on `onValueCommit`, not `onChange`: once on drag release (including pointercancel), once
  per arrow / Home / End press; nothing if the value didn't change. A PATCH on every drag frame
  means the wrong event is wired

### select
Trigger plus popover (search box on top, grouped list). The trigger uses input's
`controlStyles` directly (background, frame and focus are the input's); the popup is the float
tier (see popover); option inner corner 12 = popup 16 − 4 padding. Group titles are small
sentence-case text, not uppercase mono.

- Settled requirements: text search filter (an empty result shows an empty state with the
  query), multiple (the trigger shows chips that can be removed one by one), option grouping
  (groups left empty by the filter hide)
- The trigger is fixed at md size; Select doesn't read Field context (see label)

### dropdown
Action menu (versus Select, which picks a value). The popup is the float tier (see popover);
item inner corner 12.

- Settled requirements: nested submenus (any depth), group label, separator, checkbox item,
  shortcut hint, danger item

---

## Basics

### button
Pill (`corner.pill`). Heights lg / md / sm = 48 / 40 / 32; the default md 40 is the touch
height. xs 28 is only for crowded toolbars and isn't one of the three steps. `icon` is a circle
whose diameter follows that step's height. Hover: solid variants mix 14% toward the page
background, secondary goes one step deeper (`layer5`), ghost variants go transparent →
`accentSubtle` / `dangerSubtle`. Pressing scales to `0.98` in 120ms ease-out; no scaling under
reduced motion.

- **There is one press feedback**: `press.button` in `lib/styled.ts` (`:active:not(:disabled)`
  scales 0.98 and takes over the transition too). Button, IconButton, Ghost, ActionBar buttons,
  Composer's send, Segmented's segments, Toast's action and close, and Dropzone's file picker all
  use it, placed after the component's own styles and before `sx`. New buttons use it too;
  don't write `scale` again. The exception is the full-width GroupCell row: scaling would pull
  both sides off the card edge, so it sets `scale: 1` back

| variant | background | label color | used for |
| --- | --- | --- | --- |
| `primary` | `accent` (ink) | `accentText` | the main action, one per screen |
| `secondary` | `accentSubtle` (sunken, no frame) | `text` | secondary actions |
| `ghost` | transparent | `textMuted` | a quiet third option |
| `danger` | `dangerSolid` | `onDangerSolid` | irreversible deletion, at most one per screen |
| `dangerGhost` | transparent | `danger` | "red text on white": the meaning shows without the weight |

- children are wrapped in a `position: relative` span

### dialog
Modal dialog: scale + fade in, closes on Esc / backdrop. The danger confirm variant is for
irreversible actions (delete a memory, clear a thread).

- It is the modal tier: `surfaceRaised` background, `shadow.modal`, `corner.modal` (24), 28px
  padding, no frame. The backdrop is `color.scrim` (black at 32% in both themes), **no blur**:
  `backdrop-filter` is an anti-pattern in DESIGN.md. ConfirmContent's cancel button is secondary
- The popup is `border-box`: the `size` width includes padding, so at 375px it is never wider
  than the viewport
- Exit uses Base UI's `[data-ending-style]`: the popup fades to 0 and shrinks to 0.98, the
  backdrop fades to 0, 120ms ease-out, none under reduced motion. Base UI waits for the
  transition before unmounting, and only returns focus after unmounting; the popup carries
  `returnFocusOnExit` from `lib/popup.ts`, which returns focus to where it was before opening
  as soon as `data-ending-style` appears, without waiting for the fade. The imperative
  `dialog.open` path unmounts as soon as the store drops it; no exit animation
- ConfirmDialog inherits Button for free: Base UI's render prop merges children in
- **`confirmLabel` is required, with no default** (ConfirmDialog and `dialog.confirm`).
  "Confirm" doesn't say what happens; start with a verb and name the outcome: "Delete memory",
  "Archive thread". Only the caller knows the outcome, so there is no default. `dialog.alert`
  has a single "Got it" (知道了) that changes nothing, so it keeps a default
- ConfirmDialog, `dialog.confirm` and `dialog.alert` render as `alertdialog`: a backdrop click
  does nothing, only Esc or a button closes them. A danger confirm puts initial focus on the
  cancel button
- Three widths via `size`: `sm` (default, 28rem) / `md` (44rem) / `full` (68rem wide, 46rem
  tall, immersive), each capped at `calc(100vw - 2rem)` (height at `calc(100vh - 2rem)`).
  **At first `size` was deliberately left out**, since size combinations are endless; it was
  added because the "immersive" combination (width + height + no self-scroll) was copied as the
  same `sx` by every consumer, which makes it a step, not a preference. Anything off the steps
  still goes through `sx`
- `body` is the part that scrolls: given `body`, the popup stops scrolling itself (`overflow:
  hidden` + flex column), the header and `children` (the row of filter chips) stay pinned, and
  only `body` scrolls. In an immersive list the header must not scroll away
- **The imperative API has the same shape as toast**: `dialog.open(({ close }) =>
  <DialogContent …/>, { role? })` returns `{ id, close(result?), result }`;
  `dialog.close(id, result?)`, `dialog.closeAll()`;
  `dialog.confirm({ title, description?, confirmLabel, cancelLabel?, tone? })` →
  `Promise<boolean>`, `dialog.alert(…)` (also takes `tone`) → `Promise<void>`; both look like
  the ConfirmDialog card (shared `ConfirmContent`). The app mounts one `<Dialogs />`;
  `createDialogManager()` + `<Dialogs manager>` gives a scope, and `useDialog()` inside it gets
  that manager, outside it the default `dialog`. The controlled `Dialog` is unchanged
- State lives in `lib/store.ts`; the focus trap, inert, Esc and scroll lock are still Base UI
  Dialog's job. Only "which dialogs are open" is ours
- A `result` closed by Esc / backdrop / `closeAll` is `undefined`; for confirm it is `false`.
  Closing a dialog also closes every dialog stacked above it (settled top-down)
- **Stacking is nested rendering**: each layer's Root wraps the next one, so Base UI knows which
  is on top (Esc closes only the top). Trap we hit: when two layers mount in the same commit,
  React runs the child's effects first, and then the outer layer marks every portal but its own
  `aria-hidden`, so the top layer is visible but hidden from screen readers. So the next layer
  mounts only after this one's `onOpenChangeComplete(true)`, which is why `render` has to return
  a DialogContent (with the Popup)

### toast
Non-blocking notices: stacked bottom-right by default (`Toaster`'s `position` takes any of the
four corners), slide + fade in, auto-dismiss after 5 seconds (paused on hover), optionally one
action button ("Deleted · Undo"). danger / success are told apart by a color dot. **A toast
with an action button, or a danger toast, doesn't auto-dismiss**; it waits for the user to close
it. A keyboard user has to Tab through the whole page to reach it, and 5 seconds isn't enough
(WCAG 2.2.1). It counts down only if the caller passes `timeout` explicitly.

- It is a float-tier sheet: `surfaceRaised` background, `shadow.float`, `corner.float` (16), no
  frame. On the left a 20px slot holds the color dot (default ink, success green, danger red) or
  the loading spinner (`signal`, while `toast.promise` is pending), so the title doesn't jump
  when the state changes. A toast with a description has a 500-weight title, with the dot and
  buttons aligned to the first line. The dedupe count is a pill right of the title showing only
  the number (the `×` is visually hidden, so screen readers still hear "×N"). Action and close
  buttons are pills; the countdown is a thin pill inside the padding along the bottom edge, its
  fill retreating toward the start. Under reduced motion the countdown line is hidden (the timer
  still runs)
- **We own the state; it isn't Base UI toast**. `createToastManager()` runs on `lib/store.ts`
  (`subscribe` / `getSnapshot` / `set`; React reads it through `useSyncExternalStore`), and the
  timers live in the manager. Before changing this, know that the live region, pausing and the
  limit are now our responsibility; nobody backs us up
- API: `toast(title, opts)` / `toast.success` / `toast.danger` return an id;
  `toast.update(id, patch)`, `toast.close(id)`,
  `toast.promise(promise, { loading, success, error })` (`success` / `error` may be a string or
  a function of the value / error; returns the original promise). The
  `toastManager.add({ title, type, ... })` shape keeps Base UI's `type` field name, so old
  callers needn't change
- **Loading doesn't count down**; once settled it becomes success / danger and counts from the
  start. `update` also restarts the countdown: new content is a new message and gets the full
  time to read
- **Same-key dedupe is all the "grouping" there is**: while a toast with the same `key` is on
  screen, a new one doesn't stack; it replaces the content in place, restarts the countdown and
  increments the count (tabular digits). No fancier grouping
- `limit` (default 3): over the limit, **the oldest is dropped**, not hidden in a queue
- **Exit lives in the store**: `close` first marks the toast `leaving` (`aria-hidden` + `inert`,
  fades out in 120ms) and removes it from `toasts` only when time is up. A `leaving` toast
  doesn't count toward the limit, isn't updated by a same-key toast, and F8 skips it. Under
  reduced motion the Toaster sets the exit to 0 and removes it at once. Focus moves away the
  moment it closes, without waiting for the fade
- Pausing has three sources, any one of which pauses: hover over the viewport, focus inside the
  viewport, `document.hidden`. The countdown line is a CSS animation whose
  `animationPlayState` follows the same `paused`; restarting swaps the key via `epoch` to
  replay it. When everything closes, hover / focus are cleared too: the viewport shrinks to 0
  and mouseleave may never fire, so without clearing, the next toast would stay paused forever
- **F8 jumps focus to the notification region** (`aria-keyshortcuts="F8"`; it doesn't take the
  key when there are no toasts); Tab in to press an action or close. Esc returns focus to where
  it was before F8. Closing a toast with the keyboard keeps focus in the region; closing the
  last one returns it
- Accessibility: the viewport is a permanent `role="region"` + `aria-live="polite"`; each toast
  is `role="status"` (`aria-atomic`, so dedupe / promise updates re-read the whole toast), and
  danger is `role="alert"`. Besides the dot there is a visually hidden "Success:" / "Error:"
  prefix; every toast has a "Dismiss notification" button
- Built-in words go through `lib/i18n.tsx` (the first component migrated): `region`,
  `dismiss`, `success`, `danger`, in `zh-TW` and `en`. They follow `<LocaleProvider>`, and
  `<Toaster labels>` overrides single words (`ToastLabels`)
- The viewport's hover / focus / visibility listeners hang off a ref callback (with cleanup),
  not `useEffect`

### tooltip
Plain hint popup: appears after a 400ms delay on hover and keyboard focus (0 under reduced
motion), holds a single line of text (optionally a Kbd). **Never interactive content**. It is
the same tier as popover (float: `surfaceRaised` background, `shadow.float`), no longer an
inverted bubble; it is small, so its corner is `corner.control` (12), not 16.

### popover
The positioned-popup base: a surface card anchored to a trigger. select / dropdown / combobox
sit on top of it, and it also carries rich content directly (memory details, member cards).

- It is the float tier, defined once in `popupStyles.surface` in `lib/popup.ts`:
  `surfaceRaised` background (so it rises one step in dark mode), `shadow.float`,
  `corner.float` (16), no frame. The border is 1px transparent: under forced-colors the shadow
  disappears and the transparent border is replaced with a system color, so the popup still
  has an edge. Composer's popups use the same styles
- Exit is in the same styles: when Base UI closes it sets `[data-ending-style]`, the surface
  fades to 0 (120ms ease-out, none under reduced motion), and it unmounts after. Base UI returns
  focus only after unmounting, so a popup should carry `ref={returnFocusOnExit}` to return it as
  the exit starts. Select and Dialog do; `PopoverContent` and the dropdown don't yet, so keyboard
  focus can sit in a fading popover or menu for 120ms. Composer's popups aren't Base UI and have
  no exit
- Popover panel padding 16px, max width `min(22rem, 100vw − 2rem)`, so long text wraps on
  narrow screens

Stacking values live in the `zIndex` consts in `tokens.stylex.ts` (`lib/popup.ts` re-exports
them as `layer`); components don't write magic numbers. Base UI popups always portal to body and
compete by z-index with dialog / toast at that level, so per-component numbers leave holes:

| Layer | `zIndex` key | Value | Why here |
| --- | --- | --- | --- |
| dialog backdrop | `dialogBackdrop` | 70 | |
| dialog viewport | `dialog` | 71 | |
| popup (select / dropdown / popover) | `popup` | 75 | the popup is what you're using right now, so it must be above the dialog |
| tooltip | `tooltip` | 78 | elements inside a popup can have tooltips |
| toast | `toast` | 80 | a non-blocking notice must never be covered by a modal |

- Earlier the values were plain JS numbers in `lib/popup.ts`, which `stylex.create()` can't
  evaluate across files, so a prebuilt `layerStyles` existed for dialog / tooltip / toast. Now
  they are `stylex.defineConsts`, inlined at build time, so `zIndex: zIndex.popup` works in any
  `stylex.create`; `layerStyles` stays as a convenience
- Dead end: popup used to be 40, below the dialog's 71. A Select inside a dialog rendered its
  options (visible in the accessibility tree, keyboard-operable) but the dialog covered them;
  for mouse users it was simply broken. Raising popup above dialog doesn't affect non-dialog
  cases: a popup is a transient layer portalled to body, and Base UI closes outside popups when
  a modal opens
- Composer's sources / commands popup is `position: absolute` with `zIndex: 10`, inside its own
  stacking context; it is not part of this table

### tabs
Switches content at the same level. Underline is the default; pills are for filter-style
switching.

- Base UI 1.7 uses **manual activation** (arrow keys move focus, Enter/Space switch), and a
  disabled tab stays focusable instead of being skipped; that's the APG default. A visible
  disabled style must use `state.disabled`; `:disabled` never matches
- Underline moves in 240ms `cubic-bezier(.16,1,.3,1)`; both edges move monotonically toward the
  target, **no backtracking, no overshoot**
- pills: the track is a sunken `surface` (`corner.control`, no frame); the selected tab is a
  raised sheet (`surfaceRaised` + `shadow.rest`) that slides under the tab. Inner corner = 12 −
  4 inset = 8. A white sheet on the track is only 1.09:1, so the sheet gets an extra 1px
  `borderControl` ring (over 3:1) to show which tab is selected
- The indicator position isn't measured by us: Base UI's `Tabs.Indicator` already writes
  `--active-tab-*` as inline style, and the pill's `width` / `height` / `translate` read those
  variables
- `--active-tab-left` is a physical distance from the list's left edge, RTL included, so the
  underline and pill anchor at `left: 0`, not `insetInlineStart` (under RTL that would count
  from the right edge and the indicator would run the wrong way)
- Dead ends: a "stretchy" underline (double spring + stretch-and-sag): "way too much". Splitting
  x and width onto separate curves overshoots and pulls back, breaking "no edge may backtrack"

### badge / chip
A badge is a read-only semantic label; a chip is an interactive filter unit (removable,
pressable). Same family.

- Pill (`corner.pill`). `neutral` / `mono` are a sunken `accentSubtle` background with no frame;
  a frame is reserved for `outline`
- The chip `×`: a negative block margin keeps the round button from making the chip taller, and
  `::after` extends the hit target to 24px (WCAG 2.2) without affecting layout. The same trick
  applies to other small targets
- `removeLabel` is required only when `onRemove` is given; no × means nothing to read
- Given `onClick`, it renders a real `<button aria-pressed>` (otherwise a `<span>`). Selected is
  **inverted** (text background, bg text), not an added ring: scanning a row of filter chips,
  you must see at a glance which are on. A pressable chip doesn't forward `ref` (it would be the
  button's ref, not the span's)

### kbd
Shortcut key: `surface` background + border + a 1px bottom shadow for a key-cap feel,
`corner.small`, Geist Mono. Three arrangements: single key, combination, sequence.

### skeleton
Loading skeleton: placeholder shapes plus shimmer. Shapes must match the real layout (a thread
skeleton looks like a thread) so nothing jumps when loading finishes.

### progress
A progress bar says "the agent is working", so its fill is `signal`; ring / ball are readouts
(context usage), not work in progress, so they stay ink `accent`.

1. **bar (determinate)** — a 6px `accentSubtle` pill track with a solid `signal` fill whose
   width follows the value (updates are frequent, so a short `motion.fast` linear transition;
   expo would lag behind)
2. **bar (indeterminate)** — a 40% segment slides across in 1.8s linear; under it a mono line
   says what is happening. Stays put under reduced motion
3. **ring (context usage)** — a `border` track circle plus an `accent` arc
   (`stroke-dasharray`), with a centered `%` readout. Exact reading
4. **spinner** — a `currentColor` arc spinning at 0.8s linear
5. **ball** — similar to ring but its own drawing: no `%` readout, a band proportional to size
   (`size × 0.12`), default size 48 (ring: fixed band, default 60)

- Trap: the track is a `<span>` and must set `display: block` itself. The determinate wrapper
  is a block div, so an inline span ignores width and height and the whole bar is invisible
  (the indeterminate wrapper is a grid, whose children blockify automatically, which hid the
  bug there)
- **Zero rAF**: determinate uses a CSS transition, indeterminate a CSS animation
- Indeterminate **sets no `aria-valuenow` and shows no percentage**: there is no real progress
  to report
- spinner uses `role=status`; it doesn't take its name from content, so it needs both
  `aria-label` and visually hidden text

### empty-state
An empty state is a call to action: icon + one line + the main action. The copy always says
"what to do next", not just "there's nothing here". It is a sunken block in the paper
(`surface` background, `corner.card`), no dashed frame; the icon is a line drawing in the text
color, with no round backing.

### scrollbar
Not a component: a global stylesheet (`@anyknown/ui/scrollbar.css`). StyleX can't style the
`::-webkit-scrollbar` pseudo-elements.

- The thumb is a rounded `borderStrong` line with a 3px transparent border
  (`background-clip: padding-box`) so it floats beside the content; hover turns it `textFaint`.
  10px wide, about 4px visible
- Firefox gets `scrollbar-width: thin` and `scrollbar-color` under
  `@supports not selector(::-webkit-scrollbar)`
- Containers should add `scrollbar-gutter: stable` so content doesn't jump when the scrollbar
  appears (`tokens.css` sets it on `html`)

---

## Agent & chat (desktop AI-native)

### message
Message rhythm in the past area: user messages are right-aligned bubbles, assistant messages are
full-width plain text. turn 24px / part 8px, body `type.t3` / `type.body` (15 / 1.6).

- The user bubble is a sunken `surface`, no frame, corners 18 18 6 18 (the small corner is the
  speaker's). 18 has no corner token and is a constant in the component; the 6 is
  `corner.small`, set with a logical property (`borderEndEndRadius`), so it flips under RTL. The
  agent gets no bubble and sits directly on the paper
- The replying dot is `signal`: the agent is working
- The assistant action bar normally appears only on hover; on `(hover: none)` touch devices it
  is always shown

### bubble
The product shell's message bubble (0.9): full width, 12 top and bottom, `type.t3` /
`type.body`. The human's message is a sunken `surface`, 16 left and right, corners 18 18 6 18,
shown exactly as typed; the reply has no bubble (no background, no side padding) and uses
`Markdown tables="ruled"`.

- Not the same layout as `UserMessage` / `AssistantMessage`: those are the desktop turn (an 85%
  right-aligned bubble, full-width reply, streaming cursor, action bar); this is the shell's one
  bubble per row. Position and width belong to the thread
- The prop is `from`, not `role`: `role` is an ARIA word, and lint blocks a value that isn't an
  ARIA role

### attachment
Files attached to a message (0.9, moved from the product shell): `AttachmentGrid` is a wrapping
row of 150px squares with gap 16; `AttachmentTile` is a rest card (`surfaceRaised` background,
`shadow.rest`, `corner.card`) with the name and a one-word kind (`PDF`) on top. With `preview`
it is the image, `object-fit: cover`, and the caption turns white with a shadow; without, a
28px file glyph sits in the bottom-left corner.

- Not `FileRow`: that is a row in file management (selection, actions); this is an attachment
  visible in a message
- The image has `alt=""`: the name is already in the `figcaption`, and reading it twice is
  redundant

### tool-card
The receipt of a tool call: one row of icon + title (verb) + subtitle (main argument) +
duration + chevron; expand to see input / output. **A subagent is a variant of it, not a new
component family**.

- Rest card: `surfaceRaised` background, `shadow.rest`, `corner.card`, no frame. On failure a
  reddish 1px ring is layered over the rest ring
- A 36px icon tile on the left. While running: `signalSubtle` background with the tool icon in
  `signal` (one lucide path each for read / edit / write / shell / search / fetch / subagent,
  a wrench for others), and a pill progress bar under the title; there is no progress value, so
  a 40% `signal` segment slides at constant speed via transform, stopping under reduced motion.
  Done is a green check on `surface`, failed a red cross on `dangerSubtle`: different shapes,
  not color alone
- Why it switches to a check when done: `signal` means only "the agent is working", so when
  the work is done the tile goes back to neutral; the title's verb already says what the tool
  was
- Input / output / error are a sunken `surface` (error is `dangerSubtle`), no frame,
  `corner.small` (card corner minus padding is already ≤ 0, so the smallest step)
- Expanded content (io labels and input / output), the retry row and the subagent's second line
  all start from the title's edge (card padding + 36px tile + gap), not each from the card's
  left edge
- A subtitle that doesn't fit is cut with `…`, with the full text in `title`; expanded, it wraps
  in full, uncut
- The retry row says "when, which attempt, how many max" in one sentence: "Retrying in 3 s
  (attempt 2 / 3)" (「3 秒後重試(第 2 / 3 次)」), the same sentence on screen and in the live
  region. The sentence is `retryLabel(attempt, max, seconds)`; never the self-contradicting
  "Retrying… in 3 s"
- Opens by default for `shell` / `edit` / `write` and for any error, including a later change
  from running to error

### reasoning-fold
The fold row for the reasoning process: collapsed by default to just "Thought for N s"
(「思考了 N 秒」), expanded while streaming with a shimmering "Thinking…" label. The content is
always muted italic, a supporting voice.

- The trigger is a pill: 32px tall, `surface` background, no frame, hover one step deeper
  (`accentSubtle`)
- Expanded content has a 2px line on the left, aligned to the center of the chevron in the pill
- Collapses itself 1 s after streaming ends, unless the user toggled it; if focus was inside
  the body it moves back to the trigger. This timer is one of the three remaining `useEffect`s

### action-bar
The hover action row under an assistant message. **Its height is always reserved** (padding-
bottom + negative margin-bottom trick); hover only toggles opacity, so the turn rhythm never
jumps. Each button is a ghost pill with an `accentSubtle` background only on hover.

### code-block
Header (language label + copy button) plus a `type.code` / `type.snug` (13 / 1.45) mono body.
The language label shows `lang` as passed. Overflow **scrolls horizontally only inside the
block**; the page never scrolls sideways.

- Sunken `surface`, `corner.card`, no frame; header and body share one background with no line
  between. The copy button is a pill
- `InlineCode` is likewise `surface`, `corner.small`, no frame

### markdown
Markdown inside one message: GFM tables, fenced code, TeX math, task lists. `marked` is used
only for `lexer()` to get the token tree, and each token is turned into a React element
itself: **nothing in the component goes through `innerHTML`**, so a model that emits
`<script>` shows the source, never runs it.

- **The root must set its own `color` / `fontSize` / `lineHeight`**. The first version forgot
  `color`, so paragraphs and tables inherited the host's `body`; the playground / site
  `main.css` put `@stylex;` before `@import`, postcss dropped the @import, and `--ak-text` was an
  empty string: in the dark theme that became black text on an `rgb(32,29,24)` background.
  CodeBlock in the same component was fine because it sets its own
- Task lists use `Checkbox`, not a native `<input type=checkbox>` (which draws itself with the
  OS accent color and ignores the theme)
- Tables **size to their content**, not `minWidth: 100%`: stretching a two-column table to the
  message width just pushes the text to the far edges. The outer wrapper is the scrolling layer
- `tables="ruled"` is the in-bubble table: no frame, no background, a thin `border` line under
  the header and between rows, none under the last row; header 13px `textMuted` 500, cells
  `8px 24px 8px 0`. The default `grid` is unchanged (memory attachment bodies still use it).
  Earlier the product overrode it with `[data-bubble] th/td { … !important }`; no longer needed
- `breaks: true`. This is a message, not a document: a lone newline means the writer really
  wanted a line break
- Body `type.t3` / `type.body` (15 / 1.6), paragraphs and list items at the same line height;
  images `corner.card`
- No diagrams: mermaid alone unpacks to 84MB, and a design system shouldn't make every app that
  installs it carry that. `renderBlock({lang, code})` is the hook for a shell to plug in its
  own; without it, it falls back to a code block
- Its own `Marked` instance, not the module-level `marked`: `marked.use()` is global and would
  pollute anything else the host app parses

### formula
TeX → MathML, typeset by the browser. Lives in `markdown/Formula.tsx`. **Temml, not KaTeX**:
MathML output needs no stylesheet and no web font, while KaTeX forces every consumer to add a
CSS file plus 1MB of fonts. Screen readers also get real math rather than a pile of positioned
spans.

- Temml is imported dynamically (~250KB; most messages have no math). Until it arrives the raw
  TeX is shown (currently in the same mono / `danger` style as a parse error), so a failed load
  never leaves a blank. This lazy import is one of the three remaining `useEffect`s
- `temml.render(node)` writes straight into the DOM, never through a string: nothing in this
  package uses `dangerouslySetInnerHTML`, and math shouldn't be the first
- `$` is also money. "$5 rose to $10" is not a formula: the opening `$` can't be followed by a
  space, and the closing `$` can't be preceded by a space or followed by a digit
- A marked extension's `start()` **is where marked cuts**, not "the next `$`". If the block-level
  hint points at an inline math `$`, it splits the sentence in two (and under `breaks: true` the
  first half's trailing space becomes a `<br>`). So block and inline each have their own hint

### payload-block
Arguments a tool was called with and the result it returned (0.9, moved from the product
shell): sunken `surface`, no frame, `corner.card`, mono `type.t2` / `type.snug`, content padded
16 left, 48 right, 12 top and bottom, scrolling horizontally, with a 32px copy button in the
top-right (`IconButton`, switching from check back to copy after 1.5 s). No language header;
that's the difference from `CodeBlock`.

- **No syntax highlighting**. shiki alone is several MB of grammars and themes, and a design
  system shouldn't make every app carry it; it also takes no HTML string: the whole package
  avoids `innerHTML`. A shell that wants color passes `highlight(code)`, returning a React node
  that takes the place of the `<pre>` (shiki's `codeToHast` + `toJsxRuntime`, or the shell
  decides for itself whether to `dangerouslySetInnerHTML`); without it, it is a plain `<pre>`
- Copy always copies the original `code`, not what is drawn

### interaction-card
The two cards where the agent waits for you: Permission (a permission request) and Decision (you
must decide). Pending, it is actionable; after the reply it shrinks into an unchangeable receipt
in the past area.

- The card is a rest card (`surfaceRaised`, `shadow.rest`, `corner.card`). Its "border" is a 1px
  box-shadow ring layered on rest, not a border; the command box is a sunken `surface`. The
  supplementary text field is the exception: 1px `border` frame, `corner.control`
- Permission: warning ring, command / target in mono, Allow once (⏎) / Always allow (⌘⏎) /
  Deny (Esc), and a policy line at the bottom (why it asks; the rule outlives rotation)
- Decision: the same card comes as blocking (ink `accent` ring, "Waiting on you to continue",
  「等你才能繼續」) and non-blocking (rest only, `deadlineLabel` or the default "Waiting on you",
  「等你」; no countdown). Content is a block DSL with three kinds: `markdown` (currently drawn as
  a plain paragraph, not through `Markdown`) / `options` / `text`. Submit is disabled while a
  required block is empty; with a recommended option there is one more button, "Go with the
  recommendation"
- The three reply buttons: Allow once `primary`, Always allow `secondary`, Deny `dangerGhost`.
  Deny doesn't get solid danger (a block of red would outweigh primary), but its meaning still
  has to show: in this component's own token vocabulary danger already means "denied" (the
  rejected ✓ in the receipt row uses `color.danger`)
- Multi-select options are **frameless rows**: Checkbox has no card variant, and a frame can't
  be added from outside (the caller's className lands on the input)
- Shortcuts **intercept only Esc and ⌘⏎**; a bare ⏎ is left to the focused button. Otherwise
  tabbing to "Deny" and pressing ⏎ would allow
- The receipt's `aria-live="polite"` region is **always mounted** (an empty visually hidden
  node while pending) and gets its text only after the reply: a region mounted together with its
  text isn't announced
- Words are Chinese default props for now (Allow once / Always allow / Deny / Replied are not
  overridable yet)

### handoff-receipt
The rotation divider: a quiet thin row in the thread's past area, "Handoff complete · time ·
ctx 50% → new session", expandable to show the handoff summary. Users don't manage sessions;
**this is the only place they see a handoff**.

- Collapsed by default, with dashed lines on both sides setting it into the timeline. Expanding
  (an inline toggle, not a dialog) shows three checks: memory ("3 memories saved (…)."), summary
  ("The handoff summary went to the new session and is deleted once read."), log ("This round's
  42 log entries are still searchable and won't carry into the new session."). It uses "memory"
  like everywhere else, never internal words like "durable facts", "flushed to disk" or
  "Ledger". All three names and sentences are props (`memoryTitle` /
  `memoryLabel(count, items)`, `summaryTitle` / `summaryLabel`, `ledgerTitle` /
  `ledgerLabel(count)`); "Handoff complete" and "→ new session" are not yet
- **A receipt, not a control**: unchangeable, no action buttons
- No card: drawn straight on the paper, a `surface` pill between dashed lines (on narrow screens
  the text wraps and the pill grows taller); the expanded summary is a sunken `surface`,
  `corner.card`. When expanded the dashes turn solid and the link icon turns `accent`
- The collapsed state uses `inert`, not `hidden`: both leave the a11y tree and the tab order,
  but `inert` stays in layout so the 0fr → 1fr transition can run
- Dead ends: a hard `display: none` cut plus a one-way fade was rejected as "stiff"; expanding
  made the page taller → a scrollbar appeared → centered content shifted left (fixed with
  `html { scrollbar-gutter: stable }`, now in `tokens.css`)

### composer
The prompt bar pinned to the present line: **speaking happens in the present**. After sending,
a receipt appears above and the future area below reflows on the spot. Always usable, never
blocked by a pending card.

- A multi-line textarea that grows (scrolls inside after max-height); ⏎ sends, ⇧⏎ adds a line
- **Growth is the same machinery as `Textarea autoGrow`** (field-sizing → Pretext →
  scrollHeight): Composer attaches the `autoGrow` exported from `textarea/Textarea` with a ref
  callback and doesn't measure on its own. Clearing on send fires no input event, so the ref
  callback is keyed on `value` and re-measures when it re-attaches
- No `useEffect`: moving the caret uses `flushSync` in the handler to commit first, then
  `setSelectionRange`; `sources` queries fire from the edit / caret handlers, and an
  incrementing id discards stale responses
- Look: a sunken `surface` sheet, no frame, `corner.sheet` (20), `type.t3` / `type.body`; send
  is a 40px ink round button (falls back to `accentSubtle` when empty), and icon buttons and
  the model picker are pills
- On focus the whole sheet gets a 2px `focusRing` outline (`:focus-within`)

### attach-button / pending-files
Chatbox attachments (0.9, moved from the product shell). `AttachButton` is a 36px `IconButton`
(an 18px `+`) that opens the file picker; `PendingFiles` shows files picked but not yet sent,
one outline `Chip` per file with `×` to remove, gap 6, wrapping.

- Keyboard and screen readers reach the button; the real `<input type="file">` is `hidden` with
  `tabIndex -1`, used only via `.click()` to open the picker. After picking, its `value` is
  cleared so the same file can be picked again
- Not `Dropzone` / `UploadList`: those are a whole dashed drop area and an upload list with
  progress bars; the chatbox needs only a button and a row of chips

### call-bar
What the chatbox turns into during a call (0.9, moved from the product shell): the same sunken
`surface` sheet as Composer, `corner.sheet`, 16 on the left and 8 elsewhere; a breathing dot,
status text, mono `mm:ss`, mute, and a red hang-up.

- **Controlled; it stores no state**: `status` / `seconds` / `muted` all come from the call
  session, and `onMute(next)` hands over the value to switch to. The old version ran its own
  `setInterval` to count seconds and remembered mute itself, so both reset on remount
- `status` uses the same seven values as the product contract's `CallStatus`. The words are
  Chinese defaults, overridden through `labels` (`CallBarLabels`, merged over a local table;
  not yet `defineStrings`, so `<LocaleProvider>` doesn't switch them). The design only drew
  `listening` "In call" (通話中) and muted "Muted" (已靜音); the other five are placeholders
- Status changes **are not a live region**: a screen reader talking over the call would cover
  the other person's voice. The bar is a `role="group"` (named "Call"), and the dot is
  decorative

### voice-indicator
Shows at a glance whether the agent is listening to you, thinking, or speaking, mapping the
three stages STT → runtime LLM → TTS.

- Four states, one SVG stroke (`lib/voice.ts`, `voicePath`): `idle` a flat line / `listening`
  a sine wave scaled by the mic `level` / `thinking` a rolling coil (a telephone cord) /
  `speaking` a travelling wave. Earlier it was bars and a pulsing dot
- The drawing area has **a fixed size**, so changing state never shifts layout; the copy says
  you can interrupt ("Speaking… interrupting will cut in" = barge-in)
- The frame is a `surface` pill, no frame line; the moving line is `signal` (listening,
  thinking and speaking are all the agent working). Idle is `textFaint`
- Reduced motion: all animation off, the path freezes at a fixed frame, and a static uppercase
  mono text label appears instead

### live-dot
One breathing dot for "still running": the current action in a tool log, the in-progress
state of a sub thread.

- The dot is `signal`: "still running" is the agent working
- It breathes only down to 0.35 and back: fading to nothing reads as blinking, which is an
  alarm, not "still running"
- 1.6 s `ease-in-out`, infinite; `prefers-reduced-motion` stops it (the dot stays, just still)
- `aria-hidden` by default: a dot has nothing to read. Given `label`, it becomes `role="status"`

---

## Storage & data

### password-input
Password and vault passphrase field: show / hide toggle, a four-segment strength meter (scored
on length + character classes), a Caps Lock warning, and a mismatch error for the confirm field.

- Requirements go where they can be seen and read, not in the placeholder (it disappears as soon
  as you type, and screen readers may not read it). The meter says, when empty, "At least 12
  characters." and, when weak, "Weak, needs at least 12 characters.": state the goal, not just
  "not enough". A mismatched confirm says "Enter the same passphrase again.". In a form, put the
  requirement in the Field's `help`

### recovery-key
Recovery key card, **shown once** when a vault is created or its key reissued.

- Mono groups (split on `-`), blurred by default (shown on hover or with the show / hide
  button), one-click copy (turns into ✓), download as .txt, a warning card, and an "I've written
  it down" checkbox (`ack` / `onAckChange`) that the caller uses to **gate the primary button**;
  the component itself has no primary button
- It is a rest card (`surfaceRaised` background, `shadow.rest`, `corner.card`); the key area and
  warning are sunken blocks inside it, no frame, `corner.small`; action buttons are secondary
  pills

### dropzone
Drag-and-drop upload area: idle is a sunken `surface` background with a `borderStrong` dashed
line (`corner.card`); on dragover the dash turns `accent`, the icon `text` and the background
`accentSubtle` (dropping isn't the agent working, so no blue). **A file-picker button fallback**
(drag is never the only way in; a pill, `accentSubtle` background, no frame). An uploading list
(file name + pill progress bar + cancel; card-like, background `tone.railLayer2`, same value as
`surfaceRaised`), and failed rows.

- A failed row says the actual reason; not every failure is "too big". A rejection for size
  carries `limit` (the Dropzone's `maxSize`) and reads "Over the 10 MB limit, not uploaded. Pick
  a file under 10 MB." (the slot holds the limit, not the file size); other failures read
  "Upload failed. Try again, or pick another file."; a caller-supplied `error` wins
- Announcements go through a visually hidden `role="status"` outside the list, holding only
  "file name: state" text. The list itself isn't a live region: wrapped around the cancel
  buttons, those buttons would stay exposed in the accessibility tree while a modal is open
- The dashed line is an SVG `rect` inset 1.5px, so its `rx` is computed in CSS as
  `corner.card − 1.5px`; the corner follows the token instead of being hard-coded

### file-row
One row of a file list: type icon + name + size (mono, tabular) + modified time + actions and
a select checkbox that appear on hover; plus folder rows and busy rows (encrypting /
uploading).

- Touch devices (`(hover: none)`) have no hover, so the checkbox and action buttons are always
  shown
- A name that doesn't fit is cut with `…`, with the full name in `title` (the same goes for
  attachment tile names, `Group` row names and status, `Pill`, `Cell mono`, `Subject`: cut text
  is always visible in full on hover)
- `FileList` is a rest card on the paper: `surfaceRaised` background, the `shadow.rest` ring as
  its only edge, `corner.card`, hairlines between rows

### diff-viewer
Line-level unified diff plus inline word-level highlight. For plan review takeovers and i18n
translation comparison.

- Added / removed lines use the success / danger **subtle background** (not saturated colors);
  signs and stats use the matching text color
- Inline highlight marks only the changed words (`<mark>`, an `*Hl` color one step deeper than
  the line background)
- Code in mono `type.code` (13px); two line-number columns (before / after) in `type.t1`
  (11px) `textMuted`, not selectable
- Sunken `surface`, `corner.card`, no frame; no line between the title bar and the lines
- Collapsed unchanged runs: a "⋯ N unchanged lines" row expands and collapses, `layer4`
  background (hover `layer5`), no top or bottom line
- File title bar: kind dot (modified yellow / added green / deleted red) + path + `+N −N`
  stats; added = after only, deleted = before only

### data-table
Data table with sorting, filtering, selection and inline edit. First consumer: the i18n
dictionary editor.

- Clicking a header sorts asc → desc → none, with `aria-sort` and an accent arrow; one column
  at a time
- A filter box on top; the table doesn't filter itself. The caller owns `filter` /
  `onFilterChange`, passes the filtered `rows` and `total`, and the counter on the right reads
  `countLabel(shown, total)` (default `N / M`; mono, `aria-live`)
- Inline edit: double-click a cell → input; Enter commits, Esc cancels, **blur counts as
  commit**; an empty value shows a faint `—`
- Row selection checkboxes; the header checkbox selects all / some (indeterminate, set in one of
  the three remaining `useEffect`s)
- The table runs full width in its own section, **not inside a card**: the scroll area has no
  frame and no background. The header is a sunken `surface` strip (`corner.small` at both ends);
  column names are lowercase mono, never uppercase with tracking; a `border` hairline between
  rows (drawn at the bottom of each cell), hover rises to `layer3`
- `border-collapse: separate` + `border-spacing: 0`: the header strip's corners are drawn on
  `th`, and under collapse cell corners don't count; under separate the sticky header also no
  longer needs an `inset box-shadow` to fake its bottom line
- On narrow screens the table scrolls horizontally inside its scroll area and never widens the
  page
- Empty result: a centered message with the query plus a "Clear filter" action
- Scroll area height is `maxHeight` (default 20rem); `footer` renders after the rows, **inside
  the scroll area**, so "Load more" stays in the list and scrolls with it

### ghost / icon-button / segmented / spin / status-chip
Small controls moved from the product's ui-next: `Ghost` / `GhostLink` are text pills with no
background (background only on hover); `IconButton` carries a Tooltip (its name is the tooltip)
except while `open` (the popover it owns is showing); `Segmented` is a group of `aria-pressed`
buttons, not tabs; `Spin` is the 12px ring inside a button (9px `small`); `StatusChip`'s variant
is a one-letter status code (`r` `w` `d` `n` `a` `f` `plain`); `Pill` is the 22px mono pill on a
fold's first line.

- `IconButton` is a circle (`corner.pill`), presses to 0.98, focus ring `focusRing`, hover
  `ink.n8`
- `Segmented` speaks the same language as pills tabs: a sunken `surface` track
  (`corner.control`, no frame), the selected segment a `surfaceRaised` + `shadow.rest` sheet
  with a 1px `borderControl` ring (as in pills tabs, over 3:1 against the track). In a grid it
  still wraps only its own options
- `StatusChip`'s `a` (running) and `Pill`'s `live` dot use `signal`: the agent is working

### card
`Card` is a rest card on the paper: `surfaceRaised` background, `corner.card` (14px),
`shadow.rest`, `color.text`, padding `space.lg`. No variants. Props are `div` props plus `sx`.

- No border: the `shadow.rest` ring is its only edge
- To divide a card, use sunken `surface` blocks inside it; never a card inside a card

### text
`Text` sets running text and headings from the `type` scale. Props: `as` (default `p`),
`variant` (default `body`), `sx`. Base: `font.body`, `color.text`, `type.snug`, margin 0.

| variant | size | details |
| --- | --- | --- |
| `display` | `type.t7` (36px) | `font.display`, 600, `type.dense`, −0.01em tracking |
| `title` | `type.t5` (22px) | `font.display`, 600, `type.dense` |
| `body` | `type.t3` (15px) | line height `type.body` (1.6), per `docs/plans/02-tactile.md` |
| `caption` | `type.t2` (13px) | `textMuted` |
| `mono` | `type.t2` (13px) | `font.mono` |

### icon
Not a component but the icon conventions: `icon.ts` exports `icon` (StyleX sizes from the
`iconSize` tokens: `xs` 12 / `sm` 14 / `md` 16 / `base` 18 / `lg` 20px, each `flexShrink: 0`,
`pointerEvents: none`) and `ICON_STROKE = 2`.

- `glyphs.tsx` exports `Glyph`: 24×24 viewBox, no fill, `currentColor` stroke at
  `ICON_STROKE`, round caps and joins, `aria-hidden` by default. Named glyphs: `CheckGlyph`,
  `FileGlyph`, `CopyGlyph`, `PlusGlyph`, `XGlyph`, `MicGlyph`, `MicOffGlyph`, `PhoneOffGlyph`
- The paths are copied from lucide so moved components look the same, but **the package doesn't
  depend on lucide**; components that take an icon (e.g. `IconTile`) accept a lucide component
  from the app
- `Chevron.tsx` exports `Chevron` (`direction: "right" | "down"`), drawn on `Glyph`

### group / page / settings-rows / table
Page skeleton parts: `Group` + `GroupRow` / `GroupItem` form a list card (see the next section);
`PageHead` / `SectionLabel` / `Panel` / `Snippet` are the page's text and surfaces;
`SettingsRows` + `SettingsRow` are settings rows with the label on the left and the control on
the right; `Table` + `Tr` + `TableCell` are low-level table parts (for sorting and paging use
`DataTable`). Type from `type`, corners from `corner`. Hover rises a layer: `Tr`, `MoreRow` and
`ListRow` go to `layer3`, Group rows to `layer4`; only the table `Toggle` and `IconButton` use
an `ink` wash. The old names `Row`, `Item`, `Head`, `Cell` are deprecated aliases of
`GroupRow`, `GroupItem`, `TableHead`, `TableCell`.

- The page is the desk (`layer1`); content sits on the white main sheet (`layer2`,
  `corner.sheet`). The main sheet is the shell's job; these parts all assume they are on paper
- `SettingsRows` and `Panel` are sunken `surface` blocks in the paper (`corner.card`), **no
  frame**; a hairline between rows
- `Table` runs full width, not in a card: no background, no frame. `TableHead` is a sunken
  `surface` strip (`corner.small`), a hairline under every row (not the last), and `Detail` is
  drawn under it the same way
- For cards, see `card`

### group (grouped list)
The settings page's grouped list, moved as-is from the product shell's design-reviewed `ios/`
(0.9). `Group` has a muted `header` above, a sunken `surface` block in the paper in the middle
(`corner.card`, no frame, no shadow), and a muted `footer` below. The 0.8 framed `surface` card
had no users and was replaced outright.

- Rows in the card are cells: `GroupCell` (text, a second `detail` line, `value` / `control` on
  the right), `InputCell` (a 96px name column + a frameless Input), `TextCell` (a growing
  Textarea), `SliderCell` (name and reading on one line, slider below). 44px, 16px left and
  right, `type.t3`
- Fields inside `InputCell` / `TextCell` drop their own frame and ring; the whole row draws
  focus: on `:focus-within` the background rises to `layer4`, plus a 2px `focusRing` outline
  (`outlineOffset: -2`, drawn inside the card's corners). Background alone would be 1.09:1, and
  you couldn't tell where focus is
- The divider between rows is the cell's own `background-image`, `100% - 16px` wide, aligned
  right; **not** the card's `gap` or `border`: the first row has no line, and the line starts
  16px from the left. Currently only `GroupCell` and `InputCell` draw it; `TextCell` and
  `SliderCell` don't
- A `GroupCell` with `onPress` is a whole-row `Ghost`; it draws a chevron only when it has no
  `tone` and isn't an option (`checked`): action rows like "Add" or "Delete" and single-choice
  options aren't "go in"
- Leading items: `IconTile` (a 28px `layer4` square, `corner.small`, with a 16px glyph),
  `LetterTile` (the same square with a first letter), `ActionIcon` (an 18px glyph with no square,
  for action rows). Glyphs take a lucide component; this package doesn't depend on lucide
- The 0.8 `Item` / `Row` still work inside the new card but are deprecated in favor of
  `GroupItem` / `GroupRow`: `Item` drops its own text back to `type.t2`, and with `go` hovers
  to `layer4`
- `Status` is dot + text: `dot` takes `filled` (settled) / `hollow` (awaiting confirmation) /
  `dashed` (expired), three 7px dots, and `tone` colors the dot; `warning` / `danger` tint the
  text too, `success` / `muted` keep the text muted (calm states don't call attention). Without
  `dot` it is text only. `warn` is shorthand for `tone="warning"` + a filled dot (the 0.8 API)

### status-badge
The status pill placed over something that is running by itself (a screen the AI is operating):
`type.t2`, 4 top and bottom, 10 left and right, pill. `live` is `signalSubtle` background with
`signal` text plus a breathing `LiveDot` (the AI is working), `warn` is `warningSubtle` with
`warning` text, `plain` is `accentSubtle` with muted text.

- Not `Pill` (the 22px mono pill on a fold's first line), nor `StatusChip` (the 16px tool status
  code)
- `live` text is read once: the `LiveDot` carries `role="status"` and reads the state, and the
  visible text is `aria-hidden`

### list
A "click to open" list (memories, questions): `ListHead` is one line of `type.t1` `textMuted`
column names with a thin line under it; each `ListRow` is a `Ghost`, 40px, `type.t3`, hover
`layer3`, corner `corner.control`, no frame. Unlike `Table`: `Table` is a mono ledger; here
there is no mono at all.

- **Column widths belong to the caller**: the same grid template goes to the header and every
  row through `sx`. How it lays out on phones (hide the header, wrap a row onto two lines, 10px
  above and below each row) goes in the same `sx`: the component carries no breakpoint, so the
  shell's 640px and this package's 45rem never fight
- Rows are `minHeight: 40`, not `height: 40`: they grow when wrapping to two lines
- Rows don't inherit `Ghost`'s `nowrap`: text in a cell wraps within its column
  (`overflow-wrap: anywhere`) and never runs into the next column when narrow. The middle column
  gets `minmax(0, 1fr)`; on phones, narrow the other columns so it gets the width
- A sortable column name uses `ListSort` (a `type.t1` `Ghost`); `active` turns dark and is
  followed by ` ↓`
- `WeightDot`: the 8px dot in front of a question. `light` solid gray (no answer means the
  recommendation is followed), `soon` solid red (due soon), `heavy` a 1.5px orange hollow ring (a
  person must decide). Not `Dot` (the 6px accent dot in settings rows)
