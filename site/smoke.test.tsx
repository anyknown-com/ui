import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test, vi } from "vitest"
import { DEMOS } from "../playground/demos"
import { COMPONENT_DOCS, COMPONENT_GROUPS, GUIDES } from "./content"
import { SCENES } from "./scenes"
import { InspectContext } from "./scenes/Inspect"
import { Site } from "./Site"
import { THUMBNAILS } from "./thumbnails"

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

	test("every grouped component folder has a catalog thumbnail, and nothing else does", () => {
		const grouped = COMPONENT_GROUPS.flatMap((g) => g.names).filter((name) => folders.includes(name))
		for (const name of grouped) expect(THUMBNAILS[name], name).toBeDefined()
		expect(Object.keys(THUMBNAILS).sort()).toEqual([...grouped].sort())
	})

	test("demo covers name real folders", () => {
		for (const demo of DEMOS) for (const name of demo.covers) expect(folders, demo.id).toContain(name)
	})

	test("every scene's uses are real component folders, and ids are unique", () => {
		const ids = SCENES.map((scene) => scene.meta.id)
		expect(new Set(ids).size).toBe(ids.length)
		for (const { meta } of SCENES) {
			expect(meta.uses.length, meta.id).toBeGreaterThan(0)
			expect(meta.decisions.length, meta.id).toBeGreaterThanOrEqual(3)
			for (const name of meta.uses) expect(folders, meta.id).toContain(name)
		}
	})
})

describe("scenes", () => {
	test("every scene renders full, compact and with inspect on", () => {
		for (const { meta, Scene } of SCENES) {
			const full = render(<Scene />)
			expect(full.container.textContent, meta.id).not.toBe("")
			full.unmount()
			render(<Scene compact />).unmount()
			const inspected = render(
				<InspectContext value={true}>
					<Scene />
				</InspectContext>,
			)
			inspected.unmount()
		}
	})

	test("inspect labels link to real component pages", () => {
		const First = SCENES[0]!.Scene
		const { container } = render(
			<InspectContext value={true}>
				<First />
			</InspectContext>,
		)
		const labels = [
			...container.querySelectorAll<HTMLAnchorElement>("[data-part] > a[href^='#/components/']"),
		]
		expect(labels.length).toBeGreaterThan(0)
		for (const label of labels) expect(folders).toContain(label.getAttribute("href")!.split("/").at(-1))
	})

	test("the agent-working run reaches its reply and loops", () => {
		vi.useFakeTimers()
		try {
			const { Scene } = SCENES.find((scene) => scene.meta.id === "agent-working")!
			render(<Scene compact />)
			expect(screen.getAllByText("Agent working").length).toBeGreaterThan(0)
			act(() => vi.advanceTimersByTime(21_000))
			expect(screen.queryAllByText("Agent working")).toHaveLength(0)
			expect(screen.getByText(/Runtime tests pass\./)).toBeInTheDocument()
			act(() => vi.advanceTimersByTime(6_000))
			expect(screen.getAllByText("Agent working").length).toBeGreaterThan(0)
		} finally {
			vi.useRealTimers()
		}
	})
})

describe("site smoke", () => {
	test("home, situations, components, agents, guides, tokens and demo pages render", () => {
		location.hash = ""
		render(<Site />)
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
		for (const { meta } of SCENES)
			expect(document.querySelector(`main a[href="#/situations/${meta.id}"]`), meta.id).not.toBeNull()
		const sections = screen.getByRole("navigation", { name: "Sections" })
		for (const name of ["Situations", "Components", "Foundations", "Guides", "For agents"])
			expect(within(sections).getByRole("link", { name })).toBeInTheDocument()

		goto("#/situations")
		expect(screen.getByRole("heading", { level: 1, name: "Situations" })).toBeInTheDocument()
		for (const { meta } of SCENES) {
			goto(`#/situations/${meta.id}`)
			const main = screen.getByRole("main")
			expect(within(main).getByRole("heading", { level: 1, name: meta.title })).toBeInTheDocument()
			for (const name of meta.uses)
				expect(main.querySelector(`a[href="#/components/${name}"]`), `${meta.id} → ${name}`).not.toBeNull()
		}

		goto("#/components")
		// one card per folder, counted from the folders, not typed in
		const catalog = screen.getByRole("main")
		expect(within(catalog).getByRole("heading", { level: 1, name: "Components" })).toBeInTheDocument()
		expect(catalog.querySelectorAll("a[href^='#/components/']").length).toBe(folders.length)
		expect(within(catalog).getByText(new RegExp(`^${folders.length} component families`))).toBeInTheDocument()

		goto("#/agents")
		for (const url of [
			"https://ui.anyknown.com/design.md",
			"https://ui.anyknown.com/brand.css",
			"https://ui.anyknown.com/llms.txt",
			"https://ui.anyknown.com/llms-full.txt",
		])
			expect(screen.getByText(url)).toBeInTheDocument()

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

	test("catalog cards show an inert thumbnail and stay one focus stop each", () => {
		location.hash = ""
		render(<Site />)
		goto("#/components")
		const cards = [
			...screen.getByRole("main").querySelectorAll<HTMLAnchorElement>("a[href^='#/components/']"),
		]
		expect(cards.length).toBe(folders.length)
		for (const card of cards) {
			const name = card.getAttribute("href")!.split("/").at(-1)!
			const stage = card.querySelector("[inert][aria-hidden='true']")
			expect(stage, name).not.toBeNull()
			expect(stage!.childElementCount, name).toBeGreaterThan(0)
			// the card's name is the link's accessible text; the thumbnail adds none
			expect(within(card).getByText(COMPONENT_DOCS.get(name)!.title)).toBeInTheDocument()
		}
	})

	test("component pages link back to the situations that use them, and only those", () => {
		location.hash = ""
		render(<Site />)
		for (const name of folders) {
			goto(`#/components/${name}`)
			const main = screen.getByRole("main")
			const users = SCENES.filter((scene) => scene.meta.uses.includes(name))
			const heading = within(main).queryByRole("heading", { level: 2, name: "Seen in" })
			if (users.length === 0) {
				expect(heading, name).toBeNull()
				continue
			}
			expect(heading, name).not.toBeNull()
			const block = heading!.closest("section")!
			const links = [...block.querySelectorAll("a")].map((a) => a.getAttribute("href"))
			expect(links, name).toEqual(users.map((scene) => `#/situations/${scene.meta.id}`))
		}
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
