# Sheet

A modal panel that slides up from the bottom of the window, built on Base UI Drawer, for a choice on a narrow screen such as a model or an effort level.

## When to use

- A list of choices opened from a small control on a phone-size or narrow layout, where a dropdown would be cramped.
- Content that needs the full width of a narrow screen and closes with a swipe down.

## When not to use

- On a wide layout, for a list of choices next to its trigger, use [DropdownMenu](../dropdown/README.md) or [Popover](../popover/README.md).
- For a task that must be confirmed or cancelled, use [Dialog](../dialog/README.md).
- For a short message that needs no answer, use [Toast](../toast/README.md).

## Usage

```tsx
import { Button, Sheet, SheetContent, SheetTrigger } from "@anyknown/ui"

const [open, setOpen] = useState(false)

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger>
    <Button variant="secondary">Model</Button>
  </SheetTrigger>
  <SheetContent title="Opus 5.5 · Your subscription" height="tall" head={<BackButton />}>
    {models.map((model) => (
      <Row key={model.id} onClick={() => { pick(model); setOpen(false) }}>{model.name}</Row>
    ))}
  </SheetContent>
</Sheet>
```

The family is `Sheet` (root; `open` / `defaultOpen` / `onOpenChange`), `SheetTrigger` and `SheetContent` (`title`, `height`, `head`, `children`).

- `title` is required. It sits under the grab bar on one line and is cut off with an ellipsis.
- `height="auto"` (the default) fits the content, up to 85% of the window. `height="tall"` is always 60% of the window, so the sheet does not jump while the list changes.
- `head` stays put under the title (a back button, a filter); `children` scroll.
- The panel is full width up to 560px, centred, and leaves room for the bottom safe area (`env(safe-area-inset-bottom)`).
- To close it after a pick, control `open` and set it to `false` in the row's handler.

## Accessibility

- Base UI Drawer: the trigger gets `aria-expanded`; the panel is `role="dialog"`, named by its `title` (an `h2`).
- Focus moves into the sheet when it opens and is trapped there; the page behind is inert and does not scroll.
- Escape, a click on the backdrop and a swipe down close it. Focus returns to the trigger as soon as the exit starts, not after the slide.
- `SheetTrigger` renders its single child element; it must be focusable and have its own name (an `IconButton` needs `aria-label`).
- The grab bar is decoration (`aria-hidden`); a swipe is never the only way to close.
- The slide and the backdrop fade are off under `prefers-reduced-motion: reduce`. A transparent border keeps an edge in forced-colors mode.
- The sheet has no built-in words, so nothing here follows `<LocaleProvider>`.

## Keyboard

Base UI Drawer handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger | Opens the sheet and moves focus into it. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the content and stays inside the sheet. |
| <kbd>Escape</kbd> | Closes the sheet and returns focus to the trigger. |

## Related

- [Dialog](../dialog/README.md) — the centred modal; same focus trap and backdrop.
- [DropdownMenu](../dropdown/README.md) — the same choices on a wide layout.
- [Popover](../popover/README.md) — a non-modal panel anchored to its trigger.
