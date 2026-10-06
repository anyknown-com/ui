import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, tone, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { Spin } from "../spin/Spin"

/**
 * `.tchip` / `.achip`: a mono word in a 16px pill. `r` read-only (outline), `w` writes (layer),
 * `d` destructive (danger on dangerSubtle), `n` unmarked (outline), `a` active (signal, spinning),
 * `f` failed (danger outline + dot), `plain` the catalogue's auth chip.
 */

const styles = stylex.create({
	root: {
		alignItems: "center",
		borderRadius: corner.pill,
		display: "inline-flex",
		flex: "none",
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.xxs,
		lineHeight: "16px",
		paddingInline: 6,
		whiteSpace: "nowrap",
	},
	r: { boxShadow: `inset 0 0 0 1px ${color.border}`, color: color.textMuted },
	w: { backgroundColor: color.layer4, color: color.text },
	d: { backgroundColor: color.dangerSubtle, color: color.danger },
	n: { boxShadow: `inset 0 0 0 1px ${color.border}`, color: color.textMuted },
	// 執行中 = agent 在做事
	a: { backgroundColor: color.signalSubtle, color: color.signal },
	f: {
		boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color.danger} 55%, transparent)`,
		color: color.danger,
	},
	plain: { backgroundColor: color.layer3, color: color.textMuted, textAlign: "center" },
	dot: { backgroundColor: color.danger, borderRadius: "50%", flex: "none", height: 6, width: 6 },
	pill: {
		alignItems: "center",
		backgroundColor: color.layer3,
		borderRadius: corner.pill,
		color: color.textMuted,
		display: "inline-flex",
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.xxs,
		height: 22,
		paddingInline: space.xs,
		whiteSpace: "nowrap",
	},
	status: { paddingInlineStart: 6 },
	live: { backgroundColor: color.signal, borderRadius: "50%", flex: "none", height: 6, width: 6 },
	paused: { backgroundColor: color.warning },
	done: { backgroundColor: tone.faint },
	title: {
		color: color.text,
		display: "inline-block",
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: "20px",
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
})

export type StatusChipProps = {
	/**
	 * `r` read-only, `w` writes, `d` destructive, `n` unmarked, `a` active (with a spinner), `f` failed
	 * (with a red dot), `plain` a neutral chip.
	 */
	variant: "r" | "w" | "d" | "n" | "a" | "f" | "plain"
	/** The chip's word. */
	children: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A short mono word in a small pill that marks what a tool call does or how it went. */
export function StatusChip({ variant, children, sx }: StatusChipProps) {
	return (
		<span {...stylex.props(styles.root, styles[variant], sx)}>
			{variant === "a" && <Spin small />}
			{variant === "f" && <i {...stylex.props(styles.dot)} aria-hidden="true" />}
			{children}
		</span>
	)
}

export type PillProps = {
	/** A dot in front, coloured by what the thing is doing. */
	status?: "live" | "paused" | "done"
	/** The sub thread's name: body face, text colour, truncates. */
	title?: boolean
	/** The pill's words. */
	children: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** `.pill-s`: the 22px mono pills a fold's first line is made of. */
export function Pill({ status, title = false, children, sx }: PillProps) {
	return (
		<span
			{...(title && typeof children === "string" ? { title: children } : {})}
			{...stylex.props(styles.pill, status !== undefined && styles.status, title && styles.title, sx)}
		>
			{status !== undefined && (
				<span
					aria-hidden="true"
					{...stylex.props(
						styles.live,
						status === "paused" && styles.paused,
						status === "done" && styles.done,
					)}
				/>
			)}
			{children}
		</span>
	)
}
