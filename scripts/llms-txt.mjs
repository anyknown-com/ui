// Writes /llms.txt (index), /llms-full.txt (everything) and /docs/**/*.md (sources) to site/dist.
//
// The docs site is a hash-routed SPA, so a crawler fetching `#/guide/decisions` gets an empty
// shell. The markdown sources therefore also ship at stable URLs, and llms.txt points at them.
// Format per https://llmstxt.org.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { generate as designMd } from "./design-md.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "site/dist")
const site = "https://ui.anyknown.com"

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))

const GUIDES = [
	{
		slug: "getting-started",
		file: "docs/guides/getting-started.md",
		title: "Getting started",
		note: "Install, peer dependencies, StyleX setup, tokens.css for non-StyleX apps, the Toaster / Dialogs hosts, LocaleProvider.",
	},
	{
		slug: "theming",
		file: "docs/guides/theming.md",
		title: "Theming",
		note: "Light, dark and system; themes.stylex; data-theme for tokens.css; regenerating the palette.",
	},
	{
		slug: "state",
		file: "docs/guides/state.md",
		title: "State management",
		note: "createStore / useStore with selectors, the toast and dialog APIs, controlled vs uncontrolled props.",
	},
	{
		slug: "accessibility",
		file: "docs/guides/accessibility.md",
		title: "Accessibility",
		note: "Principles, what is tested (axe, keyboard, reduced motion), what callers must provide.",
	},
	{
		slug: "i18n",
		file: "docs/guides/i18n.md",
		title: "Internationalization",
		note: "LocaleProvider, labels props, defineStrings, adding a locale.",
	},
	{
		slug: "text-layout",
		file: "docs/guides/text-layout.md",
		title: "Text layout",
		note: "measureTextHeight, the optional Pretext engine, Textarea auto-grow.",
	},
	{
		slug: "readme",
		file: "README.md",
		title: "Package README",
		note: "Package layout, development commands, release flow, infrastructure.",
	},
	{
		slug: "components",
		file: "src/components/README.md",
		title: "Component conventions",
		note: "The component list and the decisions every component shares (Base UI headless layer, no bounce, no useEffect, StyleX pitfalls).",
	},
	{
		slug: "decisions",
		file: "src/components/COMPONENTS.md",
		title: "Decision log",
		note: "Why each component is the way it is, the dead ends and the traps: what the code and types do not show.",
	},
	{
		slug: "a11y",
		file: "src/components/A11Y-DEBT.md",
		title: "Accessibility debt",
		note: "Known contrast and hit-target gaps below WCAG thresholds, with suggested fixes.",
	},
	{
		slug: "contributing",
		file: "CONTRIBUTING.md",
		title: "Contributing",
		note: "Setup, scripts, commit convention, house rules, adding a component.",
	},
]

const COMPONENTS = readdirSync(join(root, "src/components"), { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => {
		const file = `src/components/${d.name}/README.md`
		const body = readFileSync(join(root, file), "utf8").trim()
		const title = body.match(/^# (.+)$/m)?.[1] ?? d.name
		const lead = body.split("\n\n")[1]?.replace(/\n/g, " ").trim() ?? ""
		return { slug: d.name, file, title, lead, body }
	})

const read = (page) => readFileSync(join(root, page.file), "utf8").trim()

mkdirSync(join(out, "docs/components"), { recursive: true })
for (const page of GUIDES) writeFileSync(join(out, `docs/${page.slug}.md`), `${read(page)}\n`)
for (const c of COMPONENTS) writeFileSync(join(out, `docs/components/${c.slug}.md`), `${c.body}\n`)

// design.md + brand.css: the two stable URLs for outside agents building one-off pages
// (DESIGN.md, docs/plans/01-design-md.md)
const brandCss = readFileSync(join(root, "dist/brand.css"), "utf8")
const design = designMd(brandCss)
writeFileSync(join(out, "design.md"), design)
copyFileSync(join(root, "dist/brand.css"), join(out, "brand.css"))

const index = `# ${pkg.name}

> ${pkg.description}. Light by default, dark follows the OS. Gray paper on a desk, ink for the primary action, blue only when the agent is working.

Each component has a page at ${site}/#/components/<name> with live demos, props generated from the TypeScript source, and accessibility and keyboard notes. Every entry below links the markdown source; the #/ link is the same document on the site.

## Build an AnyKnown page

- [design.md](${site}/design.md): how to compose a page and what must not appear (judgment), followed by generated token tables and the brand.css vocabulary. Read this first for one-off HTML: reports, proposals, benchmarks, event pages.
- [brand.css](${site}/brand.css): the bounded vocabulary as one plain CSS file; \`<link rel="stylesheet" href="${site}/brand.css">\` and use it. Shortest form: wrap in \`<main class="ak-page">\`, one \`ak-h1\`, one \`ak-prose\`, one \`ak-table\`; a full example is in the design.md appendix.

## Guides

${GUIDES.map((p) => `- [${p.title}](${site}/docs/${p.slug}.md): ${p.note} On the site: ${site}/#/guide/${p.slug}`).join("\n")}

## Components

${COMPONENTS.map((c) => `- [${c.title}](${site}/docs/components/${c.slug}.md): ${c.lead}`).join("\n")}

## Optional

- [Everything in one file](${site}/llms-full.txt): every guide and component page above, for loading into one context.

## Package

- npm: https://www.npmjs.com/package/${pkg.name} (${pkg.license})
- Source: https://github.com/anyknown-com/ui
- Entry points: \`${pkg.name}\`, \`${pkg.name}/tokens.stylex\`, \`${pkg.name}/themes.stylex\`, \`${pkg.name}/tokens.css\`, \`${pkg.name}/scrollbar.css\`, \`${pkg.name}/brand.css\`
`

writeFileSync(join(out, "llms.txt"), index)

const full = [
	`# ${pkg.name}: all documentation`,
	"",
	`> ${pkg.description}. This file is the full text of every guide and component page listed in ${site}/llms.txt.`,
	"",
	...[...GUIDES, ...COMPONENTS].flatMap((page) => ["---", "", `<!-- ${page.file} -->`, "", read(page), ""]),
].join("\n")

writeFileSync(join(out, "llms-full.txt"), `${full}\n`)

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} kB`
console.log(`  design.md       ${kb(design)}`)
console.log(`  brand.css       ${kb(brandCss)}`)
console.log(`  llms.txt        ${kb(index)}`)
console.log(`  llms-full.txt   ${kb(full)}`)
console.log(`  docs/**/*.md    ${GUIDES.length} guides, ${COMPONENTS.length} components`)
