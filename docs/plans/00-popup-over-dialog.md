# Popups stack below dialogs: Select, Dropdown and Popover don't open inside a Dialog

Status: fixed in 1889fc7 and released in v0.4.1. The layer table now lives in `src/lib/popup.ts` as `layer`.

## Symptom and repro

In product (app.anyknown.com), the "New run" dialog on the Runs page: clicking the Provider dropdown shows nothing. The options do render (they are in the accessibility tree and work from the keyboard), but the dialog covers them, so for mouse users it is broken. Light and dark behave the same.

Repro in this repo: in the playground or any app, put a `Select` (or `DropdownMenu` / `Popover`) inside `DialogContent` and open it.

## Cause

Each layer sets its own z-index, and the popup layer sits below the dialog layer:

| Layer | Value | Location |
| --- | --- | --- |
| Popup positioner (shared by select, dropdown, popover, composer) | 40 | `src/lib/popup.ts` `popupStyles.positioner` |
| Tooltip positioner | 60 | `src/components/tooltip/Tooltip.tsx` |
| Dialog backdrop | 70 | `src/components/dialog/Dialog.tsx` |
| Dialog viewport | 71 | `src/components/dialog/Dialog.tsx` |
| Toast | 80 | `src/components/toast/Toast.tsx` |

Base UI portals every popup to `body`, so popups and dialogs compete by z-index at the same level. Since 40 < 71, a popup opened inside a dialog always ends up underneath. The tooltip at 60 has the same problem: tooltips on elements inside a dialog are covered.

## Fix

1. Add one shared layer table to `src/lib/popup.ts` and export it; other components import it instead of hard-coding their own numbers:
   - dialogBackdrop 70, dialog 71, popup 75, tooltip 78, toast 80
   - Meaning: popups sit above dialogs (a floating layer is the top of whatever the user is doing right now); tooltips sit above popups (elements inside a popup can have tooltips too); toasts are always on top (a non-blocking notice must never be hidden by a modal).
   - Raising popups from 40 to 75 changes nothing outside dialogs: a popup is a transient layer portaled to `body`, and Base UI closes outside popups when a modal opens, so a page popup can never end up over a dialog opened after it.
2. `popupStyles.positioner` uses the new value; `Tooltip.tsx`, `Dialog.tsx` and `Toast.tsx` import the same table. `Composer.tsx` also uses `popupStyles`, so it gets the fix too; confirm its own `zIndex: 10` (for an inner element) is unaffected.
3. Tests: add a case to `select/Select.test.tsx` that opens a Select inside a Dialog and checks the positioner's z-index is above the dialog viewport (read the computed style in jsdom, or assert the style the class maps to; if neither works, assert both places use the same constants and popup > dialog).
4. Before making changes, read the dialog, popover and tooltip sections of `src/components/COMPONENTS.md` (repo rules). After the change, update the popover section with the layer table and the reasoning.
5. Verify: `pnpm check && pnpm test`; open the dialog + select combination in `pnpm playground` and click through it once; run `pnpm verify:pack` before release.

## Release and downstream

- Patch release (`@anyknown/ui` was on the 0.4.x line).
- After release, run `pnpm up @anyknown/ui` in the product repo and check on the Runs page's "New run" dialog that the dropdown is visible (that is where the bug was found, in the product phase-06 walkthrough notes of 2026-08-31).
