import axe from "axe-core"
import { expect } from "vitest"

/**
 * Rules jsdom cannot answer: it has no layout and no paint, so contrast, target size and
 * "is this scrollable" come back wrong or "incomplete". Page-level rules are off as well,
 * because a component test renders a fragment, not a page.
 */
const JSDOM_BLIND = [
	"color-contrast",
	"color-contrast-enhanced",
	"link-in-text-block",
	"target-size",
	"scrollable-region-focusable",
	"region",
	"landmark-one-main",
	"page-has-heading-one",
	"document-title",
	"html-has-lang",
	"bypass",
]

export type AxeOptions = {
	/** More rule ids to turn off for this call, e.g. a known violation tracked elsewhere. */
	disable?: string[]
	/** Passed through to `axe.run` (merged over the defaults above). */
	run?: axe.RunOptions
}

/** Runs axe and returns the violations, for tests that want to inspect them. */
export async function axeViolations(context: Element = document.body, options: AxeOptions = {}) {
	const rules: Record<string, { enabled: boolean }> = {}
	for (const id of [...JSDOM_BLIND, ...(options.disable ?? [])]) rules[id] = { enabled: false }
	const result = await axe.run(context, {
		resultTypes: ["violations"],
		...options.run,
		rules: { ...rules, ...options.run?.rules },
	})
	return result.violations
}

/**
 * Asserts that axe finds no violations. Defaults to `document.body`, because Base UI popups,
 * dialogs and toasts portal out of the render container:
 *
 * ```ts
 * render(<Dialog defaultOpen>…</Dialog>)
 * await expectNoAxeViolations()
 * await expectNoAxeViolations(container, { disable: ["aria-allowed-role"] })
 * ```
 *
 * The failure message lists each rule with the offending nodes' selectors and HTML.
 */
export async function expectNoAxeViolations(context: Element = document.body, options: AxeOptions = {}) {
	const violations = await axeViolations(context, options)
	const report = violations.map(
		(v) =>
			`${v.id} (${v.impact}): ${v.help}\n` +
			v.nodes.map((n) => `    ${n.target.join(" ")}  ${n.html.slice(0, 160)}`).join("\n"),
	)
	expect(report, "axe violations").toEqual([])
}
