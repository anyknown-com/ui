import * as stylex from "@stylexjs/stylex"
import { color, corner, font, ink, motion, space, tone, type } from "../../tokens.stylex"
import { Chevron } from "../icon/Chevron"
import type { ReactNode } from "react"
import { icon } from "../icon/icon"

/** The cells a `Tr` is made of; each says where it lands once the row wraps on a phone. */

const PHONE = "@media (max-width: 45rem)"
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
		textAlign: { default: "end", [PHONE]: "start" },
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
	order: (order: number) => ({ order: { default: 0, [PHONE]: order } }),
	prefixed: { "::before": { content: { default: "none", [PHONE]: '"· "' } } },
	pushed: { marginInlineStart: { default: 0, [PHONE]: "auto" } },
	grow: { flex: { default: "none", [PHONE]: "1 1 auto" } },
	brk: { display: { default: "none", [PHONE]: "block" }, flex: "0 0 100%", height: 0 },
	hidden: { display: { default: "block", [PHONE]: "none" } },
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
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
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
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		overflow: "hidden",
		paddingBlock: 0,
		paddingInline: 4,
		textAlign: "start",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
})

type Sx = { sx?: stylex.StyleXStyles }

export type CellProps = {
	children?: ReactNode
	mono?: boolean
	num?: boolean
	faint?: boolean
	/** Where the cell lands once the row wraps on a phone. */
	order?: number
	/** On a phone the cell opens with `· `, the way the prototype joins the second line. */
	prefixed?: boolean
	/** On a phone the cell goes to the end of its line. */
	pushed?: boolean
	grow?: boolean
	/** Not drawn on a phone. */
	hidden?: boolean
} & Sx

export function Cell({ children, mono, num, faint, order, prefixed, pushed, grow, hidden, sx }: CellProps) {
	return (
		<span
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

export type StatusCellProps = {
	children?: ReactNode
	warn?: boolean
	order?: number
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

/** The line break a phone row wraps at; nothing on a desk. */
export function Break({ order }: { order?: number }) {
	return <span aria-hidden="true" {...stylex.props(styles.brk, order !== undefined && styles.order(order))} />
}

export type ToggleProps = {
	open: boolean
	onPress: () => void
	label: string
	controls?: string
	order?: number
} & Sx

/** `.rowtog`: the chevron at the end of a row that has a detail under it. */
export function Toggle({ open, onPress, label, controls, order, sx }: ToggleProps) {
	return (
		<button
			type="button"
			aria-expanded={open}
			aria-label={label}
			{...(controls ? { "aria-controls": controls } : {})}
			onClick={onPress}
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
	children: ReactNode
	onPress: () => void
	title?: string
	order?: number
	grow?: boolean
} & Sx

/** `.subj`: a mono identifier that is also the way to filter by it. */
export function Subject({ children, onPress, title, order, grow, sx }: SubjectProps) {
	return (
		<button
			type="button"
			onClick={onPress}
			{...(title ? { title } : {})}
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
