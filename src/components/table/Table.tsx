import * as stylex from "@stylexjs/stylex"
import { breakpoint, color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"

/**
 * `.tbl`: a ledger, full width in its section and never in a card. The head is one line of small
 * muted sans labels on a sunken `surface` strip. Every row has `space.xs` above and below its
 * cells and a hairline under it; cells line up on their first line, so a chip or switch beside a
 * cell that wraps stays level with its first line. Identifiers and numbers are mono and numbers
 * sit on the right. On a phone the head goes and each row wraps to two lines, in the order the
 * caller gives each cell.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	table: {
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
		minWidth: 0,
	},
	cols: (columns: string) => ({ gridTemplateColumns: columns }),
	head: {
		alignItems: "center",
		backgroundColor: color.surface,
		borderRadius: corner.small,
		color: color.textMuted,
		display: { default: "grid", [breakpoint.phone]: "none" },
		fontFamily: font.body,
		fontSize: type.t1,
		fontWeight: 500,
		gap: space.sm,
		height: 28,
		lineHeight: type.tight,
		paddingInline: space.sm,
		// a `TableCell num` in the head keeps its end alignment but takes the head's sans
		"--ak-table-num-font": font.body,
	},
	sticky: { position: "sticky", top: 0, zIndex: 1 }, // literal-ok: local stacking, the head over its own rows
	row: {
		// first-line alignment: a chip or switch beside a cell that wraps stays on its first line
		alignItems: "start",
		boxShadow: { default: `inset 0 -1px 0 ${color.border}`, ":last-child": "none" },
		columnGap: { default: space.sm, [breakpoint.phone]: space.xs },
		display: { default: "grid", [breakpoint.phone]: "flex" },
		flexWrap: "wrap",
		fontSize: type.t2,
		lineHeight: { default: type.body, [breakpoint.phone]: "1.4" },
		minHeight: { default: null, [breakpoint.phone]: 52 },
		paddingBlock: space.xs,
		paddingInline: space.sm,
		rowGap: 0,
	},
	hover: { backgroundColor: { default: "transparent", ":hover": color.layer3 } },
	detail: {
		boxShadow: { default: `inset 0 -1px 0 ${color.border}`, ":last-child": "none" },
		paddingBlock: `0 ${space.xs}`,
		paddingInline: space.sm,
	},
	more: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
		borderStyle: "none",
		borderWidth: 0,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		display: "flex",
		fontFamily: "inherit",
		fontSize: type.t2,
		height: 40,
		justifyContent: "center",
		lineHeight: type.body,
		margin: 0,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
		padding: 0,
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "background-color, color",
		width: "100%",
	},
	scroll: {
		maxHeight: "calc(100dvh - var(--akn-off, 22rem))",
		minHeight: "12rem",
		overflow: "auto",
		overscrollBehavior: "contain",
		scrollbarColor: {
			default: "transparent transparent",
			":hover": `color-mix(in srgb, ${color.text} 24%, transparent) transparent`,
		},
		scrollbarWidth: "thin",
	},
})

type Sx = {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

export type TableProps = {
	/** A `TableHead` and the `Tr` rows under it. */
	children: ReactNode
} & Sx

/** A full-width ledger of rows: a muted sans head, padded rows with hairlines, numbers on the right. */
export function Table({ children, sx }: TableProps) {
	return <div {...stylex.props(styles.table, sx)}>{children}</div>
}

export type TableHeadProps = {
	/** The CSS grid template every row shares, such as `"1fr 6rem 4rem"`. */
	columns: string
	/** The column names, one element per column. */
	children: ReactNode
	/** Keeps the head at the top while the rows scroll under it. @default false */
	sticky?: boolean
} & Sx

/** @deprecated Use `TableHeadProps`. */
export type HeadProps = TableHeadProps

/** The line of muted labels above the rows; `columns` is the grid template every row shares. */
export function TableHead({ columns, children, sticky = false, sx }: TableHeadProps) {
	return (
		<div {...stylex.props(styles.head, styles.cols(columns), sticky && styles.sticky, sx)}>{children}</div>
	)
}

/** @deprecated Use `TableHead`; the generic name will be removed in a future major. */
export const Head = TableHead

export type TrProps = {
	/** The same CSS grid template as the `TableHead`. */
	columns: string
	/** The row's cells, one per column. */
	children: ReactNode
	/** Washes the row under the pointer. @default false */
	hover?: boolean
} & Sx

/** One row of a `Table`; on a phone it wraps to two lines. */
export function Tr({ columns, children, hover = false, sx }: TrProps) {
	return <div {...stylex.props(styles.row, styles.cols(columns), hover && styles.hover, sx)}>{children}</div>
}

export type DetailProps = {
	/** The element's id, for the `aria-controls` of the toggle that opens it. */
	id?: string
	/** What the row opens to show. */
	children: ReactNode
} & Sx

/** The opened detail under a `Tr`, with a hairline under it. */
export function Detail({ id, children, sx }: DetailProps) {
	return (
		<div {...(id ? { id } : {})} {...stylex.props(styles.detail, sx)}>
			{children}
		</div>
	)
}

export type MoreRowProps = {
	/** The button's words, such as "Show 20 more". */
	children: ReactNode
	/** Called when the row is pressed, to load or show more rows. */
	onPress: () => void
} & Sx

/** `.moreRow`: the last line of a ledger that has more, 40px, centred. */
export function MoreRow({ children, onPress, sx }: MoreRowProps) {
	return (
		<button type="button" onClick={onPress} {...stylex.props(styles.more, sx)}>
			{children}
		</button>
	)
}

/** Reads where the list starts and leaves 24px under it, again whenever the window changes. */
function fit(node: HTMLDivElement | null) {
	if (node === null) return

	const measure = () => {
		node.style.setProperty("--akn-off", `${Math.round(node.getBoundingClientRect().top + 24)}px`)
	}

	measure()
	window.addEventListener("resize", measure)

	return () => window.removeEventListener("resize", measure)
}

export type ListScrollProps = {
	/** The `Table` (with a sticky head) that scrolls. */
	children: ReactNode
} & Sx

/**
 * `.listscroll`: a ledger that scrolls on its own to the bottom of the window, the head stuck to
 * its top.
 */
export function ListScroll({ children, sx }: ListScrollProps) {
	return (
		<div ref={fit} {...stylex.props(styles.scroll, sx)}>
			{children}
		</div>
	)
}
