import { readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import { apiDocs, tokenDocs } from "../scripts/api-docs.mjs"

const api = apiDocs()
const byName = (name: string) => api.components.find((c) => c.name === name)

describe("api-docs", () => {
	test("reads props, defaults, requiredness and JSDoc from the source", () => {
		const button = byName("Button")
		expect(button?.folder).toBe("button")
		const size = button?.props.find((p) => p.name === "size")
		expect(size).toMatchObject({ required: false, default: '"md"' })
		// private union aliases are spelled out, not left as an unimportable name
		expect(button?.props.find((p) => p.name === "variant")?.type).toContain('"primary"')
		expect(button?.extends).toContain("React.ButtonHTMLAttributes")

		const toaster = byName("Toaster")
		// a default that names a module constant resolves to the constant's literal
		expect(toaster?.props.find((p) => p.name === "timeout")?.default).toMatch(/^\d+$/)
		expect(toaster?.props.find((p) => p.name === "labels")?.description).toContain("LocaleProvider")
	})

	test("marks aliases and skips hooks, helpers and contexts", () => {
		expect(byName("Item")?.aliasOf).toBe("GroupItem")
		expect(byName("useToast")).toBeUndefined()
		expect(byName("KbdToneContext")).toBeUndefined()
	})

	test("every component folder with a React export is documented", () => {
		const root = join(import.meta.dirname, "../src/components")
		const folders = readdirSync(root, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name)
		const documented = new Set(api.components.map((c) => c.folder))
		// `icon` exports a helper function and a constant, no component
		expect(folders.filter((f) => !documented.has(f))).toEqual(["icon"])
	})

	test("reads token groups with light/dark values and deprecations", () => {
		const groups = tokenDocs().groups
		const color = groups.find((g) => g.name === "color")
		expect(color?.tokens.find((t) => t.key === "signal")).toMatchObject({
			light: expect.any(String),
			dark: expect.any(String),
		})
		expect(groups.find((g) => g.name === "text")?.deprecated).toBeTruthy()
		expect(groups.find((g) => g.name === "zIndex")).toMatchObject({ kind: "consts" })
		expect(groups.find((g) => g.name === "type")?.tokens.find((t) => t.key === "t3")?.description).not.toBe(
			"",
		)
	})
})
