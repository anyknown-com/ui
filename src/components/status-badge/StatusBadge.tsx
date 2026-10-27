import * as stylex from "@stylexjs/stylex"
import { color, corner, space, type } from "../../tokens.stylex"
import { LiveDot } from "../live-dot/LiveDot"

/**
 * A state as a coloured word with a 6px dot, for the head of something that runs on its own, like a
 * screen the AI drives: `live` it is running (a breathing dot), `warn` it needs you, `plain` it is over.
 */

const styles = stylex.create({
	badge: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		fontSize: type.t2,
		fontWeight: 500,
		gap: space.xs,
		lineHeight: type.tight,
		whiteSpace: "nowrap",
	},
	// 正在跑 = agent 在做事
	live: { color: color.signal },
	warn: { color: color.warning },
	plain: { color: color.textMuted },
	dot: {
		backgroundColor: "currentColor",
		borderRadius: corner.shape,
		flex: "none",
		forcedColorAdjust: { default: null, "@media (forced-colors: active)": "none" },
		height: 6,
		width: 6,
	},
})

export type StatusBadgeProps = {
	/** `live` it is running (a breathing dot), `warn` it needs you, `plain` it is over. */
	tone: "live" | "warn" | "plain"
	/** The state in words; a live badge also says it to a screen reader as it changes. */
	children: string
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A state as a coloured word and dot, for the head of something that runs on its own, such as a screen the AI drives. */
export function StatusBadge({ tone, children, sx }: StatusBadgeProps) {
	return (
		<span {...stylex.props(styles.badge, styles[tone], sx)}>
			{tone === "live" ? (
				<LiveDot label={children} />
			) : (
				<i aria-hidden="true" {...stylex.props(styles.dot)} />
			)}
			<span {...(tone === "live" ? { "aria-hidden": true } : {})}>{children}</span>
		</span>
	)
}
