import * as stylex from "@stylexjs/stylex"
import { color, radius, shadow } from "../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

export const growIn = stylex.keyframes({
	from: { opacity: 0, scale: "1 0.97" },
	to: { opacity: 1, scale: "1 1" },
})

export const popupStyles = stylex.create({
	surface: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		boxShadow: shadow.popover,
		overflow: "hidden",
		transformOrigin: "var(--transform-origin)",
		animationName: { default: growIn, [REDUCED]: "none" },
		animationDuration: "140ms",
		animationTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	anchorWidth: { width: "var(--anchor-width)" },
	availableHeight: { maxHeight: "var(--available-height)" },
	positioner: { zIndex: 40, outline: "none" },
})
