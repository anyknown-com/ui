# Group

A grouped settings list: an optional muted header, then one sunken `surface` region of 44px cells with hairlines between them, then an optional muted footer that says what the settings do.

## When to use

- A settings page made of grouped lines: a reading with a value, a way into a sub-page, one choice of several, a switch, a short field, or a slider.
- When each group needs a header above it or a footer sentence under it.
- A list of things, each with a name, a state and one action on the right, whose detail unfolds under the line (`GroupItem` + `GroupRow` + `Expand`).

## When not to use

- For dense desk-style settings (name and one line of help on the left, a control on the right, `t2` type), use [SettingsRows](../settings-rows/README.md).
- For a mono ledger of keys, sizes and states, use [Table](../table/README.md). For rows that open something under column heads, use [List](../list/README.md).
- For the page title, section labels and stats around the groups, use [Page](../page/README.md).

## Usage

The family:

- `Group` — the header, the sunken region, and the footer.
- `GroupCell` — a line with `label`, an optional `detail` line, `value` or `control` on the right, and `icon` in front. With `onPress`, the whole line is a [Ghost](../ghost/README.md) button with a chevron. There is no chevron when it has a `tone` (`accent` adds, `danger` removes) or `checked` (one choice of several).
- `InputCell` — a 96px name column and a borderless [Input](../input/README.md). `TextCell` — a borderless [Textarea](../textarea/README.md) that grows. `SliderCell` — a label and reading on one line, a [Slider](../slider/README.md) under them.
- `IconTile` (a 28px tile with a 16px glyph), `LetterTile` (the same tile with a first letter), `ActionIcon` (a bare 18px glyph for action lines). Glyphs are lucide-style components that you pass in.
- `GroupItem` (`go` adds a hover) holding a `GroupRow` (`mark`, `name`, state after a `·`, `actions`, `onPress`, `chevron`). Then `Expand` (`open`, `plain`) unfolds under it with `Note` (`faint`, `err`) and `Acts`. `Mark` is a 22px tinted letter square. `Status` is a dot and words (`dot`: `filled`, `hollow` or `dashed`; `tone`; `warn`). `Tag` is a mono label. `Sep` is the `·` separator. `Empty` is the "nothing here yet" line.
- `Item` and `Row` are deprecated aliases of `GroupItem` and `GroupRow`.

```tsx
import { Group, GroupCell, IconTile, SliderCell, Switch } from "@anyknown/ui"
import { KeyRound } from "lucide-react"

<Group header="Handoff" footer="When context reaches this line, write memory first, then hand over.">
  <GroupCell icon={<IconTile icon={KeyRound} />} label="Provider keys" value="2" onPress={openKeys} />
  <GroupCell
    label="Notifications"
    control={<Switch checked={notify} onCheckedChange={setNotify} aria-label="Notifications" />}
  />
  <SliderCell
    label="Handoff at"
    min={0.5}
    max={0.9}
    step={0.05}
    value={handoff}
    text={(v) => `${Math.round(v * 100)}%`}
    onChange={setHandoff}
    onValueCommit={saveHandoff}
  />
</Group>
```

A list of things whose detail unfolds in place:

```tsx
import { Expand, Group, GroupItem, GroupRow, Note, Status } from "@anyknown/ui"

<Group header="Connections">
  <GroupItem go>
    <GroupRow name="Figma" onPress={() => setOpen(!open)} chevron>
      <Status dot="hollow" tone="warning">Needs sign-in</Status>
    </GroupRow>
    <Expand open={open}>
      <Note>The token expired on 9/12. Sign in again to reconnect.</Note>
    </Expand>
  </GroupItem>
</Group>
```

## Accessibility

- `Group` is plain `<div>`s. The header and footer are not tied to the region by a role or `aria-labelledby`.
- `GroupCell` with `onPress` is a native `<button>`. Its name is all of its text (label, detail, value). With `checked`, it sets `aria-pressed`, so a choice reads as a toggle button, not a radio. The chevron and check glyphs are `aria-hidden`. Without `onPress`, it is a `<div>`, and a `control` needs its own name (for example, the `Switch`'s `aria-label`).
- `InputCell` wraps the field in a `<label>`, and `label` (required) is also its `aria-label`. `TextCell` has no label prop, so pass `aria-label`. On both, focus draws a 2px `focusRing` outline inside the row and lifts it to `layer4`. On a phone the text is 16px, so iOS does not zoom.
- `SliderCell` names the slider with `label`, and `text(value)` becomes its `aria-valuetext`.
- `LetterTile`, `Mark` and `Sep` are `aria-hidden`. `IconTile` and `ActionIcon` glyphs are `aria-hidden`.
- `GroupRow` with `onPress` is a native button with a 2px `focusRing` outline. It does not set `aria-expanded`, even when it opens an `Expand`.
- A closed `Expand` is `inert` and does not render its children. With `prefers-reduced-motion: reduce`, it opens and closes at once.
- `Note err` is `role="alert"`. The `Status` dot is `aria-hidden`, so the words carry the state. A string `Status` or `GroupRow` name gets a `title` with the full text.
- No built-in words.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates a `GroupCell` or `GroupRow` that has `onPress` (native `<button>`). |
| Arrow keys | On a `SliderCell`: move the value by 5% of the range and commit once per key press. |
| <kbd>Home</kbd> / <kbd>End</kbd> | On a `SliderCell`: go to `min` / `max`. |

`InputCell` and `TextCell` are native text fields. Controls passed in as `control` or `actions` handle their own keys.

## Related

- [SettingsRows](../settings-rows/README.md) — the denser label-and-control settings rows.
- [Page](../page/README.md) — the page head and section labels around groups.
- [Switch](../switch/README.md) — the usual `control` on a cell.
- [Ghost](../ghost/README.md) — the button a pressable cell is made of.
