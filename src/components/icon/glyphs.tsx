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

export function FileGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
			<path d="M14 2v5a1 1 0 0 0 1 1h5" />
			<path d="M10 9H8" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
		</Glyph>
	)
}

export function CopyGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</Glyph>
	)
}
