// DESIGN.md 與 brand.css 的詞彙必須同步:文件提到的每個 ak-* class 都要存在於 css,
// css 裡每個 class 都要在文件出現過一次。不同步就擋(進 pnpm check)。
//
// 文件講判斷、css 定詞彙,兩邊各自演化就會出現「文件叫你用一個不存在的 class」或
// 「css 有一個沒人知道怎麼用的 class」。兩種都讓 agent 自創,正是這套要防的事。
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

/** brand.css 裡所有 .ak-* selector 的 class 名(去重、排序)。 */
export function cssClasses(css = readFileSync(join(root, "src/brand.css"), "utf8")) {
	// 只看 selector,不看註解;註解裡的 `-warning` 這種縮寫不算
	const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
	return [...new Set([...noComments.matchAll(/\.(ak-[\w-]+)/g)].map((m) => m[1]))].sort()
}

/** DESIGN.md 裡提到的 ak-* 名字。 */
export function docClasses(md = readFileSync(join(root, "DESIGN.md"), "utf8")) {
	// 跳過 --ak-* 變數,也跳過 `ak-grid-*` 這種以 - 結尾的泛稱
	return [...new Set([...md.matchAll(/(?<![-\w])(ak-[\w-]*\w)/g)].map((m) => m[1]))]
		.filter((c) => !md.includes(`${c}-*`))
		.sort()
}

// ak-theme-* 由 brand-css.mjs 生成,src/brand.css 沒有;文件要提、check 也要算
const GENERATED = ["ak-theme-light", "ak-theme-dark"]

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const css = new Set([...cssClasses(), ...GENERATED])
	const doc = new Set(docClasses())
	const missingInCss = [...doc].filter((c) => !css.has(c))
	const missingInDoc = [...css].filter((c) => !doc.has(c))
	if (missingInCss.length + missingInDoc.length === 0) {
		console.log(`  design-check    ${css.size} 個 class,DESIGN.md 與 brand.css 同步`)
	} else {
		for (const c of missingInCss) console.error(`  DESIGN.md 提到 ${c},brand.css 沒有`)
		for (const c of missingInDoc) console.error(`  brand.css 有 ${c},DESIGN.md 沒提`)
		process.exit(1)
	}
}
