# @anyknown/ui

AnyKnown 全產品線共用的 design system,以 [StyleX](https://stylexjs.com) 實作。

## 結構

- `src/tokens.stylex.ts` — semantic tokens(color / font / text / space / radius / motion / shadow)。light 為預設,dark 跟隨 OS。**唯一真相**。
- `src/tokens.css` — 同一組值的純 CSS variables(`--ak-*`),給非 StyleX 的使用端(desktop 的 Tailwind v4 `@theme` 直接引用)。import 路徑:`@anyknown/ui/tokens.css`。
- `src/themes.stylex.ts` — `light` / `dark` theme,給有手動切換主題的 app(套在 root element)。
- `src/scrollbar.css` — 客製捲軸(全域套用)。StyleX 做不了 `::-webkit-scrollbar` 偽元素,所以獨立成 css 檔。
- `src/components/` — 34 個元件,每個一個 folder(`<Name>.tsx` + `<Name>.test.tsx` + `prototype.html` + `NOTES.md`)。清單與共同決策見 [components/README.md](./src/components/README.md)。
- `src/lib/` — 共用 hooks 與生成邏輯(reduced-motion、controllable state、clipboard、weave/yarn/loom 的 SVG path 生成、diff)。
- `playground/` — demo app,**不進發佈產物**。
- `site/` — 文檔網站(全部示範 + 每個元件的 NOTES + 指南),部署到 Cloudflare Workers,**不進發佈產物**。

## 開發

```bash
pnpm test         # vitest(jsdom + testing-library)
pnpm check        # typecheck + lint + fmt --check
pnpm build        # dist:ESM + d.ts + tokens.css + scrollbar.css
pnpm verify:pack  # build 後打包,從套件外部解析 exports map 每個入口
pnpm playground   # http://localhost:5199,用打包後的 dist 渲染全部元件
pnpm site         # http://localhost:5200,文檔網站(示範 + NOTES 文檔)
pnpm site:test    # 文檔網站的 jsdom 冒煙測試
pnpm site:deploy  # build 後 wrangler deploy 到 Cloudflare Workers(需先 wrangler login)
```

playground 的 section id 與 `prototypes.html` 一致,可以並排對照實作與原型。

## 發佈

發佈的是 ESM + d.ts,**StyleX 呼叫保留在產物中**,由使用端的 bundler compile(StyleX library 標準做法)。`prepublishOnly` 會跑 `check → test → verify:pack`。

### publish 前 checklist

1. `pnpm check` — typecheck、oxlint、oxfmt 全過。
2. `pnpm test` — vitest 全綠。
3. `pnpm verify:pack` — build + 打包,五個 exports 入口(`.`、`./tokens.stylex`、`./themes.stylex`、`./tokens.css`、`./scrollbar.css`)與 types 入口都能從套件外部解析。
4. `pnpm playground` 開一輪,對照 `prototypes.html` 看視覺與動效沒跑掉;順手開 macOS 的「減少動態效果」再看一次。
5. `npm pack --dry-run` 確認 tarball 只有 `dist/`(`files` 欄位限定),沒有夾帶 `playground/`、`src/` 或測試。
6. `package.json` 的 `version` 依 semver 調整;元件 API 有 breaking change 時同步更新該元件的 `NOTES.md`。
7. `git status` 乾淨、已 commit。
8. `pnpm publish`(需先 `npm login`)。

## 在各 app 使用(Vite)

```bash
pnpm add @anyknown/ui @stylexjs/stylex
pnpm add -D @stylexjs/babel-plugin @stylexjs/postcss-plugin postcss
```

StyleX 需要兩層:babel 把 `stylex.create` 轉成 class name,postcss 產生 stylesheet。兩邊的 `unstable_moduleResolution.rootDir` 必須一致,`dist/**/*.js` 也要進 postcss 的 `include`,否則元件的樣式不會被收進去。

```js
// postcss.config.mjs
import stylexBabelPlugin from "@stylexjs/babel-plugin"
import stylexPostcss from "@stylexjs/postcss-plugin"

export default {
	plugins: [
		stylexPostcss({
			include: ["src/**/*.tsx", "node_modules/@anyknown/ui/dist/**/*.js"],
			babelConfig: {
				babelrc: false,
				configFile: false,
				parserOpts: { plugins: ["typescript", "jsx"] },
				plugins: [
					[stylexBabelPlugin, { unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() } }],
				],
			},
		}),
	],
}
```

app 的 entry CSS 需含 StyleX 注入點(這個 postcss plugin 認的是**不帶參數**的 `@stylex;`):

```css
@stylex;
@import "@anyknown/ui/tokens.css";
@import "@anyknown/ui/scrollbar.css";
```

```tsx
import { Button, Card, Text } from "@anyknown/ui"
import { color, space } from "@anyknown/ui/tokens.stylex"
```

app 自己的樣式一律引用 tokens,不寫死色值。`playground/` 就是照這套設定跑的,可以當範本。

## 視覺方向:Ledger

暖紙面(#FAFAF6)、墨色文字、青碧色 accent(#23705A)。標題用 Newsreader,內文 Geist,時間軸/數據用 Geist Mono。使用端需安裝字體:

```bash
pnpm add @fontsource-variable/newsreader @fontsource-variable/geist @fontsource-variable/geist-mono
```

Texture(線/織的品牌語言)只用在等待、過渡、儀式時刻,精確區不加花 —— 準則見 [components/ROADMAP.md](./src/components/ROADMAP.md)。
