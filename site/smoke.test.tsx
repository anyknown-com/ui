import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test, vi } from "vitest"
import { DEMOS } from "../playground/demos"
import { COMPONENT_DOCS, COMPONENT_GROUPS, GUIDES } from "./content"
import { Site } from "./Site"

// Node's own experimental localStorage shadows jsdom's and has no methods; give the site a
// working one, and a no-op scrollTo (jsdom has none).
const storage = new Map<string, string>()
vi.stubGlobal("localStorage", {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => void storage.set(key, value),
	removeItem: (key: string) => void storage.delete(key),
})
window.scrollTo = () => {}

function goto(hash: string) {
	act(() => {
		location.hash = hash
		window.dispatchEvent(new HashChangeEvent("hashchange"))
	})
}

const folders = readdirSync(join(import.meta.dirname, "../src/components"), { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)
	.sort()

describe("site content", () => {
	test("every component folder has a README and sits in exactly one nav group", () => {
		expect([...COMPONENT_DOCS.keys()].sort()).toEqual(folders)
		const grouped = COMPONENT_GROUPS.flatMap((g) => g.names).sort()
		expect(grouped).toEqual(folders)
	})

	test("every README has the fixed sections", () => {
		for (const [name, doc] of COMPONENT_DOCS) {
			expect(doc.lead, name).not.toBe("")
			for (const section of ["When to use", "Usage", "Accessibility", "Keyboard", "Related"])
				expect(doc.sections.has(section), `${name}: ${section}`).toBe(true)
		}
	})

	test("demo covers name real folders", () => {
		for (const demo of DEMOS) for (const name of demo.covers) expect(folders, demo.id).toContain(name)
	})
})

describe("site smoke", () => {
	test("home, guides, tokens and demo pages render", () => {
		location.hash = ""
		render(<Site />)
		expect(screen.getByRole("heading", { level: 1, name: "@anyknown/ui" })).toBeInTheDocument()
		// the count is derived from the folders, not typed in
		expect(screen.getByText(String(folders.length))).toBeInTheDocument()

		for (const guide of GUIDES) {
			goto(`#/guide/${guide.key}`)
			expect(document.querySelector("main .prose"), guide.key).not.toBeNull()
		}
		goto("#/guide/readme")
		expect(screen.getByRole("link", { name: "StyleX" })).toBeInTheDocument()

		goto("#/tokens")
		expect(screen.getByRole("heading", { level: 1, name: "Foundations" })).toBeInTheDocument()
		expect(screen.getAllByText("color.signal").length).toBeGreaterThan(0)

		goto("#/demo/badge")
		for (const demo of DEMOS) expect(document.getElementById(demo.id), demo.id).not.toBeNull()
	})

	test("every component page renders its sections, demos and props", () => {
		location.hash = ""
		render(<Site />)
		for (const name of folders) {
			goto(`#/components/${name}`)
			const main = screen.getByRole("main")
			const doc = COMPONENT_DOCS.get(name)!
			expect(within(main).getByRole("heading", { level: 1, name: doc.title })).toBeInTheDocument()
			expect(within(main).getByRole("heading", { level: 2, name: "API" })).toBeInTheDocument()
			for (const demo of DEMOS.filter((d) => d.covers.includes(name)))
				expect(document.getElementById(demo.id), `${name} → ${demo.id}`).not.toBeNull()
		}
		goto("#/components/button")
		expect(screen.getByRole("heading", { level: 3, name: "<Button>" })).toBeInTheDocument()
		// README links between components become site routes
		expect(screen.getAllByRole("link", { name: "IconButton" })[0]).toHaveAttribute(
			"href",
			"#/components/icon-button",
		)
		// links from before the component pages existed still land on the component
		goto("#/docs/dialog")
		expect(
			screen.getByRole("heading", { level: 1, name: COMPONENT_DOCS.get("dialog")!.title }),
		).toBeInTheDocument()
	})

	test("theme toggle stamps html with data-theme and a theme class", async () => {
		const user = userEvent.setup()
		location.hash = ""
		render(<Site />)
		const html = document.documentElement
		const theme = screen.getByRole("group", { name: "Theme" })
		expect(html.dataset.theme).toBeUndefined()

		await user.click(within(theme).getByRole("button", { name: "Dark" }))
		expect(html.dataset.theme).toBe("dark")
		const darkClasses = [...html.classList]
		expect(darkClasses.length).toBeGreaterThan(0)

		await user.click(within(theme).getByRole("button", { name: "Light" }))
		expect(html.dataset.theme).toBe("light")
		expect([...html.classList]).not.toEqual(darkClasses)

		await user.click(within(theme).getByRole("button", { name: "System" }))
		expect(html.dataset.theme).toBeUndefined()
		expect(html.classList.length).toBe(0)
		expect(localStorage.getItem("ak-site-theme")).toBeNull()
	})

	test("language toggle switches built-in component words and is remembered", async () => {
		const user = userEvent.setup()
		location.hash = "#/components/password-input"
		render(<Site />)
		const group = screen.getByRole("group", { name: "Language of built-in component text" })
		const english = within(group).getByRole("button", { name: "English" })
		expect(english).toHaveAttribute("aria-pressed", "true")

		await user.click(within(group).getByRole("button", { name: "繁體中文" }))
		expect(within(group).getByRole("button", { name: "繁體中文" })).toHaveAttribute("aria-pressed", "true")
		expect(localStorage.getItem("ak-site-locale")).toBe("zh-TW")

		await user.click(english)
		expect(localStorage.getItem("ak-site-locale")).toBe("en")
	})
})
