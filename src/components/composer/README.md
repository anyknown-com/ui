# Composer

The prompt bar pinned to the bottom of a conversation: a growing textarea with `@` source suggestions, `/` commands, an optional model picker and mic toggle, and a round ink send button.

## When to use

- The main place a person types to the agent. It is always usable, even while a card waits for an answer.
- When the person should be able to attach sources with `@` (looked up through `sources`) or run `/` commands.

## When not to use

- For a plain multi-line form field, use [Textarea](../textarea/README.md) (`autoGrow` gives the same growth).
- During a voice call, show [CallBar](../call-bar/README.md) in its place.

## Usage

```tsx
import { Composer } from "@anyknown/ui"

<Composer
  placeholder="Talk to the agent"
  models={["Fable 5", "Opus 5"]}
  model={model}
  onModelChange={setModel}
  sources={(query) => searchSources(query)}
  commands={[{ id: "handoff", label: "handoff" }]}
  onSubmit={(text, refs) => send(text, refs)}
  hint="⏎ to send · ⇧⏎ for a new line"
/>
```

The text is held inside the component and cleared after each send. `onSubmit` gets the text and the `@` sources still present in it. `sources` is async; stale answers are dropped. `/` commands only open when `/` is the first character. The mic button appears only when `onMicToggle` is given; `micActive` shows it pressed.

## Accessibility

- The textarea is named by `label` (default "訊息"). With `sources` or `commands` it becomes a `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant` pointing into a `role="listbox"` of `role="option"`s (named by `sourcesLabel` / `commandsLabel`). Focus stays in the textarea; the active option has a focus ring, and `Highlight` in forced colors.
- Bar buttons are native `<button>`s: "加入來源(@)" and "指令(/)" with `aria-expanded`, the mic with `aria-pressed`, and "送出", disabled while the text is empty. The model picker is a native `<select>` named "模型".
- The whole sheet shows a 2px focus ring while anything inside has focus.
- Font size is at least 16px on phones, so iOS does not zoom on focus.
- Enter during IME composition commits the candidate, not the message.
- `hint` is a plain paragraph; it is not linked to the textarea with `aria-describedby`.
- `prefers-reduced-motion: reduce` removes the hover transitions.
- Built-in words are fixed Chinese defaults and do not follow `<LocaleProvider>`. `placeholder`, `label`, `sourcesLabel` and `commandsLabel` are props; the bar button names, "模型" and the default command kind "指令" cannot be changed.
- Known gap: the placeholder uses `textFaint` (3.75:1 in light), below 4.5:1 (see `A11Y-DEBT.md`).

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Enter</kbd> | Sends the message; with the suggestion list open, inserts the active option. |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Inserts a new line. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Moves the active option when the suggestion list is open (wraps around). |
| <kbd>Esc</kbd> | Closes the suggestion list; typing reopens it. |
| <kbd>Tab</kbd> | Moves to the `@`, `/`, model, mic and send controls. |

## Related

- [Textarea](../textarea/README.md) — shares the auto-grow behavior.
- [AttachButton](../attach-button/README.md) and [PendingFiles](../pending-files/README.md) — attaching files in a chatbox.
- [CallBar](../call-bar/README.md) — what replaces the composer during a call.
- [VoiceIndicator](../voice-indicator/README.md) — what the agent is doing during voice input.
