// Everything the site renders that is not a React component: guides, per-component docs, the
// generated API and token data, and the component groups for the nav. Counts are derived from
// these, never typed in.
import type { ApiComponent, TokenGroup } from "../scripts/api-docs.mjs"
import api from "./generated/api.json"
import tokens from "./generated/tokens.json"
import readme from "../README.md?raw"
import changelog from "../CHANGELOG.md?raw"
import contributing from "../CONTRIBUTING.md?raw"
import migration from "../MIGRATION.md?raw"
import componentsReadme from "../src/components/README.md?raw"
import decisions from "../src/components/COMPONENTS.md?raw"
import a11yDebt from "../src/components/A11Y-DEBT.md?raw"
import gettingStarted from "../docs/guides/getting-started.md?raw"
import theming from "../docs/guides/theming.md?raw"
import state from "../docs/guides/state.md?raw"
import accessibility from "../docs/guides/accessibility.md?raw"
import i18n from "../docs/guides/i18n.md?raw"
import textLayout from "../docs/guides/text-layout.md?raw"

export type Guide = { key: string; title: string; body: string; file: string }

/** Guides in nav order. `file` is the repo path, for "edit this page" and llms.txt. */
export const GUIDES: Guide[] = [
	{
		key: "getting-started",
		title: "Getting started",
		body: gettingStarted,
		file: "docs/guides/getting-started.md",
	},
	{ key: "theming", title: "Theming", body: theming, file: "docs/guides/theming.md" },
	{ key: "state", title: "State management", body: state, file: "docs/guides/state.md" },
	{ key: "accessibility", title: "Accessibility", body: accessibility, file: "docs/guides/accessibility.md" },
	{ key: "i18n", title: "Internationalization", body: i18n, file: "docs/guides/i18n.md" },
	{ key: "text-layout", title: "Text layout", body: textLayout, file: "docs/guides/text-layout.md" },
	{ key: "migration", title: "Migrating to 0.10", body: migration, file: "MIGRATION.md" },
	{ key: "changelog", title: "Changelog", body: changelog, file: "CHANGELOG.md" },
	{ key: "readme", title: "Package README", body: readme, file: "README.md" },
	{
		key: "components",
		title: "Component conventions",
		body: componentsReadme,
		file: "src/components/README.md",
	},
	{ key: "decisions", title: "Decision log", body: decisions, file: "src/components/COMPONENTS.md" },
	{ key: "a11y", title: "Accessibility debt", body: a11yDebt, file: "src/components/A11Y-DEBT.md" },
	{ key: "contributing", title: "Contributing", body: contributing, file: "CONTRIBUTING.md" },
]

export const guideByKey = (key: string) => GUIDES.find((g) => g.key === key)

/** Component folders by nav group. The smoke test checks every folder is in exactly one. */
export const COMPONENT_GROUPS: { title: string; names: string[] }[] = [
	{
		title: "Actions & display",
		names: [
			"button",
			"icon-button",
			"ghost",
			"card",
			"text",
			"icon",
			"kbd",
			"badge",
			"status-badge",
			"status-chip",
			"live-dot",
			"empty-state",
		],
	},
	{
		title: "Forms",
		names: [
			"input",
			"textarea",
			"label",
			"checkbox",
			"radio",
			"switch",
			"slider",
			"select",
			"segmented",
			"dropdown",
			"password-input",
		],
	},
	{ title: "Overlays & navigation", names: ["dialog", "popover", "tooltip", "toast", "tabs"] },
	{ title: "Progress", names: ["progress", "spin", "skeleton"] },
	{
		title: "Agent & chat",
		names: [
			"message",
			"bubble",
			"markdown",
			"code-block",
			"payload-block",
			"tool-card",
			"reasoning-fold",
			"action-bar",
			"interaction-card",
			"handoff-receipt",
			"composer",
			"attach-button",
			"pending-files",
			"attachment",
			"voice-indicator",
			"call-bar",
		],
	},
	{
		title: "Data & files",
		names: ["data-table", "table", "list", "file-row", "dropzone", "diff-viewer", "recovery-key"],
	},
	{ title: "Page layout", names: ["group", "settings-rows", "page"] },
]

export type ComponentDoc = {
	name: string
	title: string
	lead: string
	/** `## Heading` → markdown body, in file order. */
	sections: Map<string, string>
}

const readmes = import.meta.glob<string>("../src/components/*/README.md", {
	query: "?raw",
	import: "default",
	eager: true,
})

/** Splits a component README into title, lead paragraph and `##` sections. */
export function parseComponentDoc(name: string, source: string): ComponentDoc {
	const lines = source.replace(/\r\n/g, "\n").split("\n")
	let title = name
	const intro: string[] = []
	const sections = new Map<string, string>()
	let current: string | null = null
	let body: string[] = []
	let fenced = false
	const flush = () => {
		if (current != null) sections.set(current, body.join("\n").trim())
		body = []
	}
	for (const line of lines) {
		if (line.startsWith("```")) fenced = !fenced
		if (!fenced && line.startsWith("# ") && current == null && intro.length === 0) {
			title = line.slice(2).trim()
			continue
		}
		if (!fenced && line.startsWith("## ")) {
			flush()
			current = line.slice(3).trim()
			continue
		}
		if (current == null) intro.push(line)
		else body.push(line)
	}
	flush()
	return { name, title, lead: intro.join("\n").trim(), sections }
}

export const COMPONENT_DOCS: Map<string, ComponentDoc> = new Map(
	Object.entries(readmes)
		.map(([path, source]) => {
			const name = path.split("/").at(-2) ?? path
			return [name, parseComponentDoc(name, source)] as const
		})
		.sort(([a], [b]) => a.localeCompare(b)),
)

export const API: ApiComponent[] = api.components as ApiComponent[]

export const apiForFolder = (folder: string) => API.filter((c) => c.folder === folder)

export const TOKEN_GROUPS: TokenGroup[] = tokens.groups as TokenGroup[]

export const tokenGroup = (name: string) => TOKEN_GROUPS.find((g) => g.name === name)

export type { ApiComponent, ApiProp, TokenEntry, TokenGroup } from "../scripts/api-docs.mjs"

export const REPO = "https://github.com/anyknown-com/ui"
