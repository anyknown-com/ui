# Theming

The package has one palette: a neutral gray desk (OKLCH chroma 0) with white paper sheets, ink text, an ink primary action and a blue `signal` for agent activity, focus and progress. It comes in a light and a dark mode. This guide covers how the mode is chosen, how to lock it, how to adjust a component's layout, and how to change the palette.

## Light by default, dark from the OS

Light is the primary mode. Every themed token in `tokens.stylex.ts` has a dark value under `@media (prefers-color-scheme: dark)`, so with no setup at all the app follows the operating system.

The same holds for `tokens.css`: `:root` holds the light values, and the dark values apply under `prefers-color-scheme: dark`.

## Lock a theme with StyleX

`@anyknown/ui/themes.stylex` exports `light` and `dark`. Each is a set of three themes: color, shadow and tone.

```tsx
import { dark } from "@anyknown/ui/themes.stylex"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"

export function DarkSection({ children }: { children: ReactNode }) {
  return <section {...stylex.props(...dark)}>{children}</section>
}
```

- **Apply the whole set.** Spread it: `stylex.props(...dark)`. Applying only the color theme leaves shadows and tones on the other mode.
- **Put an app-wide theme on `<html>`.** Dialogs, popovers, tooltips and toasts portal to `<body>`, so a theme on an inner element does not reach them. A theme on a section is fine for a preview or a mixed page, as long as nothing in it opens a popup.
- `themes.stylex.ts` is generated from the tokens by `pnpm gen:themes`. Don't edit it by hand; `src/themes.test.ts` fails when it is out of sync.

## Lock a theme with `data-theme`

`tokens.css` follows the OS unless `data-theme` says otherwise. The generated selectors are:

```css
:root { /* light values */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark values */ }
}

[data-theme="dark"] { /* dark values */ }
```

So:

- `data-theme="light"` on `<html>` keeps light on a dark OS. It only works on the root element.
- `data-theme="dark"` turns any element and its subtree dark.
- No attribute follows the OS.

The StyleX themes and `data-theme` are independent. If your app uses both StyleX components and `--ak-*` variables (most do: the entry CSS styles `body` with them), set both on `<html>`.

## A system / light / dark switch

Apply the theme where the choice is made, in the setter. No `useEffect` is needed: the DOM change happens in the event, and a store tells React which button is pressed.

```tsx
import { Button, createStore, useStore } from "@anyknown/ui"
import { dark, light } from "@anyknown/ui/themes.stylex"
import * as stylex from "@stylexjs/stylex"

type ThemeMode = "system" | "light" | "dark"
const THEMES = { light, dark }
const themeStore = createStore<ThemeMode>("system")
let themeClasses: string[] = []

export function setTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.remove(...themeClasses)
  themeClasses = mode === "system" ? [] : (stylex.props(...THEMES[mode]).className?.split(" ") ?? [])
  root.classList.add(...themeClasses)
  if (mode === "system") delete root.dataset.theme
  else root.dataset.theme = mode
  themeStore.set(mode)
}

export function ThemeToggle() {
  const mode = useStore(themeStore)
  return (
    <div role="group" aria-label="Theme">
      {(["system", "light", "dark"] as const).map((option) => (
        <Button
          key={option}
          size="sm"
          variant={option === mode ? "secondary" : "ghost"}
          aria-pressed={option === mode}
          onClick={() => setTheme(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}
```

To remember the choice, save it to `localStorage` in `setTheme` and call `setTheme(saved)` once at module load, before the first render. The docs site does exactly this in `site/prefs.ts`. See [State management](./state.md) for `createStore` and `useStore`.

## `color-scheme`

The tokens do not set `color-scheme`. Set it yourself so native controls, form autofill and the default scrollbar match the mode:

```css
:root {
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
}
```

This mirrors the `tokens.css` selectors, so it works with the `data-theme` switch above.

## Adjust layout with `sx`

A component owns how it looks; the caller owns where it sits and how big it is. Components that can be placed take an `sx` prop with StyleX styles, applied after the component's own styles:

```tsx
import { Button, Textarea } from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"

const layout = stylex.create({
  full: { width: "100%" },
  pushRight: { marginInlineStart: "auto" },
})

export function Footer() {
  return (
    <>
      <Textarea sx={layout.full} />
      <Button sx={layout.pushRight}>Send</Button>
    </>
  )
}
```

Use `sx`, not `className`, to override. StyleX classes are atomic, and a class appended later is not guaranteed to win; a style only reliably wins when it comes later in the same `stylex.props` call, which is what `sx` does. `className` and `style` are still merged in, not replaced.

Keep `sx` to layout (width, margin, flex and grid placement, alignment). If you want a different color, size or radius, use a prop or variant, or ask for one: overriding the look one call site at a time is how a design system drifts.

## Change the palette

Colors are not picked one by one. `scripts/palette.mjs` builds five 12-step OKLCH scales (gray, blue, red, amber, green), with the same job for each step in both modes:

| Steps | Job |
| --- | --- |
| 1–2 | Backgrounds (paper, desk) |
| 3–5 | Fills (subtle backgrounds, hover, pressed) |
| 6–8 | Borders |
| 9–10 | Solids (button fills, control borders, icons) |
| 11–12 | Text (secondary, primary) |

It then maps roles to steps and checks contrast. To change a color:

1. Edit the scales or the role mapping in `scripts/palette.mjs`.
2. Run `node scripts/palette.mjs`. Check the contrast table: `failures` must be 0.
3. Paste the JSON it prints into the `color` and `tone` groups of `src/tokens.stylex.ts`.
4. Run `pnpm gen:themes` to regenerate `src/themes.stylex.ts`.
5. Run `pnpm gen:tokens-css` to regenerate `src/tokens.css`.
6. Run `pnpm test`. `src/themes.test.ts` and `src/tokens-css.test.ts` fail if either generated file disagrees with the tokens.

Don't hand-tune a single value in `tokens.stylex.ts`, `themes.stylex.ts` or `tokens.css`. A one-off hex breaks the step system, and the generated files would overwrite it anyway. The full rationale is in [docs/plans/02-tactile.md](../plans/02-tactile.md) and [DESIGN.md](../../DESIGN.md); the current values are on the [tokens page](#/tokens).
