import * as stylex from "@stylexjs/stylex"
import { iconSize } from "../../tokens.stylex"

/** An icon draws at the size it is given; these are the five in use (`iconSize`). Stroke 2, currentColor. */
export const icon = stylex.create({
	xs: { flexShrink: 0, height: iconSize.xs, pointerEvents: "none", width: iconSize.xs },
	sm: { flexShrink: 0, height: iconSize.sm, pointerEvents: "none", width: iconSize.sm },
	md: { flexShrink: 0, height: iconSize.md, pointerEvents: "none", width: iconSize.md },
	base: { flexShrink: 0, height: iconSize.base, pointerEvents: "none", width: iconSize.base },
	lg: { flexShrink: 0, height: iconSize.lg, pointerEvents: "none", width: iconSize.lg },
})

/** The stroke width every icon in the package is drawn with. */
export const ICON_STROKE = 2
