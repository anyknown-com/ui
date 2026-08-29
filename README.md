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
pnpm check        # turbo run typecheck lint fmt:check(平行 + 快取)
pnpm build        # dist:ESM + d.ts + tokens.css + scrollbar.css
pnpm verify:pack  # build 後打包,從套件外部解析 exports map 每個入口
pnpm playground   # http://localhost:5199,用打包後的 dist 渲染全部元件
pnpm site         # http://localhost:5200,文檔網站(示範 + NOTES 文檔)
pnpm site:test    # 文檔網站的 jsdom 冒煙測試
pnpm site:deploy  # build 後 wrangler deploy 到 Cloudflare Workers(需先 wrangler login)
```

playground 的 section id 與 `prototypes.html` 一致,可以並排對照實作與原型。

`check` / `test` / `build` 等都由 [turborepo](https://turborepo.dev) 驅動(single-package 模式,設定在 `turbo.json`),快取推到自架的 remote cache `https://turbo.anyknown.com`(team `anyknown-ui`)。要吃到遠端快取就 export token:

```bash
export TURBO_TOKEN=<token>   # 見 turbo-cache-worker/GITHUB-SECRETS.md
```

沒設也不會壞,只是退回本機快取。`turbo.json` 裡 `build` / `lint` / `typecheck` / `test` 的 inputs 刻意排除了 `*.md` 與 `*.html`,所以改 NOTES 或 prototype 不會讓這些 task 重跑;`site:build` / `site:test` 用預設 inputs,因為文檔網站確實會讀 NOTES。

## 發佈

發佈的是 ESM + d.ts,**StyleX 呼叫保留在產物中**,由使用端的 bundler compile(StyleX library 標準做法)。

版本由 **git tag 決定**。推一個 `v*` tag 上去,`.github/workflows/release.yml` 跑完整條 gate 再 publish;tag 與 `package.json` 的 `version` 對不上會直接失敗,不會發出去。

```bash
# 1. 改 package.json 的 version(semver;元件 API 有 breaking change 時同步更新該元件的 NOTES.md)
# 2. commit + 打 tag + 推
git commit -am "release: v0.2.0"
git tag v0.2.0
git push origin main --tags
```

CI 跑的是 `typecheck / lint / fmt:check / test / site:test` → `verify:pack` → `npm publish`。前五項走 turbo remote cache,PR 上跑過的多半直接命中;`verify:pack` 不快取,它就是要每次重打一次 tarball、從套件外部解析 exports map。

publish 走 **npm trusted publishing (OIDC)**,repo 裡不存任何 npm 憑證 —— trusted publisher 綁在 npmjs.com 的 `@anyknown/ui` → `anyknown-com/ui` / `release.yml`。CI 用的是 `npm publish` 而不是 `pnpm publish`,因為 pnpm 的 OIDC 支援還沒好([pnpm#9812](https://github.com/pnpm/pnpm/issues/9812))。

v0.1.0 是本機手動發的:npm 的 trusted publisher 只能綁在**已存在的套件**上,第一版繞不掉。之後都走 tag。

CI 驗不了的只剩視覺:發之前 `pnpm playground` 開一輪,對照 `prototypes.html` 看視覺與動效沒跑掉,順手開 macOS 的「減少動態效果」再看一次。

### 一次性設定

repo 在 <https://github.com/anyknown-com/ui>(public),npm trusted publisher 已綁,`@anyknown/ui@0.1.0` 已發佈。剩一件沒做:

**開通 remote cache**。這個 repo 用的 team 是 `anyknown-ui`,但 cache worker(`anyknown-com/turbo-cache`)的 `wrangler.toml` 目前只註冊了 `anyknown`,所以不管帶什麼 token 都是 401。兩邊都要動:

1. worker 端加 team 與對應的 secret binding:

   ```toml
   # wrangler.toml
   [vars]
   TURBO_TEAM_TOKEN_BINDINGS = '{"anyknown":["TURBO_TOKEN_ANYKNOWN"],"anyknown-ui":["TURBO_TOKEN_ANYKNOWN_UI"]}'
   ```

   ```bash
   npx wrangler secret put TURBO_TOKEN_ANYKNOWN_UI   # 至少 32 字元
   npx wrangler deploy
   ```

2. 同一個值設成這個 repo 的 `TURBO_TOKEN` secret(repo → Settings → Secrets and variables → Actions → New repository secret);本機則 `export TURBO_TOKEN=<token>`。

沒設也不會壞,只是每次都跑冷的。`apiUrl` 與 `teamSlug` 已經寫死在 `turbo.json`,不用另外設 variable。

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
