import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { Spin } from "../spin/Spin"

/**
 * `.tchip` / `.achip`: a mono word whose colour is its only mark. `r`, `w`, `n` and `plain` are
 * muted, `d` destructive (danger), `a` active (signal, spinning), `f` failed (danger + a 6px dot).
 */

const styles = stylex.create({
	root: {
		alignItems: "center",
		display: "inline-flex",
		flex: "none",
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.xxs,
		lineHeight: "16px",
		whiteSpace: "nowrap",
	},
	r: { color: color.textMuted },
	w: { color: color.textMuted },
	d: { color: color.danger },
	n: { color: color.textMuted },
	// 執行中 = agent 在做事
	a: { color: color.signal },
	f: { color: color.danger },
	plain: { color: color.textMuted },
	dot: { backgroundColor: color.danger, borderRadius: corner.shape, flex: "none", height: 6, width: 6 },
	pill: {
		alignItems: "center",
		color: color.textMuted,
		display: "inline-flex",
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.xxs,
		lineHeight: "22px",
		whiteSpace: "nowrap",
	},
	live: { backgroundColor: color.signal, borderRadius: corner.shape, flex: "none", height: 6, width: 6 },
	paused: { backgroundColor: color.warning },
	done: { backgroundColor: color.success },
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
	 * (with a red dot), `plain` a neutral word. Only the word's colour differs.
	 */
	variant: "r" | "w" | "d" | "n" | "a" | "f" | "plain"
	/** The chip's word. */
	children: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A short mono word, coloured by what a tool call does or how it went. */
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

/** `.pill-s`: the mono words, with an optional 6px dot, a fold's first line is made of. */
export function Pill({ status, title = false, children, sx }: PillProps) {
	return (
		<span
			{...(title && typeof children === "string" ? { title: children } : {})}
			{...stylex.props(styles.pill, title && styles.title, sx)}
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
