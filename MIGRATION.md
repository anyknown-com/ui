# Migrating from 0.9 to 0.10

0.10 has five breaking changes. Most apps only need to touch the first two. Everything else
in this release is either additive or a deprecation, and the old names keep working. The full
list is in [CHANGELOG.md](CHANGELOG.md).

All imports below come from `@anyknown/ui` unless they say otherwise. Tokens come from
`@anyknown/ui/tokens.stylex`.

## Breaking changes

### 1. Toast runs on its own store, not Base UI

**What changed:** `toastManager` and `<Toaster manager>` now take a `ToastManager` from our
`createToastManager()`, not Base UI's `Toast.createToastManager()`. `add()` keeps `title`,
`description`, `type` and `timeout`, but drops Base UI's `actionProps` and `priority`. Toasts over
`limit` are dropped (their `onClose` runs) instead of kept hidden until there is room.

**Why:** owning the store gives us `update`, `promise`, `key` dedupe, `closeAll` and per-toast
callbacks without depending on Base UI's toast internals.

If you only call `toast(...)`, `toast.success(...)`, `toast.danger(...)` and `toast.close(id)`, you
do not need to change anything.

Before (0.9):

```tsx
import { Toast } from "@base-ui/react/toast"
import { Toaster, toastManager } from "@anyknown/ui"

// A scoped viewport needed Base UI's manager
const scoped = Toast.createToastManager()

function Embedded() {
	return <Toaster manager={scoped} />
}

// Direct manager calls used Base UI's fields
toastManager.add({
	title: "Draft deleted",
	type: "danger",
	priority: "high",
	actionProps: { children: "Undo", onClick: restoreDraft },
})
```

After (0.10):

```tsx
import { Toaster, createToastManager, toast, toastManager } from "@anyknown/ui"

// Our manager; wrap the subtree so useToast() inside reaches it
const scoped = createToastManager()

function Embedded({ children }: { children: React.ReactNode }) {
	return <Toaster manager={scoped}>{children}</Toaster>
}

// `action` replaces actionProps; pressing it runs onClick, then closes the toast.
// `priority` is gone: `danger` toasts are role="alert", the others role="status".
toastManager.add({
	title: "Draft deleted",
	type: "danger",
	action: { label: "Undo", onClick: restoreDraft },
})

// Or, the shorter form
toast.danger("Draft deleted", { action: { label: "Undo", onClick: restoreDraft } })
```

If you relied on hidden toasts coming back when others closed, raise `limit`, or give repeated
toasts the same `key` so they update one toast (shown as ×N) instead of stacking:

```tsx
<Toaster limit={5} />

toast("Synced", { key: "sync" })
```

### 2. `ConfirmDialog` needs a `confirmLabel`

**What changed:** `ConfirmDialogProps.confirmLabel` is required. The `"確認"` default is gone.

**Why:** "Confirm" does not say what the button does; the label should start with a verb and
name the outcome.

Before (0.9):

```tsx
<ConfirmDialog
	trigger={<Button variant="danger">Delete</Button>}
	title="Delete this memory?"
	danger
	onConfirm={deleteMemory}
/>
```

After (0.10):

```tsx
<ConfirmDialog
	trigger={<Button variant="danger">Delete</Button>}
	title="Delete this memory?"
	danger
	confirmLabel="Delete memory"
	onConfirm={deleteMemory}
/>
```

The new imperative `dialog.confirm()` has the same rule: `ConfirmOptions.confirmLabel` is
required. It is new in 0.10, so no existing call breaks:

```tsx
const ok = await dialog.confirm({
	title: "Archive this thread?",
	confirmLabel: "Archive thread",
	tone: "danger",
})
```

`dialog.confirm` needs a `<Dialogs />` host mounted once near the root.

### 3. `Segmented` is a radio group

**What changed:** the segments are `role="radio"` with `aria-checked` inside a
`role="radiogroup"`, instead of buttons with `aria-pressed`. Only the checked segment is a tab
stop; arrow keys move focus and the choice (wrapping, mirrored in RTL), Home and End go to the
ends.

**Why:** a single choice among a few options is the WAI-ARIA radio group pattern, so screen
readers announce "1 of 3, selected".

The component API is unchanged apart from the `onChange` deprecation (see below). Update tests
and any CSS or scripts that select the buttons.

Before (0.9):

```tsx
<Segmented
	label="Language"
	value={lang}
	options={[
		{ value: "zh", label: "中文" },
		{ value: "en", label: "English" },
	]}
	onChange={setLang}
/>

expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true")
```

After (0.10):

```tsx
<Segmented
	label="Language"
	value={lang}
	options={[
		{ value: "zh", label: "中文" },
		{ value: "en", label: "English" },
	]}
	onValueChange={setLang}
/>

expect(screen.getByRole("radio", { name: "English" })).toHaveAttribute("aria-checked", "true")
// Tab reaches only the checked segment; use arrow keys to move between segments
await user.keyboard("{ArrowRight}")
```

### 4. `CallBarLabels` has no `unmute`

**What changed:** the mute button always has the name `labels.mute` and reports its state with
`aria-pressed`. `CallBarLabels.unmute` is removed, so passing it is a type error.

**Why:** the WAI-ARIA toggle button pattern keeps one name and exposes the state; swapping the
name made screen readers announce a different button.

Before (0.9):

```tsx
<CallBar
	status="listening"
	seconds={42}
	muted={muted}
	onMute={setMuted}
	onHangUp={hangUp}
	labels={{ mute: "Mute", unmute: "Unmute", hangUp: "Hang up" }}
/>

screen.getByRole("button", { name: "Unmute" })
```

After (0.10):

```tsx
<CallBar
	status="listening"
	seconds={42}
	muted={muted}
	onMute={setMuted}
	onHangUp={hangUp}
	labels={{ mute: "Mute", hangUp: "Hang up" }}
/>

screen.getByRole("button", { name: "Mute", pressed: true })
```

Under `<LocaleProvider locale="en">` the English words are built in, so you can drop `labels`.

### 5. `PasswordInput` has no `hideLabel`

**What changed:** the reveal toggle keeps one name in both states, `showLabel` (or
`labels.show`: "顯示 passphrase" / "Show passphrase"), and reports the state with
`aria-pressed`. The `hideLabel` prop is removed, so passing it is a type error. The new
`PasswordInputLabels` has no `hide` either.

**Why:** in 0.9 the toggle both renamed itself and set `aria-pressed`, so a screen reader heard
"Hide passphrase, pressed". The WAI-ARIA toggle button pattern uses one or the other.

Before (0.9):

```tsx
<PasswordInput showLabel="Show passphrase" hideLabel="Hide passphrase" />

await user.click(screen.getByRole("button", { name: "Show passphrase" }))
screen.getByRole("button", { name: "Hide passphrase" })
```

After (0.10):

```tsx
<PasswordInput showLabel="Show passphrase" />

await user.click(screen.getByRole("button", { name: "Show passphrase" }))
screen.getByRole("button", { name: "Show passphrase", pressed: true })
```

Under `<LocaleProvider locale="en">` the English name is built in, so you can drop `showLabel`.

## Deprecations

Each deprecated name still works in 0.10 and will be removed in a future major release. Your
editor shows them struck through.

### `Slider`, `SliderCell` and `Segmented`: `onChange` → `onValueChange`

`onValueChange` is called with the same value. `Slider` and `SliderCell` can now also be
uncontrolled with `defaultValue`.

```tsx
// Before
<Slider label="Temperature" value={temp} onChange={setTemp} onValueCommit={save} />

// After
<Slider label="Temperature" value={temp} onValueChange={setTemp} onValueCommit={save} />

// Or uncontrolled
<Slider label="Temperature" defaultValue={0.7} onValueCommit={save} />
```

### `ReasoningFold`: `onToggle` → `onOpenChange`

```tsx
// Before
<ReasoningFold streaming={streaming} durationSec={12} onToggle={track}>
	{reasoning}
</ReasoningFold>

// After
<ReasoningFold streaming={streaming} durationSec={12} onOpenChange={track}>
	{reasoning}
</ReasoningFold>
```

Pass `open` as well to control the fold yourself.

### `FileRow`: `onSelectChange` → `onSelectedChange`, `selectLabel` → `labels.select`

```tsx
// Before
<FileRow
	item={file}
	selected={selected}
	onSelectChange={setSelected}
	selectLabel={(name) => `Select ${name}`}
/>

// After
<FileRow
	item={file}
	selected={selected}
	onSelectedChange={setSelected}
	labels={{ select: (name) => `Select ${name}` }}
/>
```

### `FileList`: `selectedLabel` → `labels.selected`

```tsx
// Before
<FileList label="Files in Taxes" selectedCount={count} selectedLabel={(n) => `${n} selected`}>
	{rows}
</FileList>

// After
<FileList label="Files in Taxes" selectedCount={count} labels={{ selected: (n) => `${n} selected` }}>
	{rows}
</FileList>
```

### `Label`: `optionalLabel` → `labels.optional`

```tsx
// Before
<Label htmlFor="nickname" optional optionalLabel="optional">
	Nickname
</Label>

// After
<Label htmlFor="nickname" optional labels={{ optional: "optional" }}>
	Nickname
</Label>
```

### `DataTable`: `*Label` props → `labels`

| 0.9 prop         | 0.10 `labels` key |
| ---------------- | ----------------- |
| `countLabel`     | `count`           |
| `selectLabel`    | `select`          |
| `selectAllLabel` | `selectAll`       |
| `editLabel`      | `edit`            |
| `clearLabel`     | `clearFilter`     |

```tsx
// Before
<DataTable
	label="Members"
	rows={rows}
	rowKey={(row) => row.id}
	columns={columns}
	countLabel={(shown, total) => `${shown} of ${total}`}
	selectAllLabel="Select all"
	clearLabel="Clear filter"
/>

// After
<DataTable
	label="Members"
	rows={rows}
	rowKey={(row) => row.id}
	columns={columns}
	labels={{
		count: (shown, total) => `${shown} of ${total}`,
		selectAll: "Select all",
		clearFilter: "Clear filter",
	}}
/>
```

With `<LocaleProvider locale="en">` the English defaults are built in, so many apps can drop
these props entirely.

### Generic export names → family-prefixed names

| Deprecated  | Use                  |
| ----------- | -------------------- |
| `B`         | `PageNumber`         |
| `Sub`       | `PageSub`            |
| `Item`      | `GroupItem`          |
| `Row`       | `GroupRow`           |
| `Head`      | `TableHead`          |
| `Value`     | `SettingsValue`      |
| `Cell`      | `TableCell`          |
| `RowProps`  | `GroupRowProps`      |
| `HeadProps` | `TableHeadProps`     |
| `CellProps` | `TableCellProps`     |

```tsx
// Before
import { Group, Item, Row, Table, Head, Cell } from "@anyknown/ui"

// After
import { Group, GroupItem, GroupRow, Table, TableHead, TableCell } from "@anyknown/ui"
```

The props and behaviour are the same; only the names change.

### `text` tokens → `type`

`type` is the one type scale, in rem. Each `text` key names its replacement. Four sizes are 1px
smaller in the new scale, so check those screens after you switch.

| `text`           | `type`                                     | Size change  |
| ---------------- | ------------------------------------------ | ------------ |
| `xs`             | `t1`                                       | 12px → 11px  |
| `sm`             | `t2`                                       | 14px → 13px  |
| `base`           | `t3` (`phoneInput` for a phone-size field) | 16px → 15px  |
| `lg`             | `t4`                                       | 18px → 17px  |
| `xl`             | `t5`                                       | same (22px)  |
| `xxl`            | `t6`                                       | same (28px)  |
| `display`        | `t7`                                       | same (36px)  |
| `code`           | `code`                                     | same (13px)  |
| `leadingTight`   | `dense`                                    | same (1.2)   |
| `leadingSnug`    | `snug`                                     | 1.4 → 1.45   |
| `leadingNormal`  | `snug`                                     | 1.5 → 1.45   |
| `leadingRelaxed` | `body`                                     | same (1.6)   |

```ts
// Before
import { text } from "@anyknown/ui/tokens.stylex"

const styles = stylex.create({
	note: { fontSize: text.sm, lineHeight: text.leadingRelaxed },
})

// After: `type` reads oddly as a binding next to TypeScript's `type` keyword, so alias it
import { type as scale } from "@anyknown/ui/tokens.stylex"

const styles = stylex.create({
	note: { fontSize: scale.t2, lineHeight: scale.body },
})
```

### Legacy corner, shadow and motion names

| Deprecated                                       | Use                                       |
| ------------------------------------------------ | ----------------------------------------- |
| `corner.ib`                                      | `corner.control`                          |
| `corner.md`, `corner.sm`, `corner.xs`            | `corner.small`                            |
| `corner.btn`                                     | `corner.pill`                             |
| `shadow.raised`                                  | `shadow.rest`                             |
| `shadow.popover`, `shadow.pop`, `shadow.dock`    | `shadow.float`                            |
| `shadow.sheet`                                   | `shadow.modal`                            |
| `motion.spring`                                  | `motion.easeOut`                          |

The deprecated shadow names already hold the same value as their replacement. The deprecated
corner names keep their old values.

```ts
import { corner, shadow } from "@anyknown/ui/tokens.stylex"

// Before
const styles = stylex.create({
	panel: { borderRadius: corner.md, boxShadow: shadow.pop },
})

// After
const styles = stylex.create({
	panel: { borderRadius: corner.small, boxShadow: shadow.float },
})
```

## Behaviour changes you may notice

These do not need code changes, but they can change screenshots, tests or how a screen feels.

- **Default language is zh-TW.** Built-in words (button names, status text, live announcements)
  are Traditional Chinese unless you wrap the app in a provider. Put `<Toaster>` and `<Dialogs>`
  inside it too, so toasts and dialogs follow the language:

  ```tsx
  import { Dialogs, LocaleProvider, Toaster } from "@anyknown/ui"

  export function Root() {
  	return (
  		<LocaleProvider locale="en">
  			<Toaster>
  				<Dialogs>
  					<App />
  				</Dialogs>
  			</Toaster>
  		</LocaleProvider>
  	)
  }
  ```

  Unknown locales fall back to English. A `labels` prop overrides single words.
- **Segmented** is a radio group (see breaking change 3).
- **ListSort**: an active column's accessible name is "X, sorted" (`X，排序中` in zh-TW), and the
  arrow is hidden from screen readers. Tests that find it by its column name alone must use the
  new name.
- **DiffViewer** marks word changes with `<ins>` and `<del>` (underlined and struck through)
  instead of `<mark>`, with ± signs and visually hidden prefixes. Update selectors that looked
  for `mark`.
- **Dialogs fade out.** Dialogs, popups and toasts run a 120ms exit (none under reduced motion).
  `dialog.open(...).result`, `dialog.confirm` and `dialog.alert` settle when closing **starts**;
  the element leaves the DOM when the fade ends, so tests should wait for removal (for example
  `await waitForElementToBeRemoved(...)`) instead of checking right after a click.
- **Escape closes only the top dialog** of a stack. The ones under it stay open.
- **Focus returns as the exit starts.** Dialog, ConfirmDialog, Select, Dropdown and Popover move
  focus back to the trigger at the start of the fade, not after it.
- **CallBar**: the mute button keeps one name with `aria-pressed` (see breaking change 4).
- **PasswordInput**: the reveal toggle keeps one name with `aria-pressed` (see breaking change 5).
- **RecoveryKey**'s reveal button no longer has `aria-pressed`; its text says the next action.
- **Toasts with an `action` or of type `danger` wait to be dismissed.** Pass `timeout` to count
  them down anyway. Toasts over `limit` are dropped.
- **F8** moves focus to the toast region and Escape gives it back.
- **ActionBar** is one tab stop; use ← / → between its buttons.
- **Placeholders** in `Input`, `Textarea`, `PasswordInput`, `Composer`, the `DataTable` filter,
  the `Select` trigger and search box and the `DecisionCard` free-text box use `color.textMuted`
  (darker than before).
- **Spin** turns a little slower (0.8s, was 0.7s), and the **Dropzone** drag-over outline cycles
  in 0.8s (was 0.5s).
- **Fields use 16px text on phones** (below 45rem) to stop iOS zooming on focus.
- **Buttons are larger pills:** `xs` 28px, `sm` 32px, `md` 40px, new `lg` 48px.
- **The focus ring is blue** (`color.focusRing`, 2px solid), and primary actions and links are ink.
- **`type` tokens are rem**, so they follow the reader's browser font size.
- **RecoveryKey** says `已複製` / `Copied` after a copy (the ✓ is a hidden glyph), and its key box
  is a tab stop.
- **InteractionCard**: single-choice blocks are `role="radiogroup"`; multi-select checkbox groups
  no longer carry `aria-required`.
- **Hover-only controls** (FileRow checkbox and actions, the message ActionBar) stay visible on
  touch devices.
- **Right-to-left** needs `<DirectionProvider direction="rtl">` (new) at the root as well as
  `dir="rtl"` on `<html>`. With it, `Tabs` and `DropdownMenu` submenus swap ← / →, `Slider`
  mirrors its keys and drag, and `Segmented` and `ActionBar` mirror their keys. `Slider`,
  `Segmented` and `ActionBar` also follow a computed `direction: rtl` on their own, so an RTL
  page without the provider now gets ← raising a Slider. See
  [Right-to-left](docs/guides/i18n.md#right-to-left).

## Checklist

- [ ] Replace Base UI `Toast.createToastManager()` with `createToastManager()` from `@anyknown/ui`.
- [ ] Replace `actionProps` / `priority` in `toastManager.add()` calls with `action`.
- [ ] Check screens that show more toasts than `<Toaster limit>` at once.
- [ ] Add `confirmLabel` to every `<ConfirmDialog>`.
- [ ] Update Segmented tests and selectors from `button` / `aria-pressed` to `radio` / `aria-checked`.
- [ ] Remove `unmute` from CallBar `labels`; query the mute button with `pressed`.
- [ ] Remove `hideLabel` from PasswordInput; query the reveal toggle by its show name with `pressed`.
- [ ] Wrap the app in `<LocaleProvider locale="en">` if it is not zh-TW, with `<Toaster>` and `<Dialogs>` inside.
- [ ] Move `onChange` → `onValueChange`, `onToggle` → `onOpenChange`, `onSelectChange` → `onSelectedChange`, and `*Label` props → `labels`.
- [ ] Rename `B`, `Sub`, `Item`, `Row`, `Head`, `Value`, `Cell` to their family-prefixed names.
- [ ] Move `text` tokens to `type`, and legacy `corner` / `shadow` / `motion.spring` names to the new ones.
- [ ] Update tests that look for `<mark>` in DiffViewer, ListSort by its old name, or dialogs right after close.
- [ ] Re-check screenshots: new palette, pill buttons, Figtree, 15px body text, rounder cards.
