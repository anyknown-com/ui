# Toast

Non-blocking notifications: `toast(...)` adds one from anywhere, and `<Toaster />` is the viewport that stacks them in a corner, counts them down and announces them.

## When to use

- Confirming something that already happened ("Summary copied").
- An undo right after an action, as one action button ("Deleted · Undo").
- Progress of a background task that settles later (`toast.promise`).

## When not to use

- For a decision the user must make before going on, use [Dialog](../dialog/README.md)'s `dialog.confirm`.
- For an error tied to a form field, use the `error` of [Field](../label/README.md).
- For a lasting state of a page or region, show it in place, for example with [EmptyState](../empty-state/README.md) or [StatusBadge](../status-badge/README.md).

## Usage

```tsx
import { Toaster, toast } from "@anyknown/ui"

<Toaster />

toast("Handoff summary copied")
toast.success("Handoff complete", { description: "3 memories carried into the new thread" })
toast.warning("Vault is almost full", { onClose: track })
toast("Deleted “prefers pnpm”", { action: { label: "Undo", onClick: restore } })
toast.promise(syncVault(), {
  loading: "Syncing vault…",
  success: (n) => ({ title: "Vault synced", description: `${n} memories` }),
  error: "Sync failed",
})
```

- `toast(title, options)`, `toast.success`, `toast.danger`, `toast.warning` and `toast.info` return an id. Options: `description`, `action` (`{ label, onClick }`; pressing it also closes the toast), `timeout` in ms (`0` never closes), `key`, `onClose` (once, whatever closed it: button, timeout, `close`, `closeAll`, or being pushed past `limit`) and `onAutoClose` (only when the timeout ran out, before `onClose`).
- `toast.update(id, { title?, description?, type?, action?, timeout? })` changes a toast in place and restarts its countdown. `toast.close(id)` closes one; `toast.closeAll()` closes every toast on screen.
- `toast.promise(promise, { loading, success, error })` shows a spinner that does not count down, then becomes success or danger. Each state is a `ToastMessage` (a string, or `{ title, description? }`); `success` and `error` can also be functions of the value or reason. It returns the original promise.
- The same `key` while a toast is on screen updates that toast, restarts it and shows a count (×N) instead of stacking a new one.
- `<Toaster>` props: `position` (`"bottom-right"` default, `"bottom-left"`, `"top-right"`, `"top-left"`), `timeout` (5000), `limit` (3; beyond it the oldest is dropped), `manager`, `labels`, `children`.
- Scoping: `createToastManager()` plus `<Toaster manager={m}>…</Toaster>`. `useToast()` returns `{ toast }` for the nearest `<Toaster>` that wraps the caller as `children`, or the default `toast` outside one. A manager also has `add({ title, type, … })`, `update`, `close`, `closeAll` and `promise`.

```tsx
const m = createToastManager()
<Toaster manager={m}><Panel /></Toaster>

function Panel() {
  const { toast } = useToast() // reaches m
  return <Button onClick={() => toast.info("Saved locally")}>Save</Button>
}
```

## Accessibility

- The viewport is a permanent `role="region"` with `aria-live="polite"` and `aria-keyshortcuts="F8"`, named by the `region` word and portalled to `document.body`.
- Each toast is `role="status"` with `aria-atomic="true"`, so updates and the ×N count are read again in full. A danger toast is `role="alert"`.
- The color dot is backed by a visually hidden word ("Success:", "Error:", "Warning:", "Info:"). Every toast has a dismiss button named by the `dismiss` word.
- Toasts with an `action` or of type danger do not close on their own (WCAG 2.2.1), unless the caller passes `timeout`. Loading toasts never count down. Warning and info time out like the default.
- The countdown pauses while the viewport is hovered, while focus is inside it, and while the document is hidden.
- A closing toast is `aria-hidden` and `inert` at once, then fades out. Closing the focused toast keeps focus in the region, or after the last one returns it to where it was before <kbd>F8</kbd>.
- Under `prefers-reduced-motion: reduce`: no slide-in, no fade-out (closed toasts are removed at once) and no countdown line; toasts still time out.
- Built-in words follow `<LocaleProvider>` (`zh-TW` default, `en`): `region`, `dismiss`, `success`, `danger`, `warning`, `info`. Override any of them with `<Toaster labels={{ dismiss: "Close" }} />`.
- The caller supplies short, plain titles; the `action` label must make sense on its own.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>F8</kbd> | Moves focus to the notifications (only when at least one is showing; no modifier keys). |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between action and dismiss buttons. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button (native `<button>`). |
| <kbd>Escape</kbd> | Inside the region, returns focus to where it was before <kbd>F8</kbd>. |

## Related

- [Dialog](../dialog/README.md) — the same imperative shape, for blocking decisions.
- [Spin](../spin/README.md) — the spinner shown while `toast.promise` is loading.
- [Button](../button/README.md) — for the action that triggers a toast.
