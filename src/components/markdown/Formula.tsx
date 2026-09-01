import * as stylex from "@stylexjs/stylex"
import { useEffect, useRef } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	// Display maths is the one block that routinely overflows a phone: a long equation cannot be
	// re-wrapped the way a paragraph can, so it gets its own scroller rather than widening the page.
	block: {
		display: "block",
		overflowX: "auto",
		overflowY: "hidden",
		paddingBlock: space.xs,
		marginBlock: space.xs,
		color: color.text,
	},
	inline: {
		display: "inline-block",
		maxWidth: "100%",
		overflowX: "auto",
		verticalAlign: "middle",
		color: color.text,
	},
	// What a caller sees when the TeX itself is wrong. Showing the source beats showing nothing:
	// the reader can still read the formula, and it is obvious who to blame.
	error: {
		fontFamily: "ui-monospace, monospace",
		fontSize: text.xs,
		color: color.danger,
		overflowWrap: "anywhere",
	},
})

export type FormulaProps = { children: string; display?: boolean; sx?: StyleArg }

/**
 * TeX → MathML, rendered by the browser itself.
 *
 * Temml emits MathML rather than a pile of positioned spans, which is why this component needs no
 * stylesheet and no web font — the two things a KaTeX integration would push onto every consumer
 * of this package. It also means a screen reader gets the actual maths, not a div soup.
 *
 * Temml writes into the node directly (`temml.render`), so nothing here ever hands a string to
 * `dangerouslySetInnerHTML` — this package does not use it anywhere and maths is not the place to
 * start, given the TeX usually arrives from a language model.
 */
export function Formula({ children, display = false, sx }: FormulaProps) {
	const host = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const node = host.current
		if (!node) return
		let live = true
		// Temml is ~250KB and most messages contain no maths at all, so it arrives only when the
		// first formula does.
		void import("temml").then((temml) => {
			if (!live || !host.current) return
			temml.default.render(children, host.current, {
				displayMode: display,
				// `throwOnError: false` renders the offending source in red instead of blowing up the
				// whole message; `trust: false` (the default) keeps \href and friends inert.
				throwOnError: false,
				errorColor: "currentColor",
			})
		})
		return () => {
			live = false
		}
	}, [children, display])

	return (
		<span
			ref={host}
			{...styled({}, display ? styles.block : styles.inline, sx)}
			// Until Temml lands, and forever if it fails to load, the source is what shows.
			{...(display ? { role: "math" } : {})}
		>
			<span {...stylex.props(styles.error)}>{children}</span>
		</span>
	)
}
