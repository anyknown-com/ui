# Accessibility

This guide lists the rules the components follow, what the test suite checks, and what you must provide as the caller. Each component page also has its own **Accessibility** and **Keyboard** sections with the details for that component.

## Principles the code follows

### Native elements first

Simple controls are native elements: `Button` and `IconButton` are `<button>`, `Input` and `Textarea` are `<input>` and `<textarea>`, and `Checkbox`, `Radio` and `Switch` are native inputs. They get keyboard support, form participation and screen reader semantics from the browser, with no ARIA to keep in sync.

A `Button` with `loading` is not `disabled`: it keeps its place in the tab order and its focus, so a keyboard user does not lose their position. It is `aria-busy` and `aria-disabled`, and clicks and form submits do nothing until `loading` ends.

### Base UI for complex widgets

Widgets that need roving focus, typeahead, focus trapping or nested menus use [Base UI](https://base-ui.com) (`@base-ui/react`) as the headless layer, and StyleX only for the look. Base UI backs `Dialog`, `Popover`, `Tooltip`, `Select` (a Base UI combobox), `DropdownMenu` and `Tabs`. `Slider`, `Segmented` and `ActionBar` are written by hand; see the decision log in [COMPONENTS.md](../../src/components/COMPONENTS.md).

### Keyboard patterns

- **One tab stop per group.** `Tabs`, `RadioGroup`, `Segmented` (`role="radiogroup"`) and `ActionBar` (`role="toolbar"`) take one Tab press. Arrow keys move inside the group and wrap at the ends, and <kbd>Home</kbd> / <kbd>End</kbd> jump to the first and last item. `Segmented` and `ActionBar` mirror <kbd>←</kbd> / <kbd>→</kbd> under right-to-left.
- **Overlays give focus back.** `Dialog`, `Popover`, `DropdownMenu` and `Select` return focus to the element that opened them. A dialog does this as its exit starts. <kbd>Escape</kbd> closes only the top dialog of a stack.
- **Toasts are reachable.** <kbd>F8</kbd> moves focus to the notification region and <kbd>Escape</kbd> returns it. See [State management](./state.md#keyboard).

### One visible focus ring

Every focusable part shows the same ring on `:focus-visible` (keyboard focus, not mouse clicks): a `focusRing.width` (2px) solid outline in `color.focusRing`, which is the blue `signal` color.

```ts
outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
outlineOffset: 2,
```

Controls that sit inside a frame use an offset of `-1` or `-2` so the ring is not clipped. Under `@media (forced-colors: active)` the ring uses the system `Highlight` color in `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented`, `Tabs`, `Select`, `DropdownMenu`, `Composer`, `ToolCard`, toasts and dialogs.

### Reduced motion everywhere

Every animation and transition is wrapped in `@media (prefers-reduced-motion: reduce)`, which turns it off or sets its duration to `0s`. Repeating animations (spinners, a blinking caret, pulses, shimmers) take their period from the `motion` loop tokens (`loopFast`, `blink`, `loop`, `loopSlow`) and stop under reduced motion.

Where an element should not render at all under reduced motion (the toast countdown line, `requestAnimationFrame` loops), the code uses `usePrefersReducedMotion()` from `src/lib/motion.ts`, a `useSyncExternalStore` hook on `matchMedia`. Toasts and imperative dialogs also skip their exit fade. One animation slows down instead of stopping: the `ToolCard` spinner, because the motion is the information. Reduced means reduced, not always eliminated.

### Forced colors

Windows high contrast mode (`forced-colors: active`) drops shadows and replaces author colors with system colors. The components keep their shape and state readable there:

- Floating surfaces (dialog, popover, tooltip, toast, menus and the popups in `src/lib/popup.ts`) carry a 1px border that is transparent normally and `CanvasText` under forced colors, so they keep an edge.
- `Button` draws a `ButtonText` frame, and a `GrayText` one when disabled, because its fill disappears.
- `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented` and `Tabs` draw their on, off and disabled states with `Highlight`, `HighlightText`, `ButtonText`, `Canvas` and `GrayText`.
- Highlighted options in `Select` and `DropdownMenu` use `Highlight`. Changed words in `DiffViewer` use `Mark` / `MarkText`.

Not covered yet: the danger border of an invalid `Input`, `Textarea` or `Select`, and the `Ghost` and `IconButton` frames. Check those by hand.

### Right-to-left layout

Styles use logical properties (`paddingInline`, `marginInline`, `insetInlineStart`, `insetInlineEnd`) instead of left and right, so layouts mirror under `dir="rtl"`. For example, the `Switch` thumb moves with `insetInlineStart` rather than `translate`, because `translate` is a physical x offset and would push the thumb off the track under RTL. The one deliberate exception is the `Tabs` indicator: Base UI measures its position from the physical left edge in both directions, so it is anchored with `left: 0`.

What an RTL app needs today:

- Set `dir="rtl"` on `<html>`. Portalled layers (toasts, menus, dialogs) inherit direction from the document, not from a `dir` on a wrapper.
- Base UI widgets (`Tabs`, the `DropdownMenu` submenu) read direction from Base UI's own `DirectionProvider` (`@base-ui/react/direction-provider`), not from the `dir` attribute. Wrap the app in it as well.
- `ActionBar` and `Segmented` read the direction from the page, so they need nothing more.
- Known gap: `Slider` does not mirror its arrow keys. Under RTL its fill grows toward the left, but <kbd>→</kbd> still raises the value.

### Hit targets of at least 24px

Interactive targets are at least 24 × 24px (WCAG 2.2, 2.5.8). Where a control is smaller by design, the target is enlarged without changing layout: an `::after` pseudo-element (the `×` of a `Chip`, the cancel button in `Dropzone`), a native input laid over the visible box (`Checkbox`, `Radio`, `Switch`), or a 24px `<label>` around a small checkbox (`FileRow`, `DataTable`).

### Contrast

- Readable text uses `color.text` or `color.textMuted`. `textMuted` is at least 5.36:1 on every background.
- `color.textFaint` is a 3:1 color. Use it only for things that are not text you have to read: icons, chevrons, separators, the `—` in an empty cell, and disabled states. A few text uses remain and are listed as debt.
- Control boundaries (input borders, unchecked checkbox, radio, switch track) use `color.borderControl`, which reaches 3:1.
- Color is never the only signal. A toast's colored dot comes with a visually hidden "Success:", "Error:", "Warning:" or "Info:" word. A diff line has a `+` or `−` sign and a hidden "Added line" or "Removed line" prefix, and changed words are `<ins>` (underlined) or `<del>` (struck through).

Do not hand-tune a color to fix contrast. Change the palette scales; see [Contributing](../../CONTRIBUTING.md).

### Built-in words are translated

Words that a component owns (an `aria-label` on a close button, a screen-reader prefix, a region name) come from a per-component string table in `zh-TW` and `en`, and follow `<LocaleProvider>`. Every component with such words takes a `labels` prop to override single words. See [Internationalization](./i18n.md).

## What is tested

- **axe.** `src/test/axe.ts` exports `expectNoAxeViolations(context?, options?)` and `axeViolations(...)`. They run `axe-core` on `document.body` by default, because Base UI popups, dialogs and toasts portal out of the render container. Rules that jsdom cannot answer are off: color contrast, target size, scrollable regions, and page-level rules such as `region` and `landmark-one-main`. Every component folder has at least one axe test in its own `*.test.tsx`. `src/test/a11y.test.tsx` adds a cross-component sweep and checks that the helper does report a real violation.
- **Keyboard.** Component tests drive the keyboard with `@testing-library/user-event` (`user.keyboard(...)`, `user.tab()`): arrow keys in tabs, radios, segmented controls, sliders, selects, menus and the action bar, with <kbd>Home</kbd> / <kbd>End</kbd> and wrapping where the widget has them; Escape and focus return in overlays; F8 to reach toasts; Enter and Shift+Enter in the composer.
- **Right-to-left.** `src/test/rtl.test.tsx` renders with `<html dir="rtl">` and checks which way the arrow keys move in `Tabs`, the `DropdownMenu` submenu and `ActionBar`, that `Switch`, `Slider`, `Tabs`, menus, toasts and `Composer` write no physical left or right inline style, and that the toast region still takes F8. The `Slider` key direction is pinned as a known failure (`test.fails`). jsdom has no layout, so where things land on screen still needs a real browser.
- **Forced colors.** Tests read the CSS StyleX emits under `@media (forced-colors: active)` and check the system colors for `Button`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented`, `Tabs` and every overlay surface (`src/lib/popup.test.tsx`). They check the declared colors, not the rendered result.
- **Reduced motion.** `src/test/reduced-motion.test.ts` scans every `stylex.create` in the source and fails if an `animationName` or `transitionDuration` is not wrapped in the reduced-motion media query, except for a short, named list of exceptions. It also checks that `requestAnimationFrame` animations are gated on `usePrefersReducedMotion`. Component tests that branch on reduced motion (`Toast`, `VoiceIndicator`) also render with it on.
- **The literal guard.** `src/test/literals.test.ts` fails when a component adds a raw hex color, duration, `zIndex`, font size or media-query breakpoint instead of a token. Tokens carry the contrast-checked colors and the reduced-motion-aware durations, so this keeps components on them.

Contrast and target size are measured, not tested: jsdom cannot compute either. The numbers are in the [debt list](../../src/components/A11Y-DEBT.md).

## What you must provide

The components cannot invent these for you:

- **An accessible name for every icon-only control.** `IconButton` requires `label`, which becomes both its tooltip and its accessible name. A removable `Chip` requires `removeLabel`. A table row's `Toggle` requires `label`. Anything else without visible text needs `aria-label`.
- **A label for every input.** Wrap an `Input`, `Textarea`, `PasswordInput` or `Select` in a `Field` with `label` (or pair it with a `Label`). `Field` owns the control's `id` and renders `help` and `error`; the control sets `aria-describedby`, `aria-invalid` and its required state to match. A `Select` with `multiple` inside a `Field` also needs `aria-label`. Outside a `Field`, give `Select` `aria-label` or `aria-labelledby`. `Checkbox`, `Radio` and `Switch` take their own `label`.
- **Names for regions and widgets that have no visible label.** `Progress` requires `aria-label` and `valueText` (what a screen reader reads, such as "Uploading 3 files · 64%"). `Slider` takes `label` or `aria-label`, and `valueText` when the raw number is not meaningful. `Segmented` and `DataTable` require `label`. `TabsList` requires `aria-label`, and `PopoverContent` needs either `aria-label` or `titled` with a `PopoverTitle` inside.
- **Clear words.** Button and action labels must make sense on their own. A confirm button starts with a verb and names the consequence ("Delete memory", not "OK"); `ConfirmDialog` and `dialog.confirm` have no default `confirmLabel` for this reason.
- **The page's language and direction.** Set `<html lang>` and, for a right-to-left language, `dir="rtl"` (see above). `<LocaleProvider>` sets neither.
- **Translations of your own text.** The library translates only its built-in words.

## Known debt

Gaps that are waiting on a design decision are tracked in [A11Y-DEBT.md](../../src/components/A11Y-DEBT.md). Today that is placeholder and hint text that still uses `textFaint` (the `Select` trigger and search box, the free-text box of `DecisionCard`, the separator of a `KbdGroup` sequence). Beyond that list: the forced-colors gaps and the RTL `Slider` keys above.
