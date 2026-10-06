# Dialog

A modal dialog on Base UI Dialog, with a confirm variant for irreversible actions and an imperative store (`dialog.open` / `confirm` / `alert`) that renders through one `<Dialogs />` host.

## When to use

- A short task that must finish or be cancelled before the user goes on (rename a workspace).
- Confirming an irreversible action: `ConfirmDialog`, or `await dialog.confirm(...)` from an event handler.
- An immersive picker or list that needs most of the window (`size="full"` with `body`).

## When not to use

- For a notice that should not block the page, use [Toast](../toast/README.md).
- For details anchored to a button that can be dismissed by clicking away, use [Popover](../popover/README.md).
- For a list of actions, use [DropdownMenu](../dropdown/README.md).

## Usage

Declarative, with a trigger:

```tsx
import { Button, Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "@anyknown/ui"

<Dialog>
  <DialogTrigger><Button variant="secondary">Rename workspace</Button></DialogTrigger>
  <DialogContent title="Rename workspace" description="The new name syncs to every member.">
    <DialogActions>
      <DialogClose><Button variant="ghost">Cancel</Button></DialogClose>
      <DialogClose><Button onClick={save}>Save</Button></DialogClose>
    </DialogActions>
  </DialogContent>
</Dialog>
```

Imperative, from anywhere (mount `<Dialogs />` once in the app):

```tsx
import { Dialogs, dialog } from "@anyknown/ui"

<Dialogs />

const ok = await dialog.confirm({
  title: "Archive this thread?",
  description: "You can find it again in the sidebar.",
  confirmLabel: "Archive thread",
})
```

- Declarative: `Dialog` (root; controlled `open` / `onOpenChange` or uncontrolled `defaultOpen`), `DialogTrigger`, `DialogContent` (`title`, `description`, `size` `"sm"` / `"md"` / `"full"`, `body` for the part that scrolls under a pinned header, `sx`, `bodySx`), `DialogActions`, `DialogClose`, and `ConfirmDialog` (`title`, `description`, `danger`, `confirmLabel` (required), `cancelLabel`, `onConfirm`, `trigger`, `labels`, plus `open` / `defaultOpen` / `onOpenChange`).
- `dialog.open(({ close }) => <DialogContent … />, { role? })` returns `{ id, close(result?), result }`; `result` is a Promise. `render` must return a `DialogContent`, or stacked dialogs above it never mount.
- `dialog.confirm({ title, description?, confirmLabel, cancelLabel?, tone? })` resolves `true` or `false`; `dialog.alert({ title, description?, confirmLabel?, tone? })` resolves when its one button is pressed. Both render the ConfirmDialog card.
- `dialog.close(id, result?)` also closes every dialog stacked above it; `dialog.closeAll()` closes all. Escape, backdrop and `closeAll` resolve `undefined` (`false` for confirm).
- A closed imperative dialog fades out: its promise settles when the exit starts, and its `DialogEntry` (from `getSnapshot()`) stays with `closing: true` until the exit ends.
- Scoping: `createDialogManager()` plus `<Dialogs manager={m}>…</Dialogs>`; `useDialog()` returns `{ dialog }` for the nearest `<Dialogs>` that wraps the caller as `children`, or the default `dialog` outside one.

```tsx
const m = createDialogManager()
<Dialogs manager={m} labels={{ cancel: "Keep it" }}><Panel /></Dialogs>

function Panel() {
  const { dialog } = useDialog() // reaches m
  return <Button onClick={() => dialog.alert({ title: "Saved" })}>Save</Button>
}
```

## Accessibility

- Base UI Dialog: `role="dialog"` named by the `title` and described by the `description`. Focus moves in and is trapped, the page behind is inert, and scroll is locked.
- `ConfirmDialog`, `dialog.confirm` and `dialog.alert` use Base UI AlertDialog: `role="alertdialog"`. A backdrop click does not close it; Escape does. `dialog.open(…, { role: "alertdialog" })` gets the same behavior.
- With `danger` (or `tone: "danger"`), focus starts on the cancel button.
- `confirmLabel` is required on a confirm: start with a verb that names the result ("Delete memory"), not "OK".
- Focus returns to the element that opened the dialog as soon as the exit starts, not after the fade. In a stack, it goes to the opener inside the dialog below.
- Stacked dialogs nest, so Escape closes only the top one and screen readers see the top one.
- There is no built-in close (×) button; give every dialog a `DialogClose` or another way out besides Escape.
- The grow-in and the exit fade/shrink are off under `prefers-reduced-motion: reduce`. A transparent border keeps an edge in forced-colors mode.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `cancel` (取消 / Cancel) on a confirm's cancel button and `acknowledge` (知道了 / OK) on an alert's only button. Override them with `labels` on `<Dialogs>` or `<ConfirmDialog>`; an explicit `cancelLabel` / `confirmLabel` wins over both.

## Keyboard

Base UI Dialog handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus within the dialog; it does not leave. |
| <kbd>Escape</kbd> | Closes only the top dialog (confirm resolves `false`) and returns focus to its opener. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button. |

## Related

- [Toast](../toast/README.md) — the same imperative shape, for non-blocking notices.
- [Button](../button/README.md) — `danger` and `secondary` variants used in the confirm card.
- [Popover](../popover/README.md) — non-modal anchored content.
