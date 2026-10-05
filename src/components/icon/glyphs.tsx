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

export function PlusGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</Glyph>
	)
}

export function XGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</Glyph>
	)
}

export function MicGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M12 19v3" />
			<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
			<rect x="9" y="2" width="6" height="13" rx="3" />
		</Glyph>
	)
}

export function MicOffGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M12 19v3" />
			<path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
			<path d="M16.95 16.95A7 7 0 0 1 5 12v-2" />
			<path d="M18.89 13.23A7 7 0 0 0 19 12v-2" />
			<path d="m2 2 20 20" />
			<path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
		</Glyph>
	)
}

export function PhoneOffGlyph(props: GlyphProps) {
	return (
		<Glyph {...props}>
			<path d="M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272" />
			<path d="M22 2 2 22" />
			<path d="M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473" />
		</Glyph>
	)
}
