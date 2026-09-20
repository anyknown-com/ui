import type { SVGAttributes } from "react"
import { ICON_STROKE } from "./icon"

const PATH = { right: "m9 18 6-6-6-6", down: "m6 9 6 6 6-6" } as const

export function Chevron({
	direction,
	...props
}: SVGAttributes<SVGSVGElement> & { direction: keyof typeof PATH }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<path d={PATH[direction]} />
		</svg>
	)
}
