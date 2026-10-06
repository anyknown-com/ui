import type { SVGAttributes } from "react"
import { Glyph } from "./glyphs"

const PATH = { right: "m9 18 6-6-6-6", down: "m6 9 6 6 6-6" } as const

/** A chevron glyph pointing right or down, for disclosure and navigation affordances. */
export function Chevron({
	direction,
	...props
}: SVGAttributes<SVGSVGElement> & {
	/** Which way the chevron points. */
	direction: keyof typeof PATH
}) {
	return (
		<Glyph {...props}>
			<path d={PATH[direction]} />
		</Glyph>
	)
}
