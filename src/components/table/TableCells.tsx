import * as stylex from "@stylexjs/stylex"
import {
	breakpoint,
	color,
	corner,
	focusRing,
	font,
	ink,
	motion,
	space,
	tone,
	type,
} from "../../tokens.stylex"
import { Chevron } from "../icon/Chevron"
import type { ReactNode } from "react"
import { icon } from "../icon/icon"

/** The cells a `Tr` is made of; each says where it lands once the row wraps on a phone. */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	cell: { minWidth: 0 },
	mono: {
		fontFamily: font.mono,
		fontSize: type.t2,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	num: {
		fontFamily: font.mono,
		textAlign: { default: "end", [breakpoint.phone]: "start" },
		whiteSpace: "nowrap",
	},
	faint: { color: color.textMuted, fontFamily: font.mono, fontSize: type.t1, whiteSpace: "nowrap" },
	status: {
		alignItems: "center",
		color: color.textMuted,
		display: "inline-flex",
		fontFamily: font.mono,
		gap: space.xs,
	},
	warn: { color: color.warning },
	dot: { backgroundColor: color.warning, borderRadius: "50%", flex: "none", height: 6, width: 6 },
	order: (order: number) => ({ order: { default: 0, [breakpoint.phone]: order } }),
	prefixed: { "::before": { content: { default: "none", [breakpoint.phone]: '"· "' } } },
	pushed: { marginInlineStart: { default: 0, [breakpoint.phone]: "auto" } },
	grow: { flex: { default: "none", [breakpoint.phone]: "1 1 auto" } },
	brk: { display: { default: "none", [breakpoint.phone]: "block" }, flex: "0 0 100%", height: 0 },
	hidden: { display: { default: "block", [breakpoint.phone]: "none" } },
	toggle: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": ink.n8 },
		borderRadius: corner.small,
		borderStyle: "none",
		borderWidth: 0,
		color: { default: tone.faint, ":hover": color.text },
		cursor: "pointer",
		display: "inline-grid",
		height: 24,
		justifySelf: "end",
		margin: 0,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		padding: 0,
		placeItems: "center",
		width: 24,
	},
	toggleIcon: {
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionProperty: "rotate",
		transitionTimingFunction: motion.easeOut,
	},
	turned: { rotate: "180deg" },
	subject: {
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
		borderRadius: corner.small,
		borderStyle: "none",
		borderWidth: 0,
		color: color.text,
		cursor: "pointer",
		fontFamily: font.mono,
		fontSize: type.t2,
		justifySelf: "start",
		lineHeight: "inherit",
		margin: 0,
		marginInlineStart: -4,
		maxWidth: "100%",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		overflow: "hidden",
		paddingBlock: 0,
		paddingInline: 4,
		textAlign: "start",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
})

type Sx = {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

export type TableCellProps = {
	/** The cell's content. */
	children?: ReactNode
	/** Mono and truncated, with the full text on hover when it is a string: for ids and keys. */
	mono?: boolean
	/** A number: mono, on one line, aligned to the end of the column (to the start on a phone). */
	num?: boolean
	/** Small, muted and mono, for a secondary reading such as a time. */
	faint?: boolean
	/** Where the cell lands once the row wraps on a phone. */
	order?: number
	/** On a phone the cell opens with `· `, the way the prototype joins the second line. */
	prefixed?: boolean
	/** On a phone the cell goes to the end of its line. */
	pushed?: boolean
	/** On a phone the cell takes the room left on its line. */
	grow?: boolean
	/** Not drawn on a phone. */
	hidden?: boolean
} & Sx

/** @deprecated Use `TableCellProps`. */
export type CellProps = TableCellProps

/** One cell of a `Tr`, with options for mono ids, numbers, and where it lands when the row wraps on a phone. */
export function TableCell({
	children,
	mono,
	num,
	faint,
	order,
	prefixed,
	pushed,
	grow,
	hidden,
	sx,
}: TableCellProps) {
	return (
		<span
			{...(mono === true && typeof children === "string" ? { title: children } : {})}
			{...stylex.props(
				styles.cell,
				mono === true && styles.mono,
				num === true && styles.num,
				faint === true && styles.faint,
				order !== undefined && styles.order(order),
				prefixed === true && styles.prefixed,
				pushed === true && styles.pushed,
				grow === true && styles.grow,
				hidden === true && styles.hidden,
				sx,
			)}
		>
			{children}
		</span>
	)
}

/** @deprecated Use `TableCell`; the generic name will be removed in a future major. */
export const Cell = TableCell

export type StatusCellProps = {
	/** The state, usually a mono code; leave it empty when all is fine. */
	children?: ReactNode
	/** Draws the state in the warning colour with a dot before it. @default false */
	warn?: boolean
	/** Where the cell lands once the row wraps on a phone. */
	order?: number
	/** On a phone the cell goes to the end of its line. */
	pushed?: boolean
} & Sx

/** The state column: nothing when fine, a warning dot and a mono code when not. */
export function StatusCell({ children, warn = false, order, pushed, sx }: StatusCellProps) {
	return (
		<span
			{...stylex.props(
				styles.status,
				warn && styles.warn,
				order !== undefined && styles.order(order),
				pushed === true && styles.pushed,
				sx,
			)}
		>
			{warn && <span {...stylex.props(styles.dot)} aria-hidden="true" />}
			{children}
		</span>
	)
}

export type BreakProps = {
	/** Where the break lands among the cells once the row wraps on a phone. */
	order?: number
}

/** The line break a phone row wraps at; nothing on a desk. */
export function Break({ order }: BreakProps) {
	return <span aria-hidden="true" {...stylex.props(styles.brk, order !== undefined && styles.order(order))} />
}

export type ToggleProps = {
	/** Whether the row's `Detail` is open; the chevron turns and `aria-expanded` follows. */
	open: boolean
	/** Called with the next state (`!open`) when pressed. */
	onOpenChange?: (open: boolean) => void
	/** Called when pressed; use it or `onOpenChange`. */
	onPress?: () => void
	/** The button's accessible name ("Show details for …"). */
	label: string
	/** The `id` of the `Detail` it opens, for `aria-controls`. */
	controls?: string
	/** Where it lands once the row wraps on a phone. */
	order?: number
} & Sx

/** `.rowtog`: the chevron at the end of a row that has a detail under it. */
export function Toggle({ open, onOpenChange, onPress, label, controls, order, sx }: ToggleProps) {
	return (
		<button
			type="button"
			aria-expanded={open}
			aria-label={label}
			{...(controls ? { "aria-controls": controls } : {})}
			onClick={() => {
				onOpenChange?.(!open)
				onPress?.()
			}}
			{...stylex.props(styles.toggle, order !== undefined && styles.order(order), sx)}
		>
			<Chevron
				direction="down"
				{...stylex.props(icon.sm, styles.toggleIcon, open && styles.turned)}
				aria-hidden="true"
			/>
		</button>
	)
}

export type SubjectProps = {
	/** The identifier, in mono; truncates. */
	children: ReactNode
	/** Called when pressed, to filter by this identifier. */
	onPress: () => void
	/** The full text shown on hover; defaults to `children` when it is a string. */
	title?: string
	/** Where the cell lands once the row wraps on a phone. */
	order?: number
	/** On a phone the cell takes the room left on its line. */
	grow?: boolean
} & Sx

/** `.subj`: a mono identifier that is also the way to filter by it. */
export function Subject({ children, onPress, title, order, grow, sx }: SubjectProps) {
	// 名字被切掉時,hover 要看得到全名
	const full = title ?? (typeof children === "string" ? children : undefined)
	return (
		<button
			type="button"
			onClick={onPress}
			{...(full ? { title: full } : {})}
			{...stylex.props(
				styles.subject,
				order !== undefined && styles.order(order),
				grow === true && styles.grow,
				sx,
			)}
		>
			{children}
		</button>
	)
}
