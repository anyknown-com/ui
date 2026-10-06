// dist/brand.css 從 src/brand.css 生成:單檔、給沒有 bundler 的一次性頁面 <link> 進來就能用。
//
// 接進去的三樣東西都不手抄:
// - Google Fonts 的 @import(外部頁面沒有 @fontsource)
// - tokens.css 原文內聯(不用管相對路徑)
// - .ak-theme-light / .ak-theme-dark:從 tokens.css 的 light / dark 兩個 block 抄成手動主題
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { declarations } from "./tokens-css.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const FONTS =
	'@import url("https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&family=Geist+Mono:wght@100..900&family=Noto+Sans+TC:wght@100..900&display=swap");'

/** 宣告表寫回 CSS 行。值可能被 oxfmt 折成多行(字型),所以從解析過的 Map 重寫,不逐行抄。 */
const lines = (decls) => [...decls].map(([name, value]) => `\t${name}: ${value};`).join("\n")

export function generate() {
	const src = readFileSync(join(root, "src/brand.css"), "utf8")
	const tokens = readFileSync(join(root, "src/tokens.css"), "utf8")
	const darkDecls = declarations(tokens, '[data-theme="dark"]')
	// 淺色主題只需要有暗色變體的那些;space、type 這類不分主題的值 :root 已經給了
	const light = lines([...declarations(tokens, ":root")].filter(([name]) => darkDecls.has(name)))
	const dark = lines(darkDecls)

	const themes = `/* 手動主題:由 scripts/brand-css.mjs 生成 */
/* 手動鎖定淺色;放在 html 上就整頁鎖,放在子樹上只鎖那塊。 */
:root.ak-theme-light,
.ak-theme-light {
${light}
}
/* 手動鎖定暗色。 */
:root.ak-theme-dark,
.ak-theme-dark {
${dark}
}`

	return src
		.replace("/* @import-fonts */", FONTS)
		.replace("/* @tokens */", tokens.trim())
		.replace("/* @themes */", themes)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const out = join(root, "dist/brand.css")
	const css = generate()
	writeFileSync(out, css)
	console.log(`  brand.css       ${(Buffer.byteLength(css) / 1024).toFixed(1)} kB`)
}
