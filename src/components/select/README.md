# Select

A trigger styled like an input that opens a floating list with a search box, optional groups and optional multiple selection, built on Base UI Combobox.

## When to use

- Choosing a value from a list too long to show as radios (models, workspaces).
- Lists that benefit from type-to-filter and from groups (`SelectGroup`).
- Picking several values, shown as removable chips in the trigger (`multiple`).

## When not to use

- For two to about six visible options, use [RadioGroup](../radio/README.md) or [Segmented](../segmented/README.md).
- For actions (rename, delete, export), use [DropdownMenu](../dropdown/README.md).

## Usage

```tsx
import { Select, SelectGroup, SelectItem } from "@anyknown/ui"

<Select
  aria-label="Model"
  placeholder="Choose a model…"
  searchPlaceholder="Search models…"
  searchLabel="Search models"
  emptyLabel={(query) => `No model matches “${query}”.`}
  value={model}
  onValueChange={(next: string) => setModel(next)}
>
  <SelectGroup label="Anthropic">
    <SelectItem value="fable-5" hint="Strongest">Fable 5</SelectItem>
    <SelectItem value="sonnet-5" hint="Fast">Sonnet 5</SelectItem>
  </SelectGroup>
</Select>
```

The family is `Select`, `SelectGroup` (a labelled group) and `SelectItem` (`value`, `hint`, `disabled`, and `textValue` when the children are not plain text). With `multiple`, `value` is a `string[]` and `onValueChange` receives a `string[]`. `searchable={false}` hides the search box. Empty groups are hidden while filtering.

## Accessibility

- Base UI Combobox: the trigger has `role="combobox"` with `aria-expanded`; the list is a `listbox` of `option`s; group labels name their groups.
- Accessible name: pass `aria-label` or `aria-labelledby`. The trigger is labelled by that name and by its own text, so the current value is read too. Select does not read [Field](../label/README.md) context, so a Field `label` does not name it.
- The search box is named by `searchLabel`. Without the search box, a visually hidden input carries the name.
- The empty state shows the query (`emptyLabel(query)`).
- Highlighted option: `accentSubtle` fill and a 2px `focusRing` outline; in forced-colors mode the outline is `Highlight`.
- Focus returns to the trigger as soon as the popup starts to close, not after the fade.
- The popup grow-in and fade-out are off under `prefers-reduced-motion: reduce`.
- Built-in words are Traditional Chinese defaults and do not follow `<LocaleProvider>`: `placeholder` (`選擇…`), `searchPlaceholder` (`搜尋…`), `searchLabel` (`搜尋選項`), `emptyLabel` (`找不到「…」。`). The chip remove button's name (`移除 <option>`) has no prop.
- Known gap (A11Y-DEBT): the search placeholder uses `textFaint`, below 4.5:1.

## Keyboard

Base UI Combobox handles these keys.

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> on the trigger | Opens the list. |
| Typing | Filters the options (when `searchable`). |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Moves the highlight. |
| <kbd>Enter</kbd> | Selects the highlighted option. Single select closes; `multiple` stays open. |
| <kbd>Escape</kbd> | Closes the list. |

## Related

- [DropdownMenu](../dropdown/README.md) — for actions instead of values.
- [RadioGroup](../radio/README.md) — for short lists that stay visible.
- [Popover](../popover/README.md) — the floating layer Select shares its look with.
