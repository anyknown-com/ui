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

function ToastCount() {
  // The snapshot keeps closed toasts while they fade out; `leaving` marks them.
  const showing = useStore(toastManager, (s) => s.toasts.filter((t) => !t.leaving).length)
  return <span>{showing} notifications</span>
}
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

| Call | Returns | What it does |
| --- | --- | --- |
| `toast(title, options?)` | `string` (id) | Adds a default toast. |
| `toast.success(title, options?)` | `string` | Adds a success toast. |
| `toast.danger(title, options?)` | `string` | Adds a danger toast. It is `role="alert"` and waits to be dismissed. |
| `toast.warning(title, options?)` | `string` | Adds a warning toast. |
| `toast.info(title, options?)` | `string` | Adds an info toast. |
| `toast.update(id, patch)` | `void` | Changes `title`, `description`, `type`, `action` or `timeout` in place and restarts the countdown. Does nothing if the toast is gone or closing. |
| `toast.close(id)` | `void` | Closes one toast. It fades out and its `onClose` runs. There is no `dismiss` method. |
| `toast.closeAll()` | `void` | Closes every toast on screen. Each one's `onClose` runs. |
| `toast.promise(promise, messages)` | the same `Promise<T>` | Shows `messages.loading` with a spinner and no countdown. When the promise settles, the toast becomes a success or danger toast and starts counting down. |

Every type except `danger` is a polite `role="status"`. Every type except `default` starts with a visually hidden word ("Success:", "Error:", "Warning:", "Info:"), because the colored dot alone tells a screen reader nothing.

Each state of `toast.promise` is a `ToastMessage`: a string, or `{ title, description? }`. `success` and `error` can also be functions that get the value or the error and return a `ToastMessage`. A state without a `description` clears the description of the state before it.

```tsx
const id = toast("Uploading 3 files…", { timeout: 0 })
toast.update(id, { title: "Uploaded 3 files", type: "success", timeout: 4000 })

await toast.promise(syncVault(), {
  loading: { title: "Syncing vault…", description: "This can take a minute." },
  success: (count) => `Synced ${count} items`,
  error: (error) => ({
    title: "Sync failed",
    description: error instanceof Error ? error.message : undefined,
  }),
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
| `onClose` | `() => void` | Runs once when the toast closes, whatever closed it: its close or action button, its timeout, `toast.close` or `toast.closeAll`, or a newer toast pushing it past `limit`. |
| `onAutoClose` | `() => void` | Runs when the toast closes because its timeout ran out, just before `onClose`. |

```tsx
toast.info("Draft restored", {
  action: { label: "Discard", onClick: discardDraft },
  onAutoClose: () => track("draft-toast-expired"),
  onClose: () => track("draft-toast-closed"),
})
```

When you omit `timeout`, the toast uses the `<Toaster>` `timeout`, except in two cases. A toast with an `action` and a danger toast stay until the user closes them (WCAG 2.2.1: a keyboard user may need many Tab presses to reach the button). Pass `timeout` to make them count down anyway. A loading toast from `toast.promise` never counts down.

Countdowns pause while the pointer is over the viewport, while focus is inside it, and while the page is hidden. Under reduced motion the countdown line is not drawn and closed toasts leave without a fade.

### Keyboard

- <kbd>F8</kbd> moves focus to the notification region while at least one toast is on screen. The region announces the key with `aria-keyshortcuts`.
- <kbd>Escape</kbd> inside the region returns focus to where it was before <kbd>F8</kbd>.
- Closing the toast that has focus keeps focus in the region. When it was the last toast, focus goes back to where it was before <kbd>F8</kbd>.

### `<Toaster>` props

| Prop | Default | Notes |
| --- | --- | --- |
| `position` | `"bottom-right"` | Also `"bottom-left"`, `"top-right"`, `"top-left"`. Left and right are logical: they flip under RTL. |
| `timeout` | `5000` | The default countdown in ms. |
| `limit` | `3` | The most toasts on screen. When a new one goes over the limit, the oldest is dropped (its `onClose` runs). |
| `manager` | the default manager | A manager from `createToastManager()`; see below. |
| `children` | — | Content that `useToast()` reaches this viewport from; see below. |
| `labels` | — | Overrides built-in words (`region`, `dismiss`, `success`, `danger`, `warning`, `info`). The rest follow `<LocaleProvider>`. See [Internationalization](./i18n.md). |

### Scoped viewports

`toast` writes to one default manager, `toastManager`. For a second, separate viewport (for example inside an embedded panel), create a manager and pass it to its own `<Toaster>`. Wrap the panel in that `<Toaster>`, and `useToast()` inside it returns a `toast` bound to the panel's manager:

```tsx
import { Button, Toaster, createToastManager, useToast } from "@anyknown/ui"

const panelToasts = createToastManager()

function SaveButton() {
  const { toast } = useToast() // panelToasts inside the Toaster below
  return <Button onClick={() => toast.success("Saved")}>Save</Button>
}

function Panel() {
  return (
    <Toaster manager={panelToasts} position="top-right">
      <SaveButton />
    </Toaster>
  )
}
```

- `useToast()` returns `{ toast }` for the nearest `<Toaster>` that wraps the caller. Outside one, it returns the default `toast`.
- The `toast` it returns has the same methods as the default one: `success`, `danger`, `warning`, `info`, `update`, `close`, `closeAll` and `promise`.
- The viewport itself is portalled to `<body>`, so where you put the `<Toaster>` decides only which components `useToast()` reaches, not where the toasts appear.

Outside React, call the manager directly. Its `add` takes one object: `{ title, type?, description?, action?, timeout?, key?, onClose?, onAutoClose? }`.

```tsx
const id = panelToasts.add({ title: "Saved", type: "success" })
panelToasts.update(id, { title: "Saved again" })
panelToasts.close(id)
panelToasts.closeAll()
panelToasts.promise(save(), { loading: "Saving…", success: "Saved", error: "Save failed" })
```

A manager also has `subscribe` and `getSnapshot` (a `ToastState`: `{ toasts, paused }`), so `useStore` can read it. `toasts` is newest first and includes toasts that are fading out (`leaving: true`). `configure`, `pause` and `resume` are internal to `<Toaster>`.

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
| `dialog.confirm(options)` | `Promise<boolean>` | `true` when confirmed; `false` on cancel, Escape, `closeAll`, or a dialog below it closing. |
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
| `cancelLabel` | Default: the locale's `cancel` word ("Cancel", 取消). |
| `tone` | `"default"` or `"danger"`. Danger makes the confirm button red and puts initial focus on Cancel. |

`AlertOptions` for `dialog.alert`: `title`, `description?`, `confirmLabel?` (default: the locale's `acknowledge` word, "OK" or 知道了), `tone?`.

Confirm and alert dialogs are `role="alertdialog"`. A backdrop click does not close an alert dialog; Escape does.

### Built-in words

The two words a confirm or alert supplies on its own follow `<LocaleProvider>`. Their table type is `DialogLabels`:

| Key | `en` | `zh-TW` | Used for |
| --- | --- | --- | --- |
| `cancel` | Cancel | 取消 | The cancel button of a confirm. |
| `acknowledge` | OK | 知道了 | The only button of an alert. |

Override them for every confirm and alert a host renders with `<Dialogs labels>`. A `cancelLabel` or `confirmLabel` passed to one call still wins:

```tsx
import { Dialogs } from "@anyknown/ui"

<Dialogs labels={{ cancel: "Keep editing", acknowledge: "Got it" }}>{/* … */}</Dialogs>
```

### Closing

- When a dialog closes, its promise settles at once, as the exit fade starts. Code after `await dialog.confirm(...)` does not wait for the animation.
- The entry stays in the manager's snapshot with `closing: true` until the fade ends. It is removed at once under reduced motion, or when no `<Dialogs>` host is mounted.
- Focus goes back to the element that opened the dialog as the exit starts.

### Stacking

Calling `dialog.open` (or `confirm` / `alert`) while another dialog is open stacks the new one on top. Escape closes only the top dialog, and the backdrop of a lower dialog does not take clicks meant for the one above. Closing a dialog also closes everything above it; each of those resolves with its own dismiss value (`undefined`, or `false` for a confirm).

A stacked dialog mounts only after the one below it has finished opening. So `render` must return a `DialogContent` (or a Base UI dialog popup); otherwise the dialogs above it never appear.

### Hosts and scoping

- `<Dialogs>` takes `manager?`, `children?` and `labels?`. Inside its children, `useDialog()` returns `{ dialog }` for that host. Outside any host, it returns the default `dialog`.
- `createDialogManager()` creates a separate manager for a scoped host: `<Dialogs manager={m}>…</Dialogs>`. Mount one host per manager.
- A manager also has `subscribe` and `getSnapshot`: the open `DialogEntry` items (`{ id, render, role, closing }`), bottom first, including ones still fading out. `useStore` can read it.

```tsx
import { Button, Dialogs, createDialogManager, useDialog, useStore } from "@anyknown/ui"

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

function OpenCount() {
  const open = useStore(settingsDialogs, (entries) => entries.filter((e) => !e.closing).length)
  return <span>{open} open</span>
}

function Settings() {
  return (
    <Dialogs manager={settingsDialogs}>
      <DeleteKeyButton />
      <OpenCount />
    </Dialogs>
  )
}
```

### Declarative: `<Dialog>` and `ConfirmDialog`

Use these when a trigger in the tree owns the dialog.

```tsx
import { Button, ConfirmDialog, Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "@anyknown/ui"

function RenameWorkspace() {
  return (
    <Dialog>
      <DialogTrigger><Button variant="secondary">Rename workspace</Button></DialogTrigger>
      <DialogContent title="Rename workspace" description="The new name syncs to every member.">
        <DialogActions>
          <DialogClose><Button variant="ghost">Cancel</Button></DialogClose>
          <DialogClose><Button onClick={save}>Save</Button></DialogClose>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

function DeleteMemory() {
  return (
    <ConfirmDialog
      trigger={<Button variant="danger">Delete memory</Button>}
      title="Delete this memory?"
      confirmLabel="Delete memory"
      danger
      onConfirm={deleteMemory}
      labels={{ cancel: "Keep it" }}
    />
  )
}
```

- `Dialog` is the root: `open`, `defaultOpen`, `onOpenChange`.
- `DialogContent` takes `title`, `description?`, `size` (`"sm"` default, `"md"`, `"full"`), `body` (the part that scrolls under a pinned header), `sx` and `bodySx`.
- `ConfirmDialog` takes `title`, `description?`, `danger?`, `confirmLabel` (required), `cancelLabel?`, `labels?`, `onConfirm`, `trigger?`, and `open` / `defaultOpen` / `onOpenChange`. Its cancel button reads `cancelLabel`, then `labels.cancel`, then the locale. It does not read the `labels` of a `<Dialogs>` host.

See the [Dialog](../../src/components/dialog/README.md) and [Toast](../../src/components/toast/README.md) pages for accessibility and keyboard details.

## Controlled and uncontrolled props

A component with its own state can be uncontrolled (it keeps the state; you give a starting value) or controlled (you keep the state and pass it in). Every stateful component uses one shape, named after what the state is:

| Prop | Meaning |
| --- | --- |
| `value` | Controlled value. When it is not `undefined`, the component shows it and never changes it on its own. |
| `defaultValue` | Starting value when uncontrolled. |
| `onValueChange(value)` | Called with the new value on every change, in both modes. |

Other kinds of state use their own name in the same three slots: `checked` / `defaultChecked` / `onCheckedChange`, `open` / `defaultOpen` / `onOpenChange`, `pressed` / `defaultPressed` / `onPressedChange`, `selected` / `defaultSelected` / `onSelectedChange`.

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

Hand-written components use `useControllableState(controlled, defaultValue, onChange)` from `src/lib/useControllableState.ts` (not exported). It treats `undefined` as "uncontrolled" and calls `onChange` on every set.

### Which components follow it

| State | Components |
| --- | --- |
| `value` / `defaultValue` / `onValueChange` | `Tabs`, `RadioGroup`, `Select`, `PasswordInput`, `Slider`, `SliderCell`, `Segmented`, `Composer` |
| `checked` / `defaultChecked` / `onCheckedChange` | `Checkbox`, `Switch`, `DropdownCheckboxItem` |
| `open` / `defaultOpen` / `onOpenChange` | `Dialog`, `ConfirmDialog`, `Popover`, `DropdownMenu`, `GroupItem`, `ToolCard`, `HandoffReceipt`, `ReasoningFold` |
| `pressed` / `defaultPressed` / `onPressedChange` | `Chip` (a toggle chip) |
| `selected` / `defaultSelected` / `onSelectedChange` | `FileRow` (a boolean), `DataTable` (a `Set<string>` of row keys) |
| `filter` / `defaultFilter` / `onFilterChange`, `sort` / `defaultSort` / `onSortChange` | `DataTable` |

```tsx
import { Chip, Segmented, Slider } from "@anyknown/ui"
import { useState } from "react"

// Uncontrolled: the component keeps the value; you only hear about changes.
function Preferences() {
  return (
    <>
      <Segmented
        label="Language"
        defaultValue="en"
        options={[
          { value: "en", label: "English" },
          { value: "zh-TW", label: "繁體中文" },
        ]}
        onValueChange={(lang) => saveLanguage(lang)}
      />
      <Chip defaultPressed onPressedChange={(on) => setFilter("unread", on)}>Unread</Chip>
    </>
  )
}

// Controlled, saving once per gesture.
function Volume() {
  const [volume, setVolume] = useState(0.5)
  return (
    <Slider aria-label="Volume" value={volume} onValueChange={setVolume} onValueCommit={saveVolume} />
  )
}
```

Details worth knowing:

- `Input` and `Textarea` are native elements, so `value` and `defaultValue` work as in plain React. They add `onValueChange(text)` next to the native `onChange(event)`; both fire.
- `Slider` and `SliderCell` also have `onValueCommit`: once when a drag ends, once per key that moved the value. Save there, not in `onValueChange`.
- A controlled `Composer` gets `onValueChange("")` after a send, so it clears when you apply the value.
- `ReasoningFold` does not report its automatic open while `streaming` or the collapse after it. `ToolCard` does not report opening itself on error.
- `Expand` takes an optional `open`. Without it, it follows its `GroupItem`.

### Exceptions

- `Composer`'s model picker is `model` / `onModelChange` with no `defaultModel`. Without `model`, the native picker keeps its own choice, starting at the first model.
- `RecoveryKey`'s checkbox is `ack` / `onAckChange` with no `defaultAck`. Without `ack`, the checkbox keeps its own state.
- `Toggle` (the expand button of a table row) is controlled only: `open` is required, and it reports presses through `onOpenChange` or `onPress`.

### Deprecated names

These still work and are called with the same value as the new prop. They will be removed in a future major:

| Component | Deprecated | Use |
| --- | --- | --- |
| `Slider`, `SliderCell`, `Segmented` | `onChange(value)` | `onValueChange` |
| `FileRow` | `onSelectChange` | `onSelectedChange` |
| `ReasoningFold` | `onToggle` | `onOpenChange` |
