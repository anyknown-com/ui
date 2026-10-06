# State management

`@anyknown/ui` keeps shared state in small external stores and reads them with `useSyncExternalStore`. The same store powers the imperative `toast` and `dialog` APIs, and you can use it for your own state. This guide covers the store, the toast and dialog APIs, and the controlled and uncontrolled prop convention.

## The store

`createStore` and `useStore` come from `src/lib/store.ts` and are exported from the package root.

```tsx
import { createStore, useStore } from "@anyknown/ui"

type Draft = { text: string; files: string[] }

const draft = createStore<Draft>({ text: "", files: [] })

draft.set({ text: "Hello", files: [] }) // a value
draft.set((prev) => ({ ...prev, files: [...prev.files, "notes.md"] })) // or an updater
draft.getSnapshot().text // "Hello"
const unsubscribe = draft.subscribe(() => console.log("changed"))
unsubscribe()
```

A `Store<T>` has three members:

| Member | What it does |
| --- | --- |
| `getSnapshot()` | Returns the current value. |
| `set(next)` | Takes a value or an updater `(prev) => next`. If the new value is the same (`Object.is`), nothing happens and no listener runs. |
| `subscribe(listener)` | Adds a listener and returns a function that removes it. |

The store does not copy or freeze values. Treat them as immutable: always pass a new object to `set`, or the change is ignored.

### Reading a store in React

```tsx
function FileCount() {
  const count = useStore(draft, (s) => s.files.length)
  return <span>{count} files</span>
}
```

- `useStore(store)` returns the whole value and re-renders on every change.
- `useStore(store, selector)` subscribes to one slice. The component re-renders only when the selected value changes (`Object.is` by default), and it gets back the same reference as last time when nothing changed.
- `useStore(store, selector, isEqual)` uses your equality check. Pass one when the selector builds a new object or array, or every store change counts as a change:

```tsx
const names = useStore(
  draft,
  (s) => s.files.map((f) => f.toUpperCase()),
  (a, b) => a.length === b.length && a.every((x, i) => x === b[i]),
)
```

The selector can be an inline function. When it changes, `useStore` selects again; when neither the selector nor the store changed, it returns the cached value.

`useStore` accepts anything with `subscribe` and `getSnapshot`, including the toast and dialog managers:

```tsx
import { toastManager, useStore } from "@anyknown/ui"

const showing = useStore(toastManager, (s) => s.toasts.length)
```

### Why the library never syncs state in effects

The library has a house rule: no `useEffect` for state. Copying a value into React state from an effect renders twice (once stale, once correct), can show a frame of the stale value, and leaves two sources of truth that drift. `useSyncExternalStore` reads the store during render, so every component sees the same value in the same commit, including under concurrent rendering. DOM work that needs setup and cleanup goes in a ref callback instead (React 19 ref callbacks can return a cleanup function).

## Toast

`toast(...)` adds a notification from anywhere. `<Toaster />` is the viewport that shows them. Mount it once.

```tsx
import { Toaster, toast } from "@anyknown/ui"

function App() {
  return (
    <>
      {/* … */}
      <Toaster />
    </>
  )
}

toast("Summary copied")
toast.success("Handoff complete", { description: "3 memories carried into the new thread" })
toast.danger("Sync failed", { action: { label: "Retry", onClick: retry } })
```

### Methods

These are all the methods that exist today.

| Call | Returns | What it does |
| --- | --- | --- |
| `toast(title, options?)` | `string` (id) | Adds a default toast. |
| `toast.success(title, options?)` | `string` | Adds a success toast. |
| `toast.danger(title, options?)` | `string` | Adds a danger toast (`role="alert"`). |
| `toast.update(id, patch)` | `void` | Changes `title`, `description`, `type`, `action` or `timeout` in place and restarts the countdown. Does nothing if the toast is gone or closing. |
| `toast.close(id)` | `void` | Closes one toast. There is no `dismiss` method; use `close`. |
| `toast.promise(promise, messages)` | the same `Promise<T>` | Shows a spinner with `messages.loading` that does not count down. When the promise settles, the toast becomes success or danger. `success` and `error` can be strings or functions of the value or error. |

```tsx
const id = toast("Uploading 3 files…", { timeout: 0 })
toast.update(id, { title: "Uploaded 3 files", type: "success", timeout: 4000 })

await toast.promise(syncVault(), {
  loading: "Syncing vault…",
  success: (count: number) => `Synced ${count} items`,
  error: (error) => (error instanceof Error ? error.message : "Sync failed"),
})
```

### Options

`ToastOptions` (the second argument):

| Option | Type | Notes |
| --- | --- | --- |
| `description` | `string` | A second line, in `textMuted`. |
| `action` | `{ label: string; onClick: () => void }` | One button. Pressing it runs `onClick` and closes the toast. |
| `timeout` | `number` | Milliseconds. `0` means it never closes on its own. |
| `key` | `string` | De-duplication. While a toast with the same `key` is on screen, a new call updates that toast in place, restarts its countdown and shows a count (×N) instead of stacking a new one. A toast that is already closing does not match. |

When you omit `timeout`, the toast uses the `<Toaster>` `timeout`, except in two cases. A toast with an `action` and a danger toast stay until the user closes them (WCAG 2.2.1: a keyboard user may need many Tab presses to reach the button). Pass `timeout` to make them count down anyway. A loading toast from `toast.promise` never counts down.

Countdowns pause while the pointer is over the viewport, while focus is inside it, and while the page is hidden.

### `<Toaster>` props

| Prop | Default | Notes |
| --- | --- | --- |
| `position` | `"bottom-right"` | Also `"bottom-left"`, `"top-right"`, `"top-left"`. Left and right are logical: they flip under RTL. |
| `timeout` | `5000` | The default countdown in ms. |
| `limit` | `3` | The most toasts on screen. When a new one goes over the limit, the oldest is dropped. |
| `manager` | the default manager | A manager from `createToastManager()`; see below. |
| `labels` | — | Overrides built-in words (`region`, `dismiss`, `success`, `danger`). The rest follow `<LocaleProvider>`. See [Internationalization](./i18n.md). |

### Scoped viewports

`toast` writes to one default manager, `toastManager`. For a second, separate viewport (for example inside an embedded panel), create a manager and pass it to its own `<Toaster>`:

```tsx
import { Toaster, createToastManager } from "@anyknown/ui"

const panelToasts = createToastManager()

<Toaster manager={panelToasts} position="top-right" />

panelToasts.add({ title: "Saved", type: "success" })
panelToasts.update(id, { title: "Saved again" })
panelToasts.close(id)
panelToasts.promise(save(), { loading: "Saving…", success: "Saved", error: "Save failed" })
```

A manager's `add` takes one object: `{ title, type?, description?, action?, timeout?, key? }`. A manager also has `subscribe` and `getSnapshot` (a `ToastState`: `{ toasts, paused }`), so `useStore` can read it. `configure`, `pause` and `resume` are internal to `<Toaster>`.

`useToast()` returns `{ toast }` from the nearest `<Toaster>` context, or the default `toast`. `<Toaster>` takes no children, so in app code `useToast()` returns the default `toast`. To reach a scoped viewport, call its manager.

## Dialog

There are two ways to show a dialog: the imperative `dialog` API and the declarative components.

### Imperative: `dialog`

Mount `<Dialogs />` once. It renders whatever is open.

```tsx
import { Dialogs, dialog } from "@anyknown/ui"

function App() {
  return (
    <Dialogs>
      {/* … */}
    </Dialogs>
  )
}

const archive = await dialog.confirm({
  title: "Archive this thread?",
  description: "You can find it again in the sidebar.",
  confirmLabel: "Archive thread",
})
if (archive) archiveThread()
```

| Call | Returns | Notes |
| --- | --- | --- |
| `dialog.open(render, options?)` | `DialogHandle<T>` | `render` gets `{ close }` and must return a `DialogContent`. `options.role` is `"dialog"` (default) or `"alertdialog"`. |
| `dialog.confirm(options)` | `Promise<boolean>` | `true` when confirmed; `false` on cancel, Escape or `closeAll`. |
| `dialog.alert(options)` | `Promise<void>` | Resolves when its one button is pressed or the dialog is dismissed. |
| `dialog.close(id, result?)` | `void` | Closes that dialog and every dialog stacked above it. |
| `dialog.closeAll()` | `void` | Closes every dialog. |

`dialog.open` returns a handle `{ id, close(result?), result }`. `result` is a `Promise<T | undefined>`: it resolves with the value passed to `close`, or `undefined` when the dialog was dismissed (Escape, backdrop, `closeAll`, or a dialog below it closing).

```tsx
import { Button, DialogActions, DialogContent, dialog } from "@anyknown/ui"

const handle = dialog.open<string>(({ close }) => (
  <DialogContent title="Rename thread">
    <DialogActions>
      <Button variant="ghost" onClick={() => close()}>Cancel</Button>
      <Button onClick={() => close("Weekly sync")}>Save</Button>
    </DialogActions>
  </DialogContent>
))

const name = await handle.result // string | undefined
```

`ConfirmOptions` for `dialog.confirm`:

| Option | Notes |
| --- | --- |
| `title` | Required. |
| `description` | Optional. |
| `confirmLabel` | Required, no default. Verb first and name the consequence ("Archive thread", not "OK"). |
| `cancelLabel` | Default `"取消"`. |
| `tone` | `"default"` or `"danger"`. Danger makes the confirm button red and puts initial focus on Cancel. |

`AlertOptions` for `dialog.alert`: `title`, `description?`, `confirmLabel?` (default `"知道了"`), `tone?`.

The default labels are Chinese literals today; they do not follow `<LocaleProvider>` yet. Pass `cancelLabel` and `confirmLabel` for other languages.

Confirm and alert dialogs are `role="alertdialog"`. A backdrop click does not close an alert dialog; Escape does.

### Stacking

Calling `dialog.open` (or `confirm` / `alert`) while another dialog is open stacks the new one on top. Escape closes only the top dialog, and the backdrop of a lower dialog does not take clicks meant for the one above. Closing a dialog also closes everything above it; each of those resolves with its own dismiss value (`undefined`, or `false` for a confirm).

A stacked dialog mounts only after the one below it has finished opening. So `render` must return a `DialogContent` (or a Base UI dialog popup); otherwise the dialogs above it never appear.

### Hosts and scoping

- `<Dialogs>` takes `manager?` and `children?`. Inside its children, `useDialog()` returns `{ dialog }` for that host. Outside any host, it returns the default `dialog`.
- `createDialogManager()` creates a separate manager for a scoped host: `<Dialogs manager={m}>…</Dialogs>`. Mount one host per manager.
- A manager also has `subscribe` and `getSnapshot` (the list of open `DialogEntry` items), so `useStore` can read it.

```tsx
import { Button, Dialogs, createDialogManager, useDialog } from "@anyknown/ui"

const settingsDialogs = createDialogManager()

function DeleteKeyButton() {
  const { dialog } = useDialog() // settingsDialogs inside the host below
  return (
    <Button
      variant="danger"
      onClick={async () => {
        const ok = await dialog.confirm({ title: "Delete this key?", confirmLabel: "Delete key", tone: "danger" })
        if (ok) deleteKey()
      }}
    >
      Delete key
    </Button>
  )
}

<Dialogs manager={settingsDialogs}>
  <DeleteKeyButton />
</Dialogs>
```

### Declarative: `<Dialog>` and `ConfirmDialog`

Use these when a trigger in the tree owns the dialog.

```tsx
import { Button, ConfirmDialog, Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "@anyknown/ui"

<Dialog>
  <DialogTrigger><Button variant="secondary">Rename workspace</Button></DialogTrigger>
  <DialogContent title="Rename workspace" description="The new name syncs to every member.">
    <DialogActions>
      <DialogClose><Button variant="ghost">Cancel</Button></DialogClose>
      <DialogClose><Button onClick={save}>Save</Button></DialogClose>
    </DialogActions>
  </DialogContent>
</Dialog>

<ConfirmDialog
  trigger={<Button variant="danger">Delete memory</Button>}
  title="Delete this memory?"
  confirmLabel="Delete memory"
  danger
  onConfirm={deleteMemory}
/>
```

- `Dialog` is the root: `open`, `defaultOpen`, `onOpenChange`.
- `DialogContent` takes `title`, `description?`, `size` (`"sm"` default, `"md"`, `"full"`), `body` (the part that scrolls under a pinned header), `sx` and `bodySx`.
- `ConfirmDialog` takes `title`, `description?`, `danger?`, `confirmLabel` (required), `cancelLabel?` (default `"取消"`), `onConfirm`, `trigger?`, and `open` / `defaultOpen` / `onOpenChange`.

See the [Dialog](../../src/components/dialog/README.md) and [Toast](../../src/components/toast/README.md) pages for accessibility and keyboard details.

## Controlled and uncontrolled props

A component with its own state can be uncontrolled (it keeps the state; you give a starting value) or controlled (you keep the state and pass it in). The convention the library is aligning to is:

| Prop | Meaning |
| --- | --- |
| `value` | Controlled value. When it is not `undefined`, the component shows it and never changes it on its own. |
| `defaultValue` | Starting value when uncontrolled. |
| `onValueChange(value)` | Called with the new value on every change, in both modes. |

Booleans follow the same shape with their own name: `checked` / `defaultChecked` / `onCheckedChange`, and `open` / `defaultOpen` / `onOpenChange`.

```tsx
import { Tabs, TabsList, TabsPanel, TabsTab } from "@anyknown/ui"
import { useState } from "react"

// Uncontrolled
<Tabs defaultValue="chat">…</Tabs>

// Controlled
function Panel() {
  const [tab, setTab] = useState("chat")
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList aria-label="Thread view">
        <TabsTab value="chat">Chat</TabsTab>
        <TabsTab value="files">Files</TabsTab>
      </TabsList>
      <TabsPanel value="chat">…</TabsPanel>
      <TabsPanel value="files">…</TabsPanel>
    </Tabs>
  )
}
```

Internally, hand-written components use `useControllableState(controlled, defaultValue, onChange)` from `src/lib/useControllableState.ts` (not exported). It treats `undefined` as "uncontrolled" and calls `onChange` on every set.

**The API is being aligned to `value` / `defaultValue` / `onValueChange`.** Today these follow it:

- `Tabs`, `RadioGroup`, `PasswordInput`, `Select` (`value` / `defaultValue` / `onValueChange`).
- `Checkbox`, `Switch` (`checked` / `defaultChecked` / `onCheckedChange`; the native `onChange` also fires).
- `Dialog`, `ConfirmDialog`, `Popover`, `DropdownMenu` (`open` / `defaultOpen` / `onOpenChange`).

Today's exceptions:

- `Slider`, `SliderCell` and `Segmented` are controlled only: `value` and a required `onChange(value)`. There is no `defaultValue`. `Slider` and `SliderCell` also have `onValueCommit` for saving once per gesture.
- `ReasoningFold` takes `defaultOpen` and `onToggle(open)`, with no controlled `open`. `HandoffReceipt` and `ToolCard` take only `defaultOpen`.
- `Composer` uses `model` / `onModelChange`. `FileRow` uses `selected` / `onSelectChange`. `DataTable` uses `filter` / `onFilterChange`, `sort` / `onSortChange` and `selected` / `onSelectedChange`.
- `Input` and `Textarea` are native elements: `value` / `defaultValue` / `onChange(event)` as in plain React.
