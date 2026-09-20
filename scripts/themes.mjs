// themes.stylex.ts 從 tokens.stylex.ts 生成。
//
// 手抄一份值必然會漂:新的 group 加進 tokens 之後沒有跟著加進 themes,結果手動切「亮」
// 時只有一半的值跟著變。
// 這支同時給 `pnpm gen:themes` 與 themes 的測試用,兩邊跑同一份推導。
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

/** tokens.stylex.ts 裡每個 defineVars group 的 { key: [light, dark] };沒有 dark 變體的 group 不列入。 */
export function readThemedGroups() {
	const source = readFileSync(join(root, "src/tokens.stylex.ts"), "utf8")
	const groups = []
	for (const group of source.matchAll(/export const (\w+) = stylex\.defineVars\(\{(.*?)\n\}\)/gs)) {
		const [, name, body] = group
		const vars = []
		for (const v of body.matchAll(/(\w+):\s*\{\s*default:\s*"([^"]*)",\s*\[DARK\]:\s*"([^"]*)",?\s*\}/g)) {
			vars.push({ key: v[1], light: v[2], dark: v[3] })
		}
		if (vars.length > 0) groups.push({ name, vars })
	}
	return groups
}

export function renderThemes(groups) {
	const imports = groups.map((g) => g.name).join(", ")
	const block = (mode) =>
		groups
			.map(
				(g) =>
					`export const ${mode}${cap(g.name)} = stylex.createTheme(${g.name}, {\n` +
					g.vars.map((v) => `\t${v.key}: "${v[mode]}",`).join("\n") +
					"\n})",
			)
			.join("\n\n")
	// 輸出直接就是 oxfmt 的格式(測試會逐字元比對)
	const names = (mode) => groups.map((g) => `${mode}${cap(g.name)}`).join(", ")
	return `// 這個檔案由 scripts/themes.mjs 從 tokens.stylex.ts 生成 —— 不要手改。
// 重生成:pnpm gen:themes(themes.test.ts 會擋住不同步)
//
// 給有使用者切換主題的 app(例如 next-themes)。tokens 本身跟隨 OS,套上 theme 才會鎖定。
// **要套就整組套**:只套 color 會讓陰影與 tone 停在另一個主題。
import * as stylex from "@stylexjs/stylex"
import { ${imports} } from "./tokens.stylex"

${block("light")}

${block("dark")}

/** 套在 root element 上:\`<div {...stylex.props(...light)}>\` */
export const light = [${names("light")}] as const
export const dark = [${names("dark")}] as const
`
}

const cap = (s) => s[0].toUpperCase() + s.slice(1)

export const generate = () => renderThemes(readThemedGroups())
