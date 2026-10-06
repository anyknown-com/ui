# Tactile: the design language that replaces flat

Mockups: <https://claude.ai/artifact/MYmDqnAGB7F7gjJJRjMtqK>, the two "C Tactile (chosen)" frames (light and dark). Frames A and B are directions we rejected; don't use them as reference.

## In one sentence

White paper on a neutral gray desk. Content is paper, and anything that floats is more paper stacked on top; the closer something is to the user, the rounder its corners and the deeper its shadow. Buttons are pills. Ink is for the primary action and for links; blue means only that the agent is working, focus, or progress.

Why the change: flat separated layers with 1px borders. A page ended up with too many frames, and when the mobile and desktop apps shared components they looked like forms. Tactile separates layers with tone and shadow and keeps borders only for controls that need a 3:1 edge.

## Color

Color values come from `scripts/palette.mjs`: five 12-step OKLCH scales (gray, blue, red, amber, green), one set each for light and dark. They are converted to hex and reach `tokens.stylex.ts` and `tokens.css` through semantic tokens. The raw scales live only in the script and are not exported; components touch only semantic tokens.

**Neutrals have chroma 0.** Every gray step is pure gray (R = G = B), neither cool nor warm. A tinted gray makes white paper look dirty and clashes with the status colors.

**Every step has a fixed job**, the same in every scale and both themes:

| Step | Job |
| --- | --- |
| 1–2 | Backgrounds (paper, desk) |
| 3–5 | Fills (subtle backgrounds, hover, pressed) |
| 6–8 | Borders (dividers, stronger dividers) |
| 9–10 | Solids (button fills, control edges, icons) |
| 11–12 | Text (secondary, primary) |

**Semantic mapping** (light step / dark step):

| Token | Scale | Step | Used for |
| --- | --- | --- | --- |
| `layer1` | gray | 3 / 1 | Desk |
| `bg`, `layer2` | gray | 1 / 2 | Paper |
| `surface`, `layer3` | gray | 2 / 3 | Recessed areas: inputs, user bubbles, code |
| `surfaceRaised` | gray | 1 / 4 | Cards, popovers, toasts, dialogs |
| `layer4`, `accentSubtle` | gray | 4 / 5 | Hover, secondary button fill |
| `layer5` | gray | 5 / 6 | Pressed |
| `border` | gray | 6 / 6 | Dividers |
| `borderStrong` | gray | 7 / 8 | Stronger dividers |
| `borderControl` | gray | 9 / 9 | Control edges |
| `textFaint` | gray | 9 / 10 | Icons, chevrons, placeholders, separators |
| `textMuted` | gray | 11 / 11 | Secondary text |
| `text`, `accent`, `link` | gray | 12 / 12 | Primary text, primary action, links |
| `accentText` | gray | 1 / 2 | Text on the primary action |
| `signal`, `focusRing`, `info` | blue | 9 / 11 | Agent working, focus, progress |
| `signalSubtle`, `infoSubtle` | blue | 3 / 3 | Background for agent status |
| `danger` | red | 9 / 11 | Delete, failure |
| `dangerSolid` + `onDangerSolid` | red | 9 / 9 + white | Delete buttons that can't be undone |
| `dangerSubtle` / `dangerHl` | red | 3 / 5 | Failure background / deleted diff line |
| `warning` / `warningSubtle` | amber | 11 / 3 | Warning |
| `success` / `successSubtle` / `successHl` | green | 11 / 3 / 5 | Success / added diff line |

**The primary action is ink (option B).** `accent` is gray 12 in both themes; `accentText` is gray 1 (light) / gray 2 (dark); `link` is also gray 12 and stands apart from body text by its underline. Blue never means "you can press this"; it means only that the agent is working, focus, or progress. `info` has the same value as `signal`: an informational note and "the agent is talking to you" are the same thing.

All text passes WCAG AA: `text` is 7:1 or higher, `textMuted` and the status colors 4.5:1 or higher; `textFaint`, `borderControl` and `focusRing` are non-text and 3:1 or higher. `node scripts/palette.mjs` prints the full contrast table, and its failures must be 0.

Six rules:

1. **One color, one meaning.** Blue means only agent working and focus; red only delete and failure; amber only warning; green only success. Color used as decoration is always wrong.
2. **One primary action per screen.** One solid ink button per screen. `dangerSolid` is only for deletes that can't be undone; other destructive actions use `dangerGhost`.
3. **`textFaint` never carries text.** It is only 3:1, so it is for icons, chevrons, placeholders and separators; text meant to be read always uses `textMuted`.
4. **`border` is a divider.** Control edges (input, checkbox, radio, switch off) use `borderControl`; `border` is only 1.4:1 against the background and disappears as an edge.
5. **Status labels are a tinted background with text in the same hue.** Step 3 background, step 11 text (pairs such as `successSubtle` + `success`), never a solid fill.
6. **Never hand-tune a color.** To change a color, edit the scale or mapping in `scripts/palette.mjs`, rerun it, paste the printed JSON back into `tokens.stylex.ts` and `tokens.css`, then run `pnpm gen:themes`. Changing a single hex breaks that step's relationship with the others.

## Elevation

Three levels. Shadows are black, never tinted.

| Level | Used for | Light | Dark |
| --- | --- | --- | --- |
| rest | Cards on the paper: tool cards, file rows, attachments | `surfaceRaised` fill + 1px `border` ring + `0 2px 6px` 5% | `surfaceRaised` fill (one step up), ring in `border` |
| float | Popovers, dropdowns, selects, tooltips, toasts | `0 1px 2px` 6% + `0 10px 24px` 10% | `surfaceRaised` fill + black 40% |
| modal | Dialogs, sheets | `0 2px 4px` 6% + `0 24px 56px` 16% | `surfaceRaised` fill + black 60% |

The desk is `layer1` and the main sheet is `layer2` (white). To divide a sheet, use a recessed `surface` (input area, user message bubble, secondary button) with no border.

Every rest card (`Card`, tool card, file row, attachment, interaction card, recovery key) uses the `surfaceRaised` fill; don't pick a different value. Recessed areas inside a card are still `surface`.

The dialog backdrop is black at 32% with no blur. `backdrop-filter` is a DESIGN.md anti-pattern; the old Dialog broke that rule, and this change removes it.

## Corner radius

Radius follows size; no single value fits everything. When nesting, inner radius = outer radius − padding.

| Element | Radius |
| --- | --- |
| Checkbox, kbd, inner corner of small chips | 6px |
| Input, select, textarea, segmented outer frame | 12px |
| Cards on the paper (rest) | 14px |
| Toast, popover, dropdown | 16px |
| Composer, main sheet | 20px |
| Dialog | 24px |
| Button, badge, tag, switch, progress bar, LiveDot outer ring | Fully round (pill) |

## Controls

- Buttons: pills. Heights 32 / 40 / 48, default 40 (touch). Primary is solid ink; secondary is a recessed `accentSubtle` fill with no border; ghost is transparent and gets a fill only on hover; danger is a `dangerSolid` fill with `onDangerSolid` text, only for deletes that can't be undone. On press, `scale: 0.98` over 120ms ease-out; no scale under reduced motion.
- Inputs: `surface` fill + 1px `borderControl` frame (an edge needs 3:1 against the background to be seen; `border` is only 1.2:1 and works only as a divider). On focus the frame turns `signal` and gains a 2px ring.
- Checkbox / radio / switch: unchecked is a `borderControl` frame, and so is the track of a switch that is off; checked is solid ink. The switch is a pill track with a white knob, and the knob has the rest shadow.
- Tabs / segmented: the selected item is raised white paper (rest shadow) on a recessed `surface` track, with a 1px `borderControl` ring around it. The white paper is only 1.09:1 against the track, so the ring's 3:1 is what tells selected from unselected.

## Type

- Body and headings: Figtree, falling back to Noto Sans TC for Chinese. Headings 600–700, body 400. Figtree has a large x-height and round letterforms, matching the pills and large corners; Geist's geometric feel is cooler and is kept for mono.
- Data, code and identifiers: Geist Mono, unchanged.
- Body text is 15px with 1.6 line height; the other steps of the type scale stay as they are.

## Conversation

- User messages: a recessed bubble (`surface`) aligned right, radius 18 18 6 18.
- Agent messages: no bubble, set directly on the paper.
- "Thought for a few seconds" / tool cards: expand from a pill button. A tool card is a rest card with a 36px `signalSubtle` icon background on the left and a pill progress bar while it runs.

## Motion

Unchanged: only ease-out and linear, no bounce, and only opacity and transform animate. The one addition is the 0.98 button press.

## Out of scope for this change

- Renaming tokens. All old names stay; new tokens are `signal`, `signalSubtle`, and the new elevation and radius tokens.
- The `brand.css` class vocabulary. Values follow the tokens; class names don't change.
