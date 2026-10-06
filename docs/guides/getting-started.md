# Getting started

This guide takes a Vite + React app from an empty `package.json` to a first screen with a button and a toast. The package ships ES modules with the StyleX calls left in, so your bundler compiles them together with your own styles.

## Install

```bash
pnpm add @anyknown/ui @stylexjs/stylex
pnpm add -D @stylexjs/babel-plugin @stylexjs/postcss-plugin postcss @babel/core
```

`@babel/core` is needed only for the small Vite plugin below, which calls Babel directly.

### Peer dependencies

| Package | Range | Required |
| --- | --- | --- |
| `react` | `^19.0.0` | Yes. Components use React 19 APIs (`ref` as a prop, `use`, context as a provider). |
| `@chenglou/pretext` | `^0.0.9` | No. Lets [Textarea](../../src/components/textarea/README.md) `autoGrow` measure text without a DOM reflow in browsers that lack `field-sizing: content`. See [Text layout](./text-layout.md). |

The package never imports `@chenglou/pretext` itself. If you install it, register it once at the app entry (see [Text layout](./text-layout.md)); if you don't, everything still works.

### Fonts

The font stacks in the tokens name Figtree (headings and body), Geist Mono (code and data) and Noto Sans TC (Chinese). The package does not load fonts. Install them as packages:

```bash
pnpm add @fontsource-variable/figtree @fontsource-variable/geist-mono @fontsource-variable/noto-sans-tc
```

```ts
// main.tsx
import "@fontsource-variable/figtree"
import "@fontsource-variable/geist-mono"
import "@fontsource-variable/noto-sans-tc"
```

Or link Google Fonts in your HTML (the stacks list both the `Variable` names and the plain names, so either works):

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&family=Geist+Mono:wght@100..900&family=Noto+Sans+TC:wght@100..900&display=swap"
/>
```

Without them, text falls back to PingFang TC or Microsoft JhengHei for Chinese and to `system-ui` for Latin.

## Set up StyleX in Vite

StyleX needs two passes:

1. **Babel** rewrites `stylex.create` / `stylex.defineVars` calls into class names. It must run on your code **and** on `node_modules/@anyknown/ui`.
2. **PostCSS** collects every style into one stylesheet at the `@stylex;` directive.

The two passes must hash the same way, so `unstable_moduleResolution.rootDir` must be the same in both.

### Vite config

```ts
// vite.config.ts
import { transformAsync } from "@babel/core"
import react from "@vitejs/plugin-react"
import { type Plugin, defineConfig } from "vite"

const rootDir = process.cwd()

// Runs the StyleX Babel plugin on your code and on @anyknown/ui, which ships uncompiled StyleX.
function stylex(): Plugin {
  return {
    name: "stylex-babel",
    enforce: "pre",
    async transform(code, id) {
      const file = id.split("?")[0]
      if (!/\.[jt]sx?$/.test(file)) return null
      if (file.includes("/node_modules/") && !file.includes("/node_modules/@anyknown/ui/")) return null
      if (!code.includes("@stylexjs/stylex")) return null
      const out = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [
          [
            "@stylexjs/babel-plugin",
            { runtimeInjection: false, unstable_moduleResolution: { type: "commonJS", rootDir } },
          ],
        ],
      })
      return out?.code ? { code: out.code, map: out.map as never } : null
    },
  }
}

export default defineConfig({
  plugins: [stylex(), react()],
  // Pre-bundling would hide the package from the Babel pass in dev.
  optimizeDeps: { exclude: ["@anyknown/ui"] },
})
```

Keep `@anyknown/ui` out of `optimizeDeps`: a pre-bundled copy lives under `node_modules/.vite` and is never compiled, so `stylex.create` would run (and throw) at runtime. This repo's own setup is [`stylex.vite.ts`](../../stylex.vite.ts), [`site/vite.config.ts`](../../site/vite.config.ts) and [`site/postcss.config.mjs`](../../site/postcss.config.mjs); they alias the package to `dist/`, so they do not need the `node_modules` exception.

### PostCSS config

```js
// postcss.config.mjs
import stylexBabelPlugin from "@stylexjs/babel-plugin"
import stylexPostcss from "@stylexjs/postcss-plugin"

export default {
  plugins: [
    stylexPostcss({
      include: ["src/**/*.{ts,tsx}", "node_modules/@anyknown/ui/dist/**/*.js"],
      useCSSLayers: false,
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [
          [
            stylexBabelPlugin,
            { runtimeInjection: false, unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() } },
          ],
        ],
      },
    }),
  ],
}
```

`node_modules/@anyknown/ui/dist/**/*.js` must be in `include`. Without it the components render with no styles.

### Entry CSS

```css
/* src/index.css */
@import "@anyknown/ui/tokens.css";
@import "@anyknown/ui/scrollbar.css";

@stylex;
```

- `@stylex;` is the bare directive (no arguments) where the PostCSS plugin writes the stylesheet.
- `tokens.css` defines every token as a `--ak-*` CSS variable, for your plain CSS and for Tailwind. StyleX does not need it.
- `scrollbar.css` styles scrollbars globally. It lives in a CSS file because StyleX cannot write `::-webkit-scrollbar` rules.

Give the page a background and font yourself, for example:

```css
body {
  margin: 0;
  background: var(--ak-layer1);
  color: var(--ak-text);
  font-family: var(--ak-font-body);
}
```

## Use the tokens in your own styles

Import token groups from `@anyknown/ui/tokens.stylex` and use them in `stylex.create`. Don't write raw colors, sizes or durations: the tokens switch with the theme and the raw values don't.

```tsx
import { color, corner, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"

const styles = stylex.create({
  panel: {
    padding: space.lg,
    borderRadius: corner.card,
    backgroundColor: color.surface,
    color: color.text,
    fontSize: type.t3,
  },
})

export function Panel({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.panel)}>{children}</div>
}
```

Every group, value and dark variant is listed on the [tokens page](#/tokens).

## Use the tokens without StyleX

`@anyknown/ui/tokens.css` has the same values as plain CSS variables. Color tokens are `--ak-<name>` (`--ak-bg`, `--ak-text-muted`, `--ak-signal`); other groups carry the group name (`--ak-space-md`, `--ak-corner-pill`, `--ak-shadow-float`, `--ak-type-t3`, `--ak-font-body`). The file is generated from `tokens.stylex.ts`, so the two never disagree.

With Tailwind v4, map them in `@theme inline`. `inline` makes each utility read the variable where it is used, so light, dark and `data-theme` keep working:

```css
@import "tailwindcss";
@import "@anyknown/ui/tokens.css";

@theme inline {
  --color-bg: var(--ak-bg);
  --color-surface: var(--ak-surface);
  --color-border: var(--ak-border);
  --color-text: var(--ak-text);
  --color-muted: var(--ak-text-muted);
  --color-accent: var(--ak-accent);
  --color-accent-text: var(--ak-accent-text);
  --color-signal: var(--ak-signal);
  --color-danger: var(--ak-danger);
  --font-sans: var(--ak-font-body);
  --font-mono: var(--ak-font-mono);
  --radius-control: var(--ak-corner-control);
  --radius-card: var(--ak-corner-card);
  --shadow-float: var(--ak-shadow-float);
}
```

## Mount the hosts and pick a language

Toasts and imperative dialogs render through hosts. Mount `<Toaster />` and `<Dialogs />` once, near the root. Then `toast(...)` and `dialog.confirm(...)` work from anywhere, including outside React.

The built-in words (aria-labels, screen-reader prefixes) default to Traditional Chinese (`DEFAULT_LOCALE` is `"zh-TW"`). For an English app, wrap everything in `<LocaleProvider locale="en">`. See [Internationalization](./i18n.md). A right-to-left app also sets `dir="rtl"` on `<html>` and wraps the root in `<DirectionProvider direction="rtl">`; see [Right-to-left](./i18n.md#right-to-left).

## A first screen

```tsx
// src/main.tsx
import { Button, Dialogs, LocaleProvider, Toaster, toast } from "@anyknown/ui"
import { color, space } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

const styles = stylex.create({
  page: { padding: space.lg, backgroundColor: color.bg, color: color.text },
})

function App() {
  return (
    <main {...stylex.props(styles.page)}>
      <Button onClick={() => toast.success("Saved")}>Save</Button>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider locale="en">
      <App />
      <Toaster />
      <Dialogs />
    </LocaleProvider>
  </StrictMode>,
)
```

Run `pnpm vite`. The button is an ink pill; clicking it shows a toast in the bottom-right corner.

## Next steps

- [Theming](./theming.md): dark mode, a manual theme switch, the `sx` prop, changing the palette.
- [Internationalization](./i18n.md): locales, `labels` overrides, adding a language, right-to-left.
- [State management](./state.md): `createStore` and `useStore`, which the toast and dialog managers use.
- [Accessibility](./accessibility.md): what the components do for you and what stays your job.
- [Text layout](./text-layout.md): the optional Pretext engine behind Textarea auto-grow.
- [Component conventions](../../src/components/README.md) and each component's page, for example [Dialog](../../src/components/dialog/README.md) and [Toast](../../src/components/toast/README.md).
- The [tokens page](#/tokens) for every token and its light and dark value.
