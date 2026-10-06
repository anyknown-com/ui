# Components

Every folder here is one component (or a small family), and all of them are implemented. A
folder holds:

- `<Name>.tsx` — the StyleX implementation
- `<Name>.test.tsx` — vitest + testing-library (most folders; a few small ones, such as
  `button`, `ghost`, `icon-button`, `spin`, `page`, `table`, have none yet)
- `README.md` — per-component docs: usage, props, examples

The source of truth for the look is **the implementation itself**: run `pnpm playground` or open
<https://ui.anyknown.com>. Decisions and their reasons live in [COMPONENTS.md](./COMPONENTS.md).

`scrollbar` has no folder: it is `src/scrollbar.css`.

```bash
pnpm playground   # http://localhost:5199, renders every component from the built dist
```

The playground and the docs site use the same section ids.

## List

- **Forms** — `input` `textarea` `label` (with `Field`) `checkbox` `radio` `switch` `slider`
  `select` `dropdown` `password-input` `segmented`
- **Basics** — `button` `icon-button` `ghost` `card` `text` `icon` `dialog` `toast` `tooltip`
  `popover` `tabs` `badge` `kbd` `skeleton` `progress` `spin` `empty-state` (`scrollbar` is CSS)
- **Agent & chat (desktop AI-native)** — `message` `markdown` (with `Formula`) `tool-card`
  `reasoning-fold` `action-bar` `code-block` `interaction-card` `handoff-receipt` `composer`
  `voice-indicator` `live-dot`
- **Storage & data** — `recovery-key` `dropzone` `file-row` `diff-viewer` `data-table`
- **Web shell** — `group` (grouped lists and cells) `page` `settings-rows` `table` `list`
  `status-badge` `status-chip` `bubble` `attachment` `payload-block` `attach-button`
  `pending-files` `call-bar`

## Other docs

- [COMPONENTS.md](./COMPONENTS.md) — why each component ended up the way it did, the dead ends,
  and the traps. Read a component's section before changing it, so you don't walk a path that
  was already rejected. **Required reading before porting a new component**: copy the numbers,
  don't retune them
- [A11Y-DEBT.md](./A11Y-DEBT.md) — known contrast and hit-target gaps, waiting on a design
  decision
- `<folder>/README.md` — how to use each component

## Common decisions

1. **The headless layer is Base UI** (`@base-ui/react`); StyleX is the skin. Reason: only Base
   UI has complete primitives for combobox (filter, multiple, grouping) and menu (nested
   submenus, safe polygon). Simple controls (input, textarea, checkbox, radio, switch, label)
   use native elements; no primitive needed. Today Base UI backs dialog, popover, tooltip,
   select, dropdown and tabs. Slider is deliberately hand-written (see COMPONENTS.md)
2. Every color, space, corner, type size and motion value comes from `tokens.stylex.ts`; no
   hard-coded values. Deprecated token groups (`text.*`, `radius.*`, the pre-tactile `corner`
   names, `shadow.raised`/`popover`/…) stay only for published API; new code uses the
   replacements their JSDoc names
3. **Type comes from the `type` scale**: `type.t1`–`t4` (11 / 13 / 15 / 17px) for UI,
   `t5`–`t7` (22 / 28 / 36px) for headings, `type.code` for mono blocks, and the line heights
   `body` / `snug` / `tight` / `dense`. Phone-size inputs use `type.phoneInput` (16px) under
   `breakpoint.phone`. The old `text.*` scale is deprecated
4. **Motion never bounces**: things that slide use `motion.slide` (240ms) with `motion.easeOut`
   (`cubic-bezier(.16,1,.3,1)`); progress uses `motion.fast` (120ms) linear. No edge may move
   backward or overshoot. `motion.spring` is deprecated and unused
5. **No `useEffect`**: use a ref callback with cleanup (React 19). Measure sizes with a ref
   callback plus `ResizeObserver`. Three components still have one (`Formula`'s lazy Temml
   import, `ReasoningFold`'s auto-collapse timer, `DataTable`'s indeterminate header checkbox);
   don't add more
6. Always honor `prefers-reduced-motion`
7. One focus ring: `:focus-visible` gives a 2px (`focusRing.width`) outline in
   `color.focusRing` (= `signal`), `outlineOffset` 2; controls that sit inside a frame use −1
   or −2
8. Form errors: the control sets `aria-invalid` and `aria-describedby`; the Field renders the
   message (`role="alert"`)
9. **StyleX 0.19 silently drops shorthands** (`all: unset`, `border: 0`, `background: none`):
   no CSS comes out, and the native control's UA look stays on screen. Use `reset.control` from
   `lib/styled.ts` as the first argument to `stylex.props`
10. **Sized components set `boxSizing: border-box` themselves**; don't rely on the app having a
    reset
11. **Layout belongs to the caller: `sx`**. A component owns how it looks, not where it sits or
    how big it is on the page. A component that needs outside adjustment takes `sx?: StyleArg`
    and applies it after its own styles (`styled(props, ...own, sx)`). Don't rely on the caller
    passing `className`: StyleX classes are atomic, and a class string appended later is not
    guaranteed to win; to override, a style must come later in the same `stylex.props` call
12. **Apply a theme whole**. `light` / `dark` in `themes.stylex.ts` are each a set (color +
    shadow + tone), spread with `stylex.props(...light)`. Applying one var group leaves the
    other two on the other theme. That file is generated from tokens by `pnpm gen:themes`;
    don't edit it by hand
13. **Surfaces separate by layer, not border**. `color.layer1`–`layer5` are the five background
    steps rail → main → message → fold → row; higher numbers are darker. **Hover goes up one
    step**: `layerUp.layer3` is the hover background for `layer3` (`lib/layers.ts`). `layer5` is
    the darkest step; the step above it has no name, so `layerUp` gives `borderStrong`
14. **Stacking comes from the `zIndex` consts** in `tokens.stylex.ts` (dialog backdrop 70,
    dialog 71, popup 75, tooltip 78, toast 80). They are `defineConsts`, so `zIndex:
    zIndex.popup` works in any `stylex.create`. `lib/popup.ts` re-exports them as `layer` and
    ships ready-made `layerStyles`. Stacking inside one component (`zIndex: 1`) stays local
15. **Built-in words go through `lib/i18n.tsx`**. A component declares its words with
    `defineStrings({ "zh-TW": …, en: … })` and reads them with `useStrings(strings, labels)`;
    the app sets the language once with `<LocaleProvider locale>` (default `zh-TW`, unknown
    locales fall back to `en`), and each instance can override single words through its
    `labels` prop. `toast` is migrated; most other components still take Chinese defaults as
    individual props (`call-bar` merges a plain `labels` object), and should move to this
    pattern when touched
16. **External state goes through `lib/store.ts`**: `createStore(initial)` plus
    `useStore(store, selector?, isEqual?)` on `useSyncExternalStore`. A `selector` subscribes
    to one slice; pass a shallow `isEqual` when it builds a new object or array. The toast and
    dialog managers use it

## Field scope

`Field` owns its control's `id` (an `id` the control passes itself is ignored inside a Field),
so one `Field` holds one control. `Checkbox` / `Radio` / `Switch` bring their own label; inside
a `Field` give them only `help` / `error` / `disabled`, not `label`.

## Engine bridge

`@anyknown/ui` ships tokens in two forms:

1. `tokens.stylex.ts` — for StyleX consumers (desktop / accounts / storage / i18n)
2. `tokens.css` — plain CSS variables (`--ak-*`, same values) for non-StyleX consumers. Desktop
   is pure StyleX itself; only streamdown, the third-party markdown component, ships Tailwind
   utility classes, and its `@theme inline` points at these `--ak-*`

`tokens.stylex.ts` is the single source of truth. `tokens.css` is generated from it
(`pnpm gen:tokens-css`), and `src/tokens-css.test.ts` fails when the two drift. There is also
`scrollbar.css` (custom scrollbars, applied globally).
