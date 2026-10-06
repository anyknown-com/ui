# SettingsRows

Dense settings rows on one sunken `surface` region: each 44px row has the setting's name and one line of help on the left and its control on the right, with hairlines between rows.

## When to use

- A section of a desk-style settings or dashboard page, under a [Page](../page/README.md) `SectionLabel`, where each line is one setting and one control.
- Settings that read as a value, such as a masked key `•••• 9b7c` (`SettingsValue`), or that need a small marker after the name (`Dot`).

## When not to use

- For the grouped-list settings layout (header and footer text, 44px `t3` cells, choices, inline fields, a chevron into a sub-page), use [Group](../group/README.md).
- For a sunken region that holds prose or free layout, use [Page](../page/README.md)'s `Panel`.
- For a form with labeled fields and errors, use [Label](../label/README.md)'s `Field` with an [Input](../input/README.md).

## Usage

The family:

- `SettingsRows` — the sunken region (`surface`, `corner.card`, no border).
- `SettingsRow` — one row: `label` and an optional `help` line on the left, and `children` (the control) on the right.
- `Help` — a muted reading inline on the label line.
- `SettingsValue` — a mono, muted reading, such as a masked key.
- `Dot` — a 6px accent dot to put next to a label.
- `Value` is a deprecated alias of `SettingsValue`.

```tsx
import { Button, SectionLabel, SettingsRow, SettingsRows, SettingsValue, Switch } from "@anyknown/ui"

<SectionLabel first>Sync</SectionLabel>
<SettingsRows>
  <SettingsRow label="Sync on startup" help="Pull new memory before the first message.">
    <Switch checked={sync} onCheckedChange={setSync} aria-label="Sync on startup" />
  </SettingsRow>
  <SettingsRow label="Device key">
    <SettingsValue>•••• 9b7c</SettingsValue>
    <Button variant="secondary" size="sm" onClick={rotateKey}>
      Rotate
    </Button>
  </SettingsRow>
</SettingsRows>
```

## Accessibility

- Everything is a `<div>` or `<span>`. There is no list or group role.
- `label` is visible text only. It is not linked to the control, so every control needs its own accessible name (for example, `aria-label` on a `Switch`, or a button whose text says what it does).
- `Dot` is `aria-hidden`. If it means something, say it in words as well.
- No focus handling, motion or built-in words of its own. Controls you put in a row bring their own.

## Keyboard

No keyboard interaction of its own. Focusable children are the controls you put in each row, such as a [Switch](../switch/README.md) or a [Button](../button/README.md).

## Related

- [Group](../group/README.md) — the grouped-list settings layout.
- [Page](../page/README.md) — `SectionLabel` above the rows, and `Panel` for a sunken region that is not rows.
- [Switch](../switch/README.md) — the most common control in a row.
