// design.md = DESIGN.md 原文 + 生成附錄(token 表、brand.css 詞彙表)。
// 數字永遠不手抄:token 從 tokens.stylex.ts 讀,class 從 brand.css 掃(用途在 css 註解裡)。
// 跟 gen:themes 同一思路。由 llms-txt.mjs 呼叫,出 site/dist/design.md。
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { readThemedGroups } from "./themes.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** tokens.stylex.ts 裡沒有 dark 變體的 group:{ name, vars: [{ key, value }] }。 */
function readPlainGroups() {
	const source = readFileSync(join(root, "src/tokens.stylex.ts"), "utf8")
	const groups = []
	for (const group of source.matchAll(/export const (\w+) = stylex\.defineVars\(\{(.*?)\n\}\)/gs)) {
		const [, name, body] = group
		const vars = [...body.matchAll(/^\t(\w+):\s*"([^"]*)",?$/gm)].map((v) => ({ key: v[1], value: v[2] }))
		if (vars.length > 0) groups.push({ name, vars })
	}
	return groups
}

/** brand.css 裡每個 class 的用途:緊貼在 selector 上一行的註解。 */
function readVocabulary(css) {
	const rows = []
	for (const m of css.matchAll(/\/\* (.*?) \*\/\n(?::root)?\.(ak-[\w-]+)/g))
		rows.push({ cls: m[2], note: m[1] })
	return rows
}

export function generate(brandCss) {
	const design = readFileSync(join(root, "DESIGN.md"), "utf8").trim()
	const themed = readThemedGroups().filter((g) => g.name === "color" || g.name === "shadow")
	const plain = readPlainGroups()

	// tokens.css 的命名:color 群直接 --ak-<key>,其他群帶群名(--ak-shadow-popover)
	const varName = (g, key) => `--ak-${g.name === "color" ? "" : `${g.name}-`}${kebab(key)}`
	const colorTable = themed
		.map(
			(g) =>
				`| 變數 | light | dark |\n| --- | --- | --- |\n` +
				g.vars.map((v) => `| \`${varName(g, v.key)}\` | \`${v.light}\` | \`${v.dark}\` |`).join("\n"),
		)
		.join("\n\n")

	const plainTables = plain
		.map(
			(g) =>
				`### ${g.name}\n\n| 名 | 值 |\n| --- | --- |\n` +
				g.vars.map((v) => `| \`${g.name}.${v.key}\` | \`${v.value}\` |`).join("\n"),
		)
		.join("\n\n")

	const vocab = readVocabulary(brandCss)
	const vocabTable = `| class | 用途 |\n| --- | --- |\n${vocab.map((r) => `| \`${r.cls}\` | ${r.note} |`).join("\n")}`

	return `${design}

---

## 附錄(生成,不要手改)

以下由 \`scripts/design-md.mjs\` 在 build 時從 \`src/tokens.stylex.ts\` 與 \`brand.css\` 生成。

### 最短用法

\`\`\`html
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>usage 月報</title>
<link rel="stylesheet" href="https://ui.anyknown.com/brand.css">
</head>
<body>
<main class="ak-page">
  <h1 class="ak-display">八月 usage 月報</h1>
  <div class="ak-prose">
    <p>本月 API 呼叫較上月成長 18%,成本持平。</p>
  </div>
  <table class="ak-table">
    <thead><tr><th>產品</th><th data-num>呼叫數</th><th data-num>成本(USD)</th></tr></thead>
    <tbody>
      <tr><td>product</td><td data-num>1,204,311</td><td data-num>412.50</td></tr>
      <tr><td>call</td><td data-num>88,102</td><td data-num>3,120.00</td></tr>
    </tbody>
  </table>
</main>
</body>
</html>
\`\`\`

### brand.css 詞彙(${vocab.length} 個 class,不在表上就是不准用)

${vocabTable}

### 顏色 token(\`--ak-*\`)

light 為預設,dark 跟隨 OS;\`ak-theme-light\` / \`ak-theme-dark\` 手動鎖。

${colorTable}

### 字體、字級、間距、圓角、動效

CSS 變數只有 font / radius / motion 三組(\`--ak-font-body\`、\`--ak-radius-md\`、\`--ak-motion-ease-out\` 這種寫法);
text 與 space 的階在 brand.css 裡已經用在 class 上,自己寫 css 時照這張表挑值,不要自創。

${plainTables}
`
}
