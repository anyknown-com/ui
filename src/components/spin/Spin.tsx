import * as stylex from "@stylexjs/stylex"
import { motion } from "../../tokens.stylex"

/** `.spin`: 12px ring, the one thing on a button that moves while it waits. */

const turn = stylex.keyframes({ to: { transform: "rotate(360deg)" } })

const styles = stylex.create({
	root: {
		animationDuration: motion.loopFast,
		animationIterationCount: "infinite",
		animationName: { default: turn, "@media (prefers-reduced-motion: reduce)": "none" },
		animationTimingFunction: motion.linear,
		borderColor: "color-mix(in srgb, currentColor 28%, transparent)",
		borderRadius: "50%",
		borderStyle: "solid",
		borderTopColor: "currentColor",
		borderWidth: 2,
		boxSizing: "border-box",
		flex: "none",
		height: 12,
		width: 12,
	},
	small: { borderWidth: 1.5, height: 9, width: 9 },
})

export type SpinProps = {
	/** A 9px ring instead of 12px, for tight spots such as a chip. @default false */
	small?: boolean
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A small spinning ring in the current text colour, hidden from screen readers; shows that something is waiting. */
export function Spin({ small = false, sx }: SpinProps) {
	return <span aria-hidden="true" {...stylex.props(styles.root, small && styles.small, sx)} />
}
