# Tabs

Switches between panels of content at the same level, built on Base UI Tabs, drawn as words, the open one in weight 600 on a sliding `wash` capsule.

## When to use

- Views of the same object that the user moves between ("Chat" / "Memory" / "Handoffs").
- A time-range or filter switch that swaps the content below it.

## When not to use

- For a mode toggle that does not own a panel of content, use [Segmented](../segmented/README.md).
- For moving between pages, use navigation links, not tabs.
- For a choice that is part of a form, use [RadioGroup](../radio/README.md).

## Usage

```tsx
import { Tabs, TabsList, TabsPanel, TabsTab } from "@anyknown/ui"

<Tabs defaultValue="chat">
  <TabsList aria-label="Thread view">
    <TabsTab value="chat">Chat</TabsTab>
    <TabsTab value="memory">Memory</TabsTab>
    <TabsTab value="files" disabled>Files</TabsTab>
  </TabsList>
  <TabsPanel value="chat">This thread has 12 messages.</TabsPanel>
  <TabsPanel value="memory">7 memories in this workspace.</TabsPanel>
  <TabsPanel value="files">Not available yet.</TabsPanel>
</Tabs>
```

The family is `Tabs` (root), `TabsList` (`aria-label`), `TabsTab` (`value`, `disabled`) and `TabsPanel` (`value`).

- Uncontrolled: `defaultValue` picks the first open tab; `onValueChange` still reports switches.
- Controlled: pass `value` with `onValueChange`; the selected tab follows `value` only.

## Accessibility

- Base UI Tabs: `TabsList` is `role="tablist"`, each `TabsTab` is `role="tab"` with `aria-selected`, and each `TabsPanel` is `role="tabpanel"`, labelled by its tab and focusable (`tabindex="0"`).
- `TabsList` requires `aria-label` (enforced by the type).
- Roving tabindex: the tab list is one tab stop.
- Activation is manual: arrow keys move focus, and Enter or Space selects.
- A disabled tab has `aria-disabled="true"`, stays focusable, never activates, and looks different.
- The selected tab is `text` in weight 600 on the `wash` capsule; the others are `textMuted`.
- The capsule moves without overshoot (`motion.slide`, 240ms); the movement is off under `prefers-reduced-motion: reduce`.
- In forced-colors mode the capsule is `Highlight` (selected text `HighlightText`), and a disabled tab is `GrayText`.

## Keyboard

Base UI Tabs handles these keys.

| Key | Action |
| --- | --- |
| <kbd>←</kbd> / <kbd>→</kbd> | Moves focus to the previous or next tab, including disabled ones; wraps at the ends. Under `<DirectionProvider direction="rtl">` they swap: <kbd>←</kbd> is next. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Moves focus to the first or last tab. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Selects the focused tab. |
| <kbd>Tab</kbd> | Moves from the tab list into the active panel. |

The `dir` attribute alone does not mirror the arrow keys; Base UI reads the direction from `DirectionProvider`. Home / End follow the list order in both directions.

## Related

- [Segmented](../segmented/README.md) — same look, for toggles without panels.
- [RadioGroup](../radio/README.md) — for a form choice.
