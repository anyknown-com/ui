import * as stylex from "@stylexjs/stylex"
import type { StyleArg } from "../../lib/styled"
import { color, radius, space } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

// 呼吸只到 0.35 就回來:淡出到底會變成閃爍,那是警報不是「還在跑」。
const breathe = stylex.keyframes({ "50%": { opacity: 0.35 } })

const styles = stylex.create({
	wrap: { display: "inline-flex", alignItems: "center", gap: space.xxs },
	dot: {
		flex: "none",
		width: "0.375rem",
		height: "0.375rem",
		borderRadius: radius.full,
		backgroundColor: color.accent,
		animationName: { default: breathe, [REDUCED]: "none" },
		animationDuration: "1.6s",
		animationIterationCount: "infinite",
		animationTimingFunction: "ease-in-out",
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		margin: -1,
		padding: 0,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
	},
})

export type LiveDotProps = {
	/** 有 label 就變成 `role="status"`,讀屏聽得到「還在跑」。沒有就只是一顆裝飾。 */
	label?: string
	sx?: StyleArg
}

export function LiveDot({ label, sx }: LiveDotProps) {
	if (label == null) return <span aria-hidden="true" {...stylex.props(styles.dot, sx)} />
	return (
		<span role="status" {...stylex.props(styles.wrap, sx)}>
			<span aria-hidden="true" {...stylex.props(styles.dot)} />
			<span {...stylex.props(styles.srOnly)}>{label}</span>
		</span>
	)
}
