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
import { Field, Select, SelectGroup, SelectItem } from "@anyknown/ui"

<Field label="Model" help="Used for new chats." error={error} required>
  <Select
    value={model}
    onValueChange={(next: string) => setModel(next)}
    labels={{ searchPlaceholder: "Search models…", empty: (q) => `No model matches “${q}”.` }}
  >
    <SelectGroup label="Anthropic">
      <SelectItem value="fable-5" hint="Strongest">Fable 5</SelectItem>
      <SelectItem value="sonnet-5" hint="Fast">Sonnet 5</SelectItem>
    </SelectGroup>
  </Select>
</Field>

// Outside a Field, name it yourself. Uncontrolled, several values:
<Select aria-label="Memories" multiple defaultValue={["pnpm"]} name="memories">
  <SelectItem value="pnpm">Prefer pnpm</SelectItem>
</Select>
```

The family is `Select`, `SelectGroup` (a labelled group) and `SelectItem` (`value`, `hint`, `disabled`, and `textValue` when the children are not plain text).

- Value: `value` (controlled) or `defaultValue` (uncontrolled), and `onValueChange`. With `multiple`, the value is a `string[]`.
- State: `disabled`, `required`, `invalid` (danger border and `aria-invalid`), and `name` to submit with a form. Inside a `Field`, `disabled`, `required`, `invalid` and `aria-describedby` come from the Field; props you pass win.
- `searchable={false}` hides the search box. Empty groups are hidden while filtering.
- Words: `labels` (`placeholder`, `searchPlaceholder`, `searchLabel`, `remove(item)`, `empty(query)`). The single props `placeholder`, `searchPlaceholder`, `searchLabel` and `emptyLabel(query)` still work and win over `labels`.

## Accessibility

- APG select-only combobox on Base UI Combobox: the trigger has `role="combobox"` with `aria-expanded`; the list is a `listbox` of `option`s; group labels name their groups.
- Name: inside a `Field`, the trigger takes the Field's control id, so the Field `label` names it and the Field's error and help describe it. Outside a Field, pass `aria-label` or `aria-labelledby`; the trigger's `aria-labelledby` then lists that name and the trigger itself, so the current value is read too. With `multiple` the trigger is a `div`, which `<label for>` cannot name, so inside a Field the trigger, the list and the search box point `aria-labelledby` at the Field's label instead.
- `required` sets `aria-required`; `invalid` (or a Field `error`) sets `aria-invalid`. Under `forced-colors: active` an invalid trigger has a 2px dashed frame.
- The search box is named by `searchLabel`. Without the search box, a visually hidden input carries the Select's name.
- Each chip's remove button is named by `remove(item)`. Clicking it does not open the list.
- The empty state shows the query (`empty(query)`).
- Highlighted option: `accentSubtle` fill and a 2px `focusRing` outline; in forced-colors mode the outline is `Highlight`.
- Focus returns to the trigger as soon as the popup starts to close, not after the fade.
- The popup sits above dialogs, so a Select inside a Dialog opens on top.
- The popup grow-in and fade-out are off under `prefers-reduced-motion: reduce`.
- Built-in words follow `<LocaleProvider>` (zh-TW by default, or en): `placeholder`, `searchPlaceholder`, `searchLabel`, `remove(item)`, `empty(query)`. Override them per instance with `labels`.
- The trigger placeholder and the search placeholder use `textMuted` (6.35:1 light on `surface`), above 4.5:1.

## Keyboard

Base UI Combobox handles these keys.

| Key | Action |
| --- | --- |
| <kbd>↓</kbd> / <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger | Opens the list. |
| Typing | Filters the options (when `searchable`). |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Moves the highlight. |
| <kbd>Enter</kbd> | Picks the highlighted option. Single select closes and focus returns to the trigger; `multiple` stays open. |
| <kbd>Escape</kbd> | Closes the list without picking; focus returns to the trigger. |

## Related

- [Field](../label/README.md) — label, help and error for the trigger.
- [DropdownMenu](../dropdown/README.md) — for actions instead of values.
- [RadioGroup](../radio/README.md) — for short lists that stay visible.
- [Popover](../popover/README.md) — the floating layer Select shares its look with.
