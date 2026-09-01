// 產生 /llms.txt(索引)、/llms-full.txt(全文)與 /docs/*.md(原文)到 site/dist。
//
// 文檔站是 hash 路由的 SPA,爬蟲抓 `#/guide/texture` 只會拿到空殼,所以 markdown 原文
// 另外用穩定網址送一份出去,llms.txt 指過去。格式依 https://llmstxt.org。
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { generate as designMd } from "./design-md.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "site/dist")
const site = "https://ui.anyknown.com"

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))

const PAGES = [
	{
		slug: "readme",
		file: "README.md",
		guide: "readme",
		title: "開始使用",
		note: "套件結構、開發指令、發佈流程、在各 app 的接法、Ledger 視覺方向。",
	},
	{
		slug: "components",
		file: "src/components/README.md",
		guide: "components",
		title: "元件總覽",
		note: "34 個元件的清單、跨元件的共同決策(Base UI headless 層、動畫不回彈、禁用 useEffect、StyleX 0.19 的坑)。",
	},
	{
		slug: "decisions",
		file: "src/components/COMPONENTS.md",
		guide: "decisions",
		title: "元件決定紀錄",
		note: "每個元件的定案理由、走過的彎路、踩過的坑 —— 程式碼與型別裡看不出來的部分。",
	},
	{
		slug: "texture",
		file: "src/components/TEXTURE-GUIDE.md",
		guide: "texture",
		title: "織物設計語言",
		note: "元件是線織成的實體。幾何配方(固定種子、共享波場、四層堆疊)、觸點驅動的動態、否決紀錄、適配到新元件的步驟。",
	},
	{
		slug: "a11y",
		file: "src/components/A11Y-DEBT.md",
		guide: "a11y",
		title: "a11y 偏差",
		note: "已知低於 WCAG 門檻的對比與命中區,以及各自的修法建議。",
	},
]

const read = (page) => readFileSync(join(root, page.file), "utf8").trim()

mkdirSync(join(out, "docs"), { recursive: true })
for (const page of PAGES) writeFileSync(join(out, `docs/${page.slug}.md`), `${read(page)}\n`)

// design.md + brand.css:給外部 agent 做一次性頁面的兩個穩定網址(DESIGN.md、docs/plans/01-design-md.md)
const brandCss = readFileSync(join(root, "dist/brand.css"), "utf8")
const design = designMd(brandCss)
writeFileSync(join(out, "design.md"), design)
copyFileSync(join(root, "dist/brand.css"), join(out, "brand.css"))

const index = `# ${pkg.name}

> ${pkg.description}。light 為預設、dark 跟隨 OS;元件沒有 background —— 實心是線織出來的。

視覺的真相是實作本身:每個元件在 ${site}/#/demo/<name> 都可以直接操作。
下面每一項的 .md 是原文,#/guide/ 是站上排版後的同一份。

## 做一個 AnyKnown 的頁面

- [design.md](${site}/design.md): 頁面該怎麼組、什麼不准出現(判斷),後面接生成的 token 表與 brand.css 詞彙表。要產報告、提案、benchmark、活動頁這種一次性 HTML,先讀這份。
- [brand.css](${site}/brand.css): 有界詞彙,純 CSS 單檔,\`<link rel="stylesheet" href="${site}/brand.css">\` 進來就能用。最短用法:\`<main class="ak-page">\` 包住,一個 \`ak-h1\`、一段 \`ak-prose\`、一張 \`ak-table\`;完整範例在 design.md 附錄。

## 指南

${PAGES.map((p) => `- [${p.title}](${site}/docs/${p.slug}.md): ${p.note} 站上版本:${site}/#/guide/${p.guide}`).join("\n")}

## 全文

- [全部指南串成一份](${site}/llms-full.txt): 上面五份的完整內容,適合一次讀進 context。

## 套件

- npm: https://www.npmjs.com/package/${pkg.name}(${pkg.license})
- 原始碼: https://github.com/anyknown-com/ui
- 進入點: \`${pkg.name}\`、\`${pkg.name}/tokens.stylex\`、\`${pkg.name}/themes.stylex\`、\`${pkg.name}/tokens.css\`、\`${pkg.name}/scrollbar.css\`
`

writeFileSync(join(out, "llms.txt"), index)

const full = [
	`# ${pkg.name} — 全部文件`,
	"",
	`> ${pkg.description}。本檔是 ${site}/llms.txt 列出的五份指南的完整內容。`,
	"",
	...PAGES.flatMap((page) => [`---`, "", `<!-- ${page.file} -->`, "", read(page), ""]),
].join("\n")

writeFileSync(join(out, "llms-full.txt"), `${full}\n`)

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} kB`
console.log(`  design.md       ${kb(design)}`)
console.log(`  brand.css       ${kb(brandCss)}`)
console.log(`  llms.txt        ${kb(index)}`)
console.log(`  llms-full.txt   ${kb(full)}`)
console.log(`  docs/*.md       ${PAGES.length} 份`)
