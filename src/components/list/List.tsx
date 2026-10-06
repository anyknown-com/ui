import * as stylex from "@stylexjs/stylex"
import { color, corner, type } from "../../tokens.stylex"
import type { HTMLAttributes, ReactNode } from "react"
import { Ghost, type GhostProps } from "../ghost/Ghost"

/**
 * A list of things you open: a faint head over the columns, then 40px rows that are each one
 * button, no frame around them. Unlike `Table` (a mono ledger) nothing here is mono. The columns
 * are the caller's: one grid template in `sx`, the same on the head and every row, and whatever
 * the list does on a phone (drop the head, wrap a row to two lines) goes in that `sx` too.
 */

const styles = stylex.create({
	head: {
		alignItems: "center",
		borderBlockEndColor: color.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: 1,
		color: color.textMuted,
		columnGap: 12,
		display: "grid",
		fontSize: type.t1,
		lineHeight: type.tight,
		paddingBlock: 8,
		paddingInline: 8,
	},
	sort: {
		color: { default: color.textMuted, ":hover": color.text },
		fontSize: type.t1,
		height: "auto",
		justifyContent: "flex-start",
		paddingInline: 0,
		textAlign: "start",
	},
	current: { color: color.text },
	row: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
		borderRadius: corner.control,
		color: color.text,
		columnGap: 12,
		display: "grid",
		fontSize: type.t3,
		height: "auto",
		lineHeight: type.tight,
		minHeight: 40,
		overflowWrap: "anywhere",
		paddingBlock: 4,
		paddingInline: 8,
		rowGap: 4,
		textAlign: "start",
		// Ghost keeps a word on one line; a row's cells wrap inside their columns instead of
		// spilling into the next one when the list is narrow.
		whiteSpace: "normal",
		width: "100%",
	},
	dot: { borderRadius: 999, boxSizing: "border-box", flexShrink: 0, height: 8, width: 8 },
	light: { backgroundColor: color.textFaint },
	soon: { backgroundColor: color.danger },
	heavy: { borderColor: color.warning, borderStyle: "solid", borderWidth: 1.5 },
})

export type ListHeadProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
	/** Column names as plain spans, and a `ListSort` for each column the list can be ordered by. */
	children: ReactNode
	sx?: stylex.StyleXStyles
}

export function ListHead({ children, sx, ...props }: ListHeadProps) {
	return (
		<div {...props} {...stylex.props(styles.head, sx)}>
			{children}
		</div>
	)
}

export type ListSortProps = Omit<GhostProps, "children"> & {
	children: string
	/** The list is ordered by this column: the name goes dark and an arrow follows it. */
	active?: boolean
}

/** A column name in a `ListHead` that orders the list by it. */
export function ListSort({ children, active = false, sx, ...props }: ListSortProps) {
	return (
		<Ghost {...props} sx={[styles.sort, active && styles.current, sx]}>
			{children}
			{active ? " ↓" : ""}
		</Ghost>
	)
}

export type ListRowProps = GhostProps

/** One row, one button: the cells are its children, laid on the grid its `sx` gives it. */
export function ListRow({ sx, ...props }: ListRowProps) {
	return <Ghost {...props} sx={[styles.row, sx]} />
}

export type WeightDotProps = {
	/** `light` goes ahead on its own if nobody answers (a grey dot); `heavy` waits (an orange ring). */
	weight: "light" | "heavy"
	/** A light one about to go ahead: the dot turns red. */
	soon?: boolean
	/** What the weight means, on hover. */
	title?: string
	sx?: stylex.StyleXStyles
}

/** The 8px mark in front of a question: how much it needs you. */
export function WeightDot({ weight, soon = false, title, sx }: WeightDotProps) {
	const look = weight === "heavy" ? styles.heavy : soon ? styles.soon : styles.light
	return <span {...(title ? { title } : {})} {...stylex.props(styles.dot, look, sx)} />
}
