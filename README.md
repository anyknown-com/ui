# @anyknown/ui

AnyKnown 全產品線共用的 design system,以 [StyleX](https://stylexjs.com) 實作。

## 結構

- `src/tokens.stylex.ts` — semantic tokens(color / font / text / space / radius / motion)。light 為預設,dark 跟隨 OS。**唯一真相**。
- `src/tokens.css` — 同一組值的純 CSS variables(`--ak-*`),給非 StyleX 的使用端(desktop 的 Tailwind v4 `@theme` 直接引用)。import 路徑:`@anyknown/ui/tokens.css`。
- `src/themes.stylex.ts` — `light` / `dark` theme,給有手動切換主題的 app(套在 root element)。
- `src/components/` — 基礎元件(Button、Card、Text)。

## 發佈

```bash
pnpm publish   # prepublishOnly 會自動 typecheck + build
```

發佈的是 ESM + d.ts,StyleX 呼叫保留在產物中,由使用端的 bundler compile(StyleX library 標準做法)。

## 在各 app 使用(Vite)

```bash
pnpm add @anyknown/ui @stylexjs/stylex
pnpm add -D vite-plugin-stylex
```

```ts
// vite.config.ts
import styleX from "vite-plugin-stylex"
export default defineConfig({
	plugins: [react(), styleX({ libraries: ["@anyknown/ui"] })],
})
```

app 的 entry CSS 需含 StyleX 注入點:

```css
@stylex stylesheet;
```

```tsx
import { Button, Card, Text } from "@anyknown/ui"
import { color, space } from "@anyknown/ui/tokens.stylex"
```

app 自己的樣式一律引用 tokens,不寫死色值。

## 視覺方向:Ledger

暖紙面(#FAFAF6)、墨色文字、青碧色 accent(#23705A)。標題用 Newsreader,內文 Geist,時間軸/數據用 Geist Mono。使用端需安裝字體:

```bash
pnpm add @fontsource-variable/newsreader @fontsource-variable/geist @fontsource-variable/geist-mono
```
