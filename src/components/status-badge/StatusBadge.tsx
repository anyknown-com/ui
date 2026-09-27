import * as stylex from "@stylexjs/stylex"
import { color, type } from "../../tokens.stylex"
import { LiveDot } from "../live-dot/LiveDot"

/**
 * A state in a pill, for the head of something that runs on its own, like a screen the AI drives:
 * `live` it is running (a breathing dot), `warn` it needs you, `plain` it is over.
 */

const styles = stylex.create({
	badge: {
		alignItems: "center",
		borderRadius: 999,
		display: "inline-flex",
		flexShrink: 0,
		fontSize: type.t2,
		gap: 6,
		lineHeight: type.tight,
		paddingBlock: 4,
		paddingInline: 10,
		whiteSpace: "nowrap",
	},
	live: { backgroundColor: color.layer4, color: color.text },
	warn: {
		backgroundColor: `color-mix(in oklab, ${color.warning} 22%, transparent)`,
		color: color.warning,
	},
	plain: { backgroundColor: color.layer4, color: color.textMuted },
})

export type StatusBadgeProps = {
	tone: "live" | "warn" | "plain"
	/** The state in words; a live badge also says it to a screen reader as it changes. */
	children: string
	sx?: stylex.StyleXStyles
}

export function StatusBadge({ tone, children, sx }: StatusBadgeProps) {
	return (
		<span {...stylex.props(styles.badge, styles[tone], sx)}>
			{tone === "live" && <LiveDot label={children} />}
			<span {...(tone === "live" ? { "aria-hidden": true } : {})}>{children}</span>
		</span>
	)
}
