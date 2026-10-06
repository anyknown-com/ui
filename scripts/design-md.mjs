// design.md = DESIGN.md as written + a generated appendix (token tables, brand.css vocabulary).
// Numbers are never copied by hand: tokens are read from tokens.stylex.ts and classes are scanned
// from brand.css (each class's purpose is the comment above it). Same idea as gen:themes.
// Called by llms-txt.mjs; writes site/dist/design.md.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { readThemedGroups } from "./themes.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** Groups in tokens.stylex.ts without a dark variant: { name, vars: [{ key, value }] }. */
function readPlainGroups() {
	const source = readFileSync(join(root, "src/tokens.stylex.ts"), "utf8")
	const groups = []
	for (const group of source.matchAll(/export const (\w+) = stylex\.defineVars\(\{(.*?)\n\}\)/gs)) {
		const [, name, body] = group
		// a group whose JSDoc says @deprecated (the old `text` scale) is not offered to new pages
		const doc = source.slice(0, group.index).match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*$/)
		if (doc?.[1].includes("@deprecated")) continue
		const vars = [...body.matchAll(/^\t(\w+):\s*"([^"]*)",?$/gm)].map((v) => ({ key: v[1], value: v[2] }))
		if (vars.length > 0) groups.push({ name, vars })
	}
	return groups
}

/** What each brand.css class is for: the comment on the line right above its selector. */
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

	// tokens.css naming: color keys are --ak-<key>, other groups carry the group name (--ak-shadow-float)
	const varName = (g, key) => `--ak-${g.name === "color" ? "" : `${g.name}-`}${kebab(key)}`
	const colorTable = themed
		.map(
			(g) =>
				`| Variable | light | dark |\n| --- | --- | --- |\n` +
				g.vars.map((v) => `| \`${varName(g, v.key)}\` | \`${v.light}\` | \`${v.dark}\` |`).join("\n"),
		)
		.join("\n\n")

	const plainTables = plain
		.map(
			(g) =>
				`### ${g.name}\n\n| Name | Value |\n| --- | --- |\n` +
				g.vars.map((v) => `| \`${g.name}.${v.key}\` | \`${v.value}\` |`).join("\n"),
		)
		.join("\n\n")

	const vocab = readVocabulary(brandCss)
	const vocabTable = `| Class | Purpose |\n| --- | --- |\n${vocab.map((r) => `| \`${r.cls}\` | ${r.note} |`).join("\n")}`

	return `${design}

---

## Appendix (generated; do not edit)

Generated at build time by \`scripts/design-md.mjs\` from \`src/tokens.stylex.ts\` and \`brand.css\`.

### Shortest usage

\`\`\`html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Monthly usage report</title>
<link rel="stylesheet" href="https://ui.anyknown.com/brand.css">
</head>
<body>
<main class="ak-page">
  <h1 class="ak-display">August usage report</h1>
  <div class="ak-prose">
    <p>API calls grew 18% over last month; cost held flat.</p>
  </div>
  <table class="ak-table">
    <thead><tr><th>Product</th><th data-num>Calls</th><th data-num>Cost (USD)</th></tr></thead>
    <tbody>
      <tr><td>product</td><td data-num>1,204,311</td><td data-num>412.50</td></tr>
      <tr><td>call</td><td data-num>88,102</td><td data-num>3,120.00</td></tr>
    </tbody>
  </table>
</main>
</body>
</html>
\`\`\`

### brand.css vocabulary (${vocab.length} classes; anything not listed is not allowed)

${vocabTable}

### Color tokens (\`--ak-*\`)

Light is the default and dark follows the OS; \`ak-theme-light\` / \`ak-theme-dark\` lock one by hand.

${colorTable}

### Fonts, type, space, corners, motion

Every group below is also a CSS variable, named \`--ak-<group>-<key>\` (\`--ak-space-md\`, \`--ak-type-t3\`,
\`--ak-corner-card\`, \`--ak-motion-ease-out\`). brand.css already uses them in its classes; when you write your own
CSS, pick values from these tables and do not invent new ones. Deprecated groups (the old \`text\` scale) are left out.

${plainTables}
`
}
