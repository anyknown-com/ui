// dist/brand.css 從 src/brand.css 生成:單檔、給沒有 bundler 的一次性頁面 <link> 進來就能用。
//
// 接進去的三樣東西都不手抄:
// - Google Fonts 的 @import(外部頁面沒有 @fontsource)
// - tokens.css 原文內聯(不用管相對路徑)
// - .ak-theme-light / .ak-theme-dark:從 tokens.css 的 light / dark 兩個 block 抄成手動主題
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const FONTS =
	'@import url("https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap");'

/** tokens.css 裡 `selector {` 到對應 `}` 之間的宣告行。 */
function block(css, selector) {
	const start = css.indexOf(`${selector} {`)
	if (start < 0) throw new Error(`tokens.css: 找不到 ${selector}`)
	const open = css.indexOf("{", start)
	let depth = 1
	let i = open + 1
	for (; depth > 0; i++) {
		if (css[i] === "{") depth++
		else if (css[i] === "}") depth--
	}
	return css
		.slice(open + 1, i - 1)
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.startsWith("--"))
		.map((l) => `\t${l}`)
		.join("\n")
}

export function generate() {
	const src = readFileSync(join(root, "src/brand.css"), "utf8")
	const tokens = readFileSync(join(root, "src/tokens.css"), "utf8")
	const light = block(tokens, ":root")
	const dark = block(tokens, '[data-theme="dark"]')

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
