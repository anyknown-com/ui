import * as stylex from "@stylexjs/stylex"

/** An icon draws at the size it is given; these are the five in use. Stroke 2, currentColor. */
export const icon = stylex.create({
	xs: { flexShrink: 0, height: 12, pointerEvents: "none", width: 12 },
	sm: { flexShrink: 0, height: 14, pointerEvents: "none", width: 14 },
	md: { flexShrink: 0, height: 16, pointerEvents: "none", width: 16 },
	base: { flexShrink: 0, height: 18, pointerEvents: "none", width: 18 },
	lg: { flexShrink: 0, height: 20, pointerEvents: "none", width: 20 },
})

export const ICON_STROKE = 2
