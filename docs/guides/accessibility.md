# Accessibility

This guide lists the rules the components follow, what the test suite checks, and what you must provide as the caller. Each component page also has its own **Accessibility** and **Keyboard** sections with the details for that component.

## Principles the code follows

### Native elements first

Simple controls are native elements: `Button` and `IconButton` are `<button>`, `Input` and `Textarea` are `<input>` and `<textarea>`, and `Checkbox`, `Radio` and `Switch` are native inputs. They get keyboard support, form participation and screen reader semantics from the browser, with no ARIA to keep in sync.

### Base UI for complex widgets

Widgets that need roving focus, typeahead, focus trapping or nested menus use [Base UI](https://base-ui.com) (`@base-ui/react`) as the headless layer, and StyleX only for the look. Today Base UI backs `Dialog`, `Popover`, `Tooltip`, `Select`, `DropdownMenu` and `Tabs`. `Slider` is written by hand on purpose; see the decision log in [COMPONENTS.md](../../src/components/COMPONENTS.md).

### One visible focus ring

Every focusable part shows the same ring on `:focus-visible` (keyboard focus, not mouse clicks): a 2px (`focusRing.width`) solid outline in `color.focusRing`, which is the blue `signal` color.

```ts
outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
outlineOffset: 2,
```

Controls that sit inside a frame use an offset of `-1` or `-2` so the ring is not clipped. In the listbox and menu of `Select` and `DropdownMenu`, and in `Composer`, the ring switches to the system `Highlight` color under `@media (forced-colors: active)`.

### Reduced motion everywhere

Every animation and transition is wrapped in `@media (prefers-reduced-motion: reduce)`, which turns it off or sets its duration to `0s`. Where an element should not render at all under reduced motion (the toast countdown line, `requestAnimationFrame` loops), the code uses `usePrefersReducedMotion()` from `src/lib/motion.ts`, a `useSyncExternalStore` hook on `matchMedia`. A few spinners slow down instead of stopping, because the motion is the information. Reduced means reduced, not always eliminated.

### Forced colors

Shadows disappear in Windows high contrast mode (`forced-colors: active`). Floating surfaces (dialog, popover, tooltip, toast, and the popups in `src/lib/popup.ts`) carry a 1px transparent border, which the system repaints with a visible color, so they keep an edge. Highlighted options in `Select` and `DropdownMenu`, and the focus ring in `Composer`, use `Highlight`.

### Right-to-left layout

Styles use logical properties (`paddingInline`, `marginInline`, `insetInlineStart`, `insetInlineEnd`) instead of left and right, so layouts mirror under `dir="rtl"`. For example, the `Switch` thumb moves with `insetInlineStart` rather than `translate`, because `translate` is a physical x offset and would push the thumb off the track under RTL. The one deliberate exception is the `Tabs` indicator: Base UI measures its position from the physical left edge in both directions, so it is anchored with `left: 0`.

There are no RTL tests yet. Check RTL by hand in the playground.

### Hit targets of at least 24px

Interactive targets are at least 24 × 24px (WCAG 2.2, 2.5.8). Where a control is smaller by design, an `::after` pseudo-element extends the target without changing layout, as on the `×` of a `Badge` chip. A checkbox, radio or switch with a `label` uses the whole label as its target. Known gaps are in the [accessibility debt list](../../src/components/A11Y-DEBT.md).

### Contrast

- Readable text uses `color.text` or `color.textMuted`. `textMuted` is at least 5.36:1 on every background.
- `color.textFaint` is a 3:1 color. Use it only for things that are not text you have to read: icons, chevrons, separators, the `—` in an empty cell, and disabled states. Placeholders are the one remaining text use, and they are listed as debt.
- Control boundaries (unchecked checkbox, radio, switch track) use `color.borderControl`, which reaches 3:1.
- Color is never the only signal. For example, a toast's colored dot comes with a visually hidden "Success:" or "Error:" word.

Do not hand-tune a color to fix contrast. Change the palette scales; see [Contributing](../../CONTRIBUTING.md).

### Built-in words are translated

Words that a component owns (an `aria-label` on a close button, a screen-reader prefix, a region name) come from a per-component string table in `zh-TW` and `en`, and follow `<LocaleProvider>`. Each instance can override single words with a `labels` prop. `Toast` uses this today; most other components still take Chinese defaults as individual props. See [Internationalization](./i18n.md).

## What is tested

- **axe.** `src/test/axe.ts` exports `expectNoAxeViolations(context?, options?)` and `axeViolations(...)`. They run `axe-core` on `document.body` by default, because Base UI popups, dialogs and toasts portal out of the render container. Rules that jsdom cannot answer are off: color contrast, target size, scrollable regions, and page-level rules such as `region` and `landmark-one-main`. Contrast and target size are therefore checked by measurement, not by tests (see the debt list). Today the helper is used by the sweep in `src/test/a11y.test.tsx`, which covers `Button`, `Input` in a `Field`, `Checkbox`, `Switch`, `Tabs`, an open `Dialog` and a `Toaster`. New components should add an axe test.
- **Keyboard.** Component tests drive the keyboard with `@testing-library/user-event` (`user.keyboard(...)`, `user.tab()`): arrow keys in tabs, radios, sliders, selects and menus, Escape and focus return in overlays, F8 to reach toasts, and so on.
- **Reduced motion.** `src/test/reduced-motion.test.ts` scans every `stylex.create` in the source and fails if an `animationName` or `transitionDuration` is not wrapped in the reduced-motion media query, except for a short, named list of exceptions. It also checks that `requestAnimationFrame` animations are gated on `usePrefersReducedMotion`. Component tests that branch on reduced motion (`Toast`, `VoiceIndicator`) also render with it on.
- **The literal guard.** `src/test/literals.test.ts` fails when a component adds a raw hex color, duration, `zIndex`, font size or media-query breakpoint instead of a token. Tokens carry the contrast-checked colors and the reduced-motion-aware durations, so this keeps components on them.

## What you must provide

The components cannot invent these for you:

- **An accessible name for every icon-only control.** `IconButton` requires `label`, which becomes both its tooltip and its accessible name. Anything else without visible text needs `aria-label`.
- **A label for every input.** Wrap an `Input`, `Textarea` or `PasswordInput` in a `Field` with `label` (or pair it with a `Label`). `Field` owns the control's `id` and renders `help` and `error`; the control sets `aria-describedby` and `aria-invalid` to match. `Checkbox`, `Radio` and `Switch` take their own `label`.
- **Names for regions and widgets that have no visible label.** `Progress` requires `aria-label` and `valueText` (what a screen reader reads, such as "Uploading 3 files · 64%"). `Slider` takes `label` or `aria-label`, and `valueText` when the raw number is not meaningful. `Segmented` requires `label`. `TabsList` requires `aria-label`, and `PopoverContent` needs either `aria-label` or `titled` with a `PopoverTitle` inside. `Select` does not read `Field`; give it `aria-label` or `aria-labelledby`.
- **Clear words.** Button and action labels must make sense on their own. A confirm button starts with a verb and names the consequence ("Delete memory", not "OK"); `ConfirmDialog` and `dialog.confirm` have no default `confirmLabel` for this reason.
- **Translations of your own text.** The library translates only its built-in words.

## Known debt

Contrast and hit-target gaps that are waiting on a design decision are tracked in [A11Y-DEBT.md](../../src/components/A11Y-DEBT.md). Today that includes placeholder text in `textFaint` (3.75:1 in light mode), the diff word highlight, and small checkboxes and buttons in `Dropzone`, `FileRow` and `DataTable`.
