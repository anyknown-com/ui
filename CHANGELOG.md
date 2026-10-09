# Changelog

All notable changes to `@anyknown/ui` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The package is pre-1.0, so a minor
release can break the API; every break is listed under **Breaking** and explained in
[MIGRATION.md](MIGRATION.md).

## Unreleased

Nothing yet.

## 0.12.0 — 2026-10-09

### Added

- **DataTable:** `onOpen(row)` opens a row on click or on <kbd>Enter</kbd>. With it, the rows are one tab stop with a roving tabindex, and <kbd>↑</kbd> / <kbd>↓</kbd> move focus between them. Clicks and keys on a checkbox, link, button or editable cell stay that control's. Without `onOpen` the rows behave as before.
- **DataTable:** above 1,000 rows, only the rows in and near the scroll area are mounted (TanStack Virtual, row heights measured as they mount), with `aria-rowcount` / `aria-rowindex` so screen readers report a row's place in the whole list. No new prop; 1,000 rows or fewer render as before. Adds the `@tanstack/react-virtual` dependency.

## 0.11.1 — 2026-10-09

### Fixed

- **Table:** `Tr` rows have `space.xs` (8px) padding above and below instead of a fixed 34px height, so a cell that wraps no longer touches the hairlines. Cells line up on their first line (`align-items: start`), so a chip, switch or number beside a wrapped cell stays level with its first line. `Toggle` overhangs into the padding, so rows with and without a chevron are the same height.
- **Table:** `TableHead` labels are small muted sans (`font.body`, `type.t1`, weight 500) on the same sunken strip, instead of mono. A `TableCell num` label stays right-aligned and takes the sans face. Write head labels in sentence case.
- **Tabs:** the gap between `TabsList` and the panel is `space.md` (16px), up from `space.xs`, so the panel sits clearly below the list's rule.

## 0.11.0 — 2026-10-08

### Added

- **tokens.css:** `data-theme="light"` now locks light on any element and its subtree, also on a dark OS or inside `data-theme="dark"`. Before, it only worked on `<html>`.

## 0.10.0 — 2026-10-06

The tactile redesign, self-built toast and dialog stores, built-in English words, and an
accessibility pass over every component. See [MIGRATION.md](MIGRATION.md) for upgrade steps.

### Breaking

- **Toast:** `toast` runs on a self-built store instead of Base UI. `toastManager` and `<Toaster manager>` now take a `ToastManager` from our `createToastManager()`, not Base UI's `Toast.createToastManager()`.
- **Toast:** `ToastManager.add()` keeps `title` / `description` / `type` / `timeout` but drops Base UI's `actionProps` and `priority`; pass `action: { label, onClick }` instead.
- **Toast:** toasts over `<Toaster limit>` are dropped (their `onClose` runs) instead of kept hidden.
- **ConfirmDialog:** `confirmLabel` is required; the `"確認"` default is gone. Pass a verb that names the consequence.
- **Segmented:** the control is a `role="radiogroup"` of `role="radio"` segments with `aria-checked` and a roving tabindex, instead of buttons with `aria-pressed`. Only the checked segment is a tab stop; tests that query `getByRole("button")` must query `"radio"`.
- **CallBar:** `CallBarLabels` no longer has `unmute`. The mute button keeps the name `labels.mute` and reports its state with `aria-pressed`.
- **PasswordInput:** the `hideLabel` prop is removed, and the new `PasswordInputLabels` has no `hide`. The reveal toggle keeps one name, `showLabel` / `labels.show` ("顯示 passphrase" / "Show passphrase"), in both states and reports the state with `aria-pressed`.

### Added

#### Overlays and feedback

- **Dialog:** an imperative dialog store: `dialog.open(render, options?)` returns a `DialogHandle` (`id`, `close`, `result`); `dialog.confirm(options)` resolves a boolean; `dialog.alert(options)` resolves when dismissed; `dialog.close(id, result?)` and `dialog.closeAll()`.
- **Dialog:** `<Dialogs>` host renders the store, with `manager`, `children` and `labels` props; `createDialogManager()`, `dialogManager` and `useDialog()` scope it.
- **Dialog:** `ConfirmOptions.confirmLabel` is required on `dialog.confirm`; `AlertOptions.confirmLabel` defaults to the locale's `acknowledge` word.
- **Dialog:** exported types `DialogLabels`, `DialogManager`, `DialogHandle`, `DialogControls`, `DialogRender`, `DialogOptions` (`role: "dialog" | "alertdialog"`), `DialogEntry` (with `closing`), `ConfirmOptions`, `AlertOptions`, `DialogsProps`.
- **Dialog:** `labels` on `<ConfirmDialog>` and `<Dialogs>` (`cancel`, `acknowledge`).
- **Toast:** `createToastManager()` is exported, with the `ToastManager` type (`add`, `update`, `close`, `closeAll`, `promise`, `subscribe`, `getSnapshot`).
- **Toast:** `toast.update(id, patch)` and `toast.promise(promise, { loading, success, error })`; each state takes a `ToastMessage` (`string | { title, description? }`) or, for `success` / `error`, a function returning one. A loading toast does not time out.
- **Toast:** `toast.warning()` and `toast.info()`; `ToastType` is `"default" | "success" | "danger" | "warning" | "info"`.
- **Toast:** `toast.closeAll()`.
- **Toast:** `ToastOptions.key` updates a toast already on screen in place, restarts its timer and shows a ×N count.
- **Toast:** `ToastOptions.onClose` and `ToastOptions.onAutoClose`.
- **Toast:** `<Toaster children>`: `useToast()` inside returns the nearest `<Toaster>`'s manager.
- **Toast:** `<Toaster labels>` and exported types `ToastLabels`, `ToastAction`, `ToastInput`, `ToastUpdate`, `ToastType`, `ToastPromiseMessages`, `ToastMessage`, `ToastRecord`, `ToastState`.
- **Select:** `required`, `invalid` and `aria-describedby` props; inside a `Field`, Select takes its id, label, help, error, `required` and `disabled` from the field.
- **Select:** `labels` (`placeholder`, `searchPlaceholder`, `searchLabel`, `remove`, `empty`).

#### Forms and controls

- **Button:** `loading` prop: a spinner replaces the label, the button is `aria-busy` and `aria-disabled`, stays focusable and ignores activation.
- **Button:** `size="lg"` (48px).
- **Slider:** `defaultValue`, `onValueChange` and `largeStep`; `value` is optional (uncontrolled use). PageUp / PageDown move by `largeStep` (default 10% of the range), Home / End go to the ends.
- **SliderCell:** `defaultValue` and `onValueChange`.
- **Segmented:** `defaultValue`, `onValueChange`, `disabled` and per-option `disabled`; `value` is optional. Arrow keys wrap and follow the reading direction; Home / End go to the ends.
- **Input**, **Textarea:** `onValueChange(value)`.
- **Textarea:** `autoGrow` now also works where CSS `field-sizing` is unsupported: it measures with a registered text layout engine, else `scrollHeight`, and clamps to `maxRows`.
- **Text layout:** `setTextLayoutEngine()`, `measureTextHeight()` and the types `TextLayoutEngine`, `MeasureTextOptions`, `TextWhiteSpace`. `@chenglou/pretext` is an optional peer dependency; register it with `setTextLayoutEngine(pretext)`.
- **Label:** `labels` (`optional`).
- **Chip:** `defaultPressed` and `onPressedChange` (uncontrolled toggle chip).
- **DataTable:** `defaultFilter`, `defaultSort`, `defaultSelected` (uncontrolled filter, sort and selection) and `labels`.
- **FileRow:** `defaultSelected`, `onSelectedChange` and `labels`; **FileList:** `labels`.
- **Dropzone**, **UploadList**, **ListSort**, **Bars:** `labels`.

#### Layout and data

- **GroupItem:** `open`, `defaultOpen` and `onOpenChange`; a `GroupRow` with `expands` toggles it and an `Expand` inside follows it. `ExpandProps.open` is optional.
- **Toggle** (table): `onOpenChange`.

#### Agent and chat

- **Composer:** `value`, `defaultValue`, `onValueChange` (called with `""` after a send) and `labels`.
- **ToolCard:** `open`, `defaultOpen` and `onOpenChange`; `progress` (0–1) draws a determinate bar.
- **HandoffReceipt:** `open`, `defaultOpen` and `onOpenChange`.
- **ReasoningFold:** `open` and `onOpenChange` (`defaultOpen` was already there).
- **ActionBar:** a `role="toolbar"` with one tab stop; ← / → move between buttons (mirrored in RTL, wrapping), Home / End go to the ends.
- **RecoveryKey:** `RecoveryKeyLabels.key` names the key box, which is now a focusable region.
- **PermissionCard:** ⌘/Ctrl+Enter allows, Escape rejects.

#### Internationalisation

- `DirectionProvider` (`direction: "ltr" | "rtl"`) and `DirectionProviderProps`, wrapping Base UI's provider. Under `"rtl"`, `Tabs` and `DropdownMenu` submenus swap ← / →, the submenu chevron points to the inline end, and `Slider` mirrors its arrow keys and drag. `Slider` also follows a computed CSS `direction: rtl` without the provider.
- `LocaleProvider`, `useLocale`, `defineStrings`, `useStrings`, `resolveStrings`, `DEFAULT_LOCALE` (`"zh-TW"`), `FALLBACK_LOCALE` (`"en"`) and the types `Locale`, `LocaleProviderProps`, `LocaleStrings`, `StringsOf`, `StringTable`, `Word`.
- Every component's built-in words come in zh-TW and English and follow `<LocaleProvider>`; a `labels` prop overrides any word per instance.
- Exported label types: `ActionBarLabels`, `AttachButtonLabels`, `CodeBlockLabels`, `ComposerLabels`, `DataTableLabels`, `DialogLabels`, `DiffViewerLabels`, `DropzoneLabels`, `FileRowLabels`, `HandoffReceiptLabels`, `InteractionCardLabels`, `LabelLabels`, `ListLabels`, `MarkdownLabels`, `MessageLabels`, `PageLabels`, `PasswordInputLabels`, `PayloadBlockLabels`, `PendingFilesLabels`, `ProgressLabels`, `ReasoningFoldLabels`, `RecoveryKeyLabels`, `SelectLabels`, `SpinnerLabels`, `ThreadSkeletonLabels`, `ToastLabels`, `ToolCardLabels`, `VoiceIndicatorLabels`.

#### State

- `createStore(initial)` and `useStore(store, selector?, isEqual?)`, with the `Store` type. `useStore` reads any `subscribe` / `getSnapshot` store, including the toast and dialog managers.

#### Exports

- Family-prefixed names: `PageNumber`, `PageSub`, `GroupItem`, `GroupRow`, `TableHead`, `SettingsValue`, `TableCell`, with matching props types.
- A props type for every exported component (for example `ButtonProps`, `CardProps`, `TextProps`, `SpinProps`, `DialogTriggerProps`, `PopoverTitleProps`, `TooltipProviderProps`).

#### Tokens

- `color`: `signal` and `signalSubtle` (agent activity, focus, progress), `borderControl` (3:1 control boundaries), `link`, `dangerSolid`, `onDangerSolid`, `scrim`.
- `shadow`: `rest`, `float` and `modal` elevation levels.
- `corner`: role radii `small`, `control`, `float`, `sheet`, `modal`, `pill`.
- `motion`: `quick` (160ms), `slide` (240ms), `easeInOut`, `linear`, and loop durations `loopFast` (0.8s), `blink` (1s), `loop` (1.2s), `loopSlow` (1.6s).
- `type`: `t5`–`t7` (22 / 28 / 36px), `code`, `phoneInput` (16px), `dense` line height.
- New groups: `zIndex`, `breakpoint` (`phone`, `tablet` media queries), `iconSize`, `focusRing` (`width`).
- `tokens.css` is generated from every token group (`pnpm gen:tokens-css`), so CSS variables match the StyleX tokens.

### Changed

#### Tactile redesign

- New palette from neutral 12-step scales: grays at chroma 0, ink (`color.accent`) for primary actions and links, blue (`color.signal`) only for agent activity, focus and progress. `color.info` and `color.focusRing` take the blue.
- Buttons are pills: `sm` 32px, `md` 40px (was 36px), `xs` 28px, new `lg` 48px; ink primary, sunken secondary, a 0.98 press scale (skipped under reduced motion). IconButton is a circle.
- Inputs, selects and textareas are sunken fields; checked checkboxes, radios and switches fill with ink; switch thumbs are raised.
- Tabs raise the selected tab on a sunken track; badges drop their borders.
- Surfaces sit on elevation levels: cards and rest surfaces on `shadow.rest`, popover / dropdown / select / tooltip / toast on `shadow.float`, dialogs on `shadow.modal` with a `color.scrim` backdrop and no blur. Tooltips are no longer inverted.
- Body and display font is Figtree (Noto Sans TC / PingFang / JhengHei fallbacks); Geist Mono stays for code. `Text` body is 15px with 1.6 leading.
- `corner.card` is 14px (was 12px).
- Links render in ink with an underline; destructive and failed states use the danger family.
- Conversation components (thread, code, diff and payload blocks) follow the tactile language.
- `brand.css` `ak-page` sits on the desk surface and `ak-table` is restyled.

#### Behaviour

- `type` tokens are rem instead of px (same size at the default root size; they follow the reader's font setting).
- Dialogs, popups and toasts fade out on close (instant under reduced motion).
- Imperative dialogs settle their promise when closing starts, not when the fade ends.
- Toasts with an `action` or of type `danger` no longer time out unless you pass `timeout`.
- Toast timers pause on hover, on focus inside the viewport and while the document is hidden.
- Escape closes only the top dialog of a stack.
- Placeholders in `Input`, `Textarea`, `PasswordInput`, `Composer`, the `DataTable` filter, the `Select` trigger and search box and the `DecisionCard` free-text box use `color.textMuted`.
- Spinning and looping animations take their period from the `motion` loop tokens: `Spin` turns in 0.8s (`loopFast`, was 0.7s), the `Dropzone` drag-over outline cycles in 0.8s (`loopFast`, was 0.5s), the `FileRow` spinner stays at 1.2s (`loop`).
- Fields use 16px text below the phone breakpoint, so iOS does not zoom on focus.
- Hover-only affordances (FileRow checkbox and actions, the assistant message's ActionBar) stay visible on touch devices.
- DiffViewer marks word changes with `<ins>` / `<del>` instead of `<mark>`.
- RecoveryKey's copied word is `已複製` / `Copied`; the check mark is a hidden glyph.

### Deprecated

All deprecated names still work and will be removed in a future major release.

- **Slider**, **SliderCell**, **Segmented:** `onChange`; use `onValueChange`.
- **ReasoningFold:** `onToggle`; use `onOpenChange`.
- **FileRow:** `onSelectChange` (use `onSelectedChange`) and `selectLabel` (use `labels={{ select }}`).
- **FileList:** `selectedLabel`; use `labels={{ selected }}`.
- **Label:** `optionalLabel`; use `labels={{ optional }}`.
- **DataTable:** `countLabel`, `selectLabel`, `selectAllLabel`, `editLabel`, `clearLabel`; use `labels={{ count, select, selectAll, edit, clearFilter }}`.
- Generic export names `B`, `Sub`, `Item`, `Row`, `Head`, `Value`, `Cell` and the types `RowProps`, `HeadProps`, `CellProps`; use the family-prefixed names.
- `text` tokens; use the `type` scale (each key names its replacement).
- `shadow.raised`, `popover`, `pop`, `dock`, `sheet`; use `rest`, `float` or `modal`.
- `corner.ib`, `md`, `btn`, `sm`, `xs`; use the role radii.
- `motion.spring`; use `easeOut`.

### Fixed

- Switch thumb and tab indicator move the right way in RTL.
- Slider fill and thumb move together; the fill is ink and the knob has a ring.
- Determinate Progress bars render (the track has a block box).
- Textarea auto-grow re-measures after width changes.
- Dropzone says why an upload failed and announces only status.
- ToolCard puts the retry wait, attempt and maximum on one line, aligned with the title.
- DataTable keeps its row count on one line; FileRow's upload percentage no longer jitters; list cells wrap at narrow widths.
- FileRow moves size and date to a second line in narrow lists.
- PayloadBlock scrolls sideways inside grid and flex parents.
- The full text of clipped values stays reachable.
- Dialog content keeps its width after its padding moved inside.
- `tokens.css` loads before the StyleX rules; Geist Mono is named the way Google Fonts registers it.
- `brand.css` keeps wrapped declarations in the manual themes.
- PasswordInput hints state the 12-character target.
- PasswordInput keeps a caller's own `aria-describedby` outside a `Field`, joined with its meter, Caps Lock and mismatch ids.
- CallBar's mute button keeps its tooltip while muted.
- A pressable `Chip` forwards `ref` to its `<button>`.
- `Segmented` and `ActionBar` read `DirectionProvider`, like `Slider`: the provider wins, else the computed CSS `direction`.

### Accessibility

- Focus is a solid 2px `color.focusRing` ring (`focusRing.width`) across controls.
- Control boundaries reach 3:1 contrast (`color.borderControl`); selected tab pills are ringed at 3:1.
- Small checkboxes, radios, switches, ActionBar and CodeBlock buttons have 24px hit areas.
- Controls, overlays, ToolCard, LiveDot, Skeleton, Progress, CallBar, Bubble and Message stay distinguishable in forced-colors mode.
- Readable text moved from `textFaint` to `textMuted`, including the `Select` trigger and search placeholders, the `DecisionCard` free-text placeholder and the `KbdGroup` sequence separator.
- F8 moves focus to the toast region and Escape returns it; every toast has a named close button; the viewport is a polite live region and `danger` toasts are alerts.
- Dialog, ConfirmDialog, Select, Dropdown and Popover return focus to the trigger as the exit starts.
- Segmented follows the WAI-ARIA radio group pattern; ActionBar follows the toolbar pattern.
- CallBar's mute button uses `aria-pressed` with a constant name.
- PasswordInput's reveal toggle keeps a constant name with `aria-pressed`, so it is no longer read as "hide, pressed".
- RecoveryKey's reveal button drops `aria-pressed`: its text already names the next action (reveal / hide).
- `Field` gives its label an id; a `multiple` Select inside a `Field` (a `div` trigger that `<label for>` cannot name) points `aria-labelledby` at it from the trigger, the list and the search box.
- Forced-colors mode: an invalid `Input`, `Textarea`, `PasswordInput` or `Select` draws a 2px dashed frame, and an invalid `Checkbox` a 2px dashed `ButtonText` frame, so the error does not rely on colour. `Ghost` and `IconButton` draw a 1px `ButtonText` outline on hover and a `Highlight` focus ring.
- Right-to-left: under `DirectionProvider` the arrow keys of `Tabs`, `DropdownMenu` submenus, `Slider`, `Segmented` and `ActionBar` follow the reading direction, and a `Slider` drag measures from the right edge.
- ListSort's arrow is hidden and an active column is named "X, sorted" (`X，排序中` in zh-TW).
- DiffViewer no longer relies on colour: `<ins>` / `<del>`, ± signs and visually hidden prefixes.
- RecoveryKey announces a copy politely; its key box is a focusable, named region that selects the key on focus.
- InteractionCard: single-choice blocks are `role="radiogroup"`; multi-select checkbox groups drop the unsupported `aria-required`; rejected and pending states do not rely on colour.
- An axe sweep and per-component axe checks run in the test suite.

## 0.9.0 — 2026-09-28

- Added CallBar, the controlled voice-call bar.
- Added AttachButton, PendingFiles, PayloadBlock, AttachmentTile / AttachmentGrid, Bubble and StatusBadge.
- Added ListHead, ListSort, ListRow and WeightDot; Group gains header, footer and settings cells, and `Status` a dot shape and tone.
- Markdown renders ruled tables; Slider adds `onValueCommit`, fired once per gesture.

## 0.8.2 — 2026-09-25

- Fonts fall back to Noto Sans TC for Chinese text.

## 0.8.1 — 2026-09-20

- Input adds a `mono` prop.

## 0.8.0 — 2026-09-20

- Breaking: removed the woven texture machinery and Button's `woven` prop; components are flat by default.
- Breaking: removed the Ledger palette and the display serif; the neutral palette is the default.
- Added the `type`, `corner`, `ink` and `tone` token scales and the flat primitives from product's ui-next.
- Toast, Progress, Tabs, Radio, Checkbox, Switch and HandoffReceipt move to the flat look.

## 0.7.0 — 2026-09-17

- Added LiveDot, a breathing "still running" dot.
- DialogContent gains three `size` steps and a scrolling `body`; Chip can be pressed (`onClick`, `pressed`).
- DataTable gains `sx`, `maxHeight` and a footer; AssistantMessage takes `sx`; Slider is a continuous bar.
- Tokens add the neutral palette and the `layer1`–`layer5` surfaces.

## 0.6.1 — 2026-09-02

- DialogContent takes `sx`, so its width and height can be overridden.

## 0.6.0 — 2026-09-02

- Added DESIGN.md and `brand.css` (`ak-*` classes, exported as `./brand.css`) so external agents can build one-off pages.

## 0.5.0 — 2026-09-02

- Added Markdown for messages: GFM, TeX math and scrolling tables.
- A formula that fails to render no longer breaks the whole message.

## 0.4.2 — 2026-09-01

- Text and Card take `sx`, so outside styles can override their base.

## 0.4.1 — 2026-08-31

- Select, Dropdown, Popover and Tooltip open above a Dialog; z-index layers are managed in one place.

## 0.4.0 — 2026-08-30

- Button adds an `xs` size and an `icon` shape.
- `sx` for outside layout on Button, Input, Textarea, Label, Checkbox, Switch and Badge.

## 0.3.0 — 2026-08-30

- Added the `color.info` and `color.infoSubtle` tokens.

## 0.2.0 — 2026-08-30

- Theme switching keeps the texture in the chosen theme.
- `textMuted` is one step darker.
- Release pipeline publishes through npm OIDC with provenance.

## 0.1.0 — 2026-08-29

- First release: StyleX tokens and themes, form controls, overlays, feedback, conversation and storage components.
- Docs site deployable to Cloudflare Workers.
- MIT license; tag-driven releases through Turborepo and GitHub Actions.
