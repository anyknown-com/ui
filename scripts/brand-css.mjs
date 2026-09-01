// dist/brand.css 從 src/brand.css 生成:單檔、給沒有 bundler 的一次性頁面 <link> 進來就能用。
//
// 接進去的四樣東西都不手抄:
// - Google Fonts 的 @import(外部頁面沒有 @fontsource)
// - tokens.css 原文內聯(不用管相對路徑)
// - .ak-theme-light / .ak-theme-dark:從 tokens.css 的 light / dark 兩個 block 抄成手動主題
// - ak-btn 的織體:用 weave.ts 同一份幾何、tokens.stylex.ts 同一份紗色,預渲染成 SVG data URI。
//   靜態織紋就夠,不做 silk 動態;少了這步外部頁面的按鈕就是一顆 viridian 色塊。
//
// 跑之前要先 tsc(要 dist/lib/weave.js)。pnpm build 已經排好順序。
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { readThemedGroups } from "./themes.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const { buildWeave, weaveRand } = await import(join(root, "dist/lib/weave.js"))

const FONTS =
	'@import url("https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap");'

// 布的尺寸:高 = ak-btn 的 min-height(36px);寬取一段,preserveAspectRatio=none 隨按鈕拉寬。
// 紗是橫的,橫向拉伸只會把波形攤平一點,看不出來;縱向永遠 1:1 所以粗細行距跟 Button 一致。
const W = 120
const H = 36

function weaveDataUri(p) {
	const layers = buildWeave({ w: W, h: H }, weaveRand())
	// 座標留一位小數就夠(0.01px 看不出來),四份 data URI 加起來才不會把 css 撐到六位數
	const path = (s) => `<path d='${s.d.replace(/(\.\d)\d/g, "$1")}' stroke-width='${s.sw}'/>`
	const buckets = [p.y0, p.y1, p.y2, p.y3, p.y4]
	// 底紗(un)行距 1.5 粗 3.4,實際上是實心的;用 rect 代替省掉二十幾條 path
	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'>` +
		`<rect width='${W}' height='${H}' fill='${p.un}'/>` +
		`<g fill='none' stroke-linecap='round'>` +
		`<g stroke='${p.sh}' opacity='.5'>${layers.seams.map(path).join("")}</g>` +
		buckets
			.map(
				(c, i) =>
					`<g stroke='${c}'>${layers.face
						.filter((s) => s.bucket === i)
						.map(path)
						.join("")}</g>`,
			)
			.join("") +
		`<g stroke='${p.hi}' opacity='.45'>${layers.hi.map(path).join("")}</g>` +
		`</g></svg>`
	return `url("data:image/svg+xml,${svg.replace(/[<>#"]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}")`
}

function palettes() {
	const groups = Object.fromEntries(readThemedGroups().map((g) => [g.name, g.vars]))
	const pick = (name, mode) => Object.fromEntries(groups[name].map((v) => [v.key, v[mode]]))
	return {
		light: { primary: pick("yarn", "light"), secondary: pick("yarnSecondary", "light") },
		dark: { primary: pick("yarn", "dark"), secondary: pick("yarnSecondary", "dark") },
	}
}

// data URI 只在 :root 出一次(-light / -dark 各一份),主題 block 用 var() 指過去
function weaveUris(p, mode) {
	return [
		`\t--ak-weave-primary-${mode}: ${weaveDataUri(p.primary)};`,
		`\t--ak-weave-secondary-${mode}: ${weaveDataUri(p.secondary)};`,
	].join("\n")
}

function weaveVars(p, mode) {
	return [
		`\t--ak-weave-primary: var(--ak-weave-primary-${mode});`,
		`\t--ak-weave-primary-shadow: ${p.primary.shadow};`,
		`\t--ak-weave-secondary: var(--ak-weave-secondary-${mode});`,
		`\t--ak-weave-secondary-shadow: ${p.secondary.shadow};`,
	].join("\n")
}

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
	const p = palettes()
	const light = block(tokens, ":root")
	const dark = block(tokens, '[data-theme="dark"]')

	const themes = `/* 織體與手動主題:由 scripts/brand-css.mjs 生成 */
:root {
${weaveUris(p.light, "light")}
${weaveUris(p.dark, "dark")}
${weaveVars(p.light, "light")}
}
@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
${weaveVars(p.dark, "dark")}
	}
}
[data-theme="dark"] {
${weaveVars(p.dark, "dark")}
}
/* 手動鎖定淺色;放在 html 上就整頁鎖,放在子樹上只鎖那塊。 */
:root.ak-theme-light,
.ak-theme-light {
${light}
${weaveVars(p.light, "light")}
}
/* 手動鎖定暗色。 */
:root.ak-theme-dark,
.ak-theme-dark {
${dark}
${weaveVars(p.dark, "dark")}
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
