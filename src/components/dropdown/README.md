# DropdownMenu

A menu of actions that opens from a trigger button, with groups, separators, checkbox items, shortcut hints, danger items and nested submenus, built on Base UI Menu.

## When to use

- A set of actions on one object ("Thread actions": rename, export, delete).
- Overflow actions behind a "more" icon button.
- A few view toggles next to actions (`DropdownCheckboxItem`).

## When not to use

- For choosing a value that the trigger then shows, use [Select](../select/README.md).
- For rich, non-menu content anchored to a button, use [Popover](../popover/README.md).
- For a destructive action that needs confirmation, open [Dialog](../dialog/README.md)'s `dialog.confirm` from the item.

## Usage

```tsx
import {
  Button, DropdownCheckboxItem, DropdownGroup, DropdownItem,
  DropdownMenu, DropdownSeparator, DropdownSub,
} from "@anyknown/ui"

<DropdownMenu trigger={<Button variant="secondary">Thread actions</Button>}>
  <DropdownGroup label="This thread">
    <DropdownItem shortcut="⌘N" onSelect={addNote}>Add handoff note</DropdownItem>
    <DropdownSub label="Export">
      <DropdownItem onSelect={exportMarkdown}>Markdown</DropdownItem>
      <DropdownItem onSelect={exportJson}>JSON</DropdownItem>
    </DropdownSub>
  </DropdownGroup>
  <DropdownSeparator />
  <DropdownCheckboxItem checked={showReceipts} onCheckedChange={setShowReceipts}>
    Show handoff receipts
  </DropdownCheckboxItem>
  <DropdownItem variant="danger" onSelect={confirmDelete}>Delete this day</DropdownItem>
</DropdownMenu>
```

The family is `DropdownMenu` (root; `trigger`, `open` / `defaultOpen` / `onOpenChange`, `side`, `align`), `DropdownItem`, `DropdownCheckboxItem`, `DropdownGroup`, `DropdownSeparator` and `DropdownSub` (submenus nest to any depth).

## Accessibility

- Base UI Menu: the `trigger` element gets `aria-haspopup` and `aria-expanded`; the popup is `role="menu"` with `menuitem`, `menuitemcheckbox` (with `aria-checked`) and `separator`. `DropdownGroup`'s `label` names its group.
- The trigger must be a single focusable element with its own name (a `Button`, or an `IconButton` with `label`).
- `shortcut` is shown visually with `aria-hidden` and exposed as `aria-keyshortcuts`, so it is not part of the item's name. The menu does not bind the shortcut; the app must.
- `icon` and the submenu chevron are `aria-hidden`.
- `variant="danger"` is color only; the item text must say what happens.
- Highlighted item: `accentSubtle` fill and a 2px `focusRing` outline; in forced-colors mode the outline is `Highlight`.
- The popup grow-in, the fade-out and the submenu animation are off under `prefers-reduced-motion: reduce`.
- Escape closes the menu and returns focus to the trigger.

## Keyboard

Base UI Menu handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> on the trigger | Opens the menu. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Moves the highlight. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Moves to the first or last item. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the item. A `DropdownItem` closes the menu; a checkbox item toggles and stays open. |
| <kbd>→</kbd> | Opens the highlighted submenu. |
| <kbd>←</kbd> | Closes the current submenu. |
| <kbd>Escape</kbd> | Closes the menu and returns focus to the trigger. |
| Typing a letter | Moves to the next item starting with it. |

## Related

- [Select](../select/README.md) — for picking a value.
- [Popover](../popover/README.md) — for anchored content that is not a menu.
- [IconButton](../icon-button/README.md) — the usual trigger for an overflow menu.
- [Kbd](../kbd/README.md) — for shortcut hints outside menus.
