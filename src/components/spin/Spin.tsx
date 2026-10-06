import * as stylex from "@stylexjs/stylex"

/** `.spin`: 12px ring, the one thing on a button that moves while it waits. */

const turn = stylex.keyframes({ to: { transform: "rotate(360deg)" } })

const styles = stylex.create({
	root: {
		animationDuration: "0.7s",
		animationIterationCount: "infinite",
		animationName: { default: turn, "@media (prefers-reduced-motion: reduce)": "none" },
		animationTimingFunction: "linear",
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

export type SpinProps = { small?: boolean; sx?: stylex.StyleXStyles }

export function Spin({ small = false, sx }: SpinProps) {
	return <span aria-hidden="true" {...stylex.props(styles.root, small && styles.small, sx)} />
}
