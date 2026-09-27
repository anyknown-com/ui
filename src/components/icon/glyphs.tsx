import type { ReactNode, SVGAttributes } from "react"
import { ICON_STROKE } from "./icon"

/**
 * The few glyphs the package draws itself, path for path the lucide ones the shells use, so a
 * component moved here from a shell looks the same without this package depending on lucide.
 */

type GlyphProps = SVGAttributes<SVGSVGElement>

function Glyph({ children, ...props }: GlyphProps & { children: ReactNode }) {
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
			{children}
		</svg>
	)
}

export function CheckGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M20 6 9 17l-5-5" />
		</Glyph>
	)
}
