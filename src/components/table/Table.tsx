import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"

/**
 * `.tbl`: a ledger. The head is one mono line, every row is 34px, identifiers and numbers are
 * mono and numbers sit on the right. On a phone the head goes and each row wraps to two lines,
 * in the order the caller gives each cell.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const PHONE = "@media (max-width: 45rem)"

const styles = stylex.create({
	table: {
		backgroundColor: color.surface,
		borderRadius: corner.card,
		boxShadow: `inset 0 0 0 1px ${color.border}`,
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
		minWidth: 0,
	},
	cols: (columns: string) => ({ gridTemplateColumns: columns }),
	head: {
		alignItems: "center",
		borderRadius: `${corner.card} ${corner.card} 0 0`,
		color: color.textMuted,
		display: { default: "grid", [PHONE]: "none" },
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.sm,
		height: 28,
		paddingInline: space.sm,
	},
	sticky: { backgroundColor: color.surface, position: "sticky", top: 0, zIndex: 1 },
	row: {
		alignItems: "center",
		borderRadius: { default: 0, ":last-child": `0 0 ${corner.card} ${corner.card}` },
		boxShadow: `inset 0 1px 0 ${color.border}`,
		columnGap: { default: space.sm, [PHONE]: space.xs },
		display: { default: "grid", [PHONE]: "flex" },
		flexWrap: "wrap",
		fontSize: type.t2,
		height: { default: 34, [PHONE]: "auto" },
		lineHeight: { default: type.body, [PHONE]: "1.4" },
		minHeight: { default: 34, [PHONE]: 52 },
		paddingBlock: { default: 0, [PHONE]: space.xs },
		paddingInline: space.sm,
		rowGap: 0,
	},
	hover: { backgroundColor: { default: "transparent", ":hover": color.layer3 } },
	detail: {
		boxShadow: `inset 0 1px 0 ${color.border}`,
		paddingBlock: `0 ${space.xs}`,
		paddingInline: space.sm,
	},
	more: {
		alignItems: "center",
		backgroundColor: { default: "transparent", ":hover": color.layer3 },
		borderRadius: `0 0 ${corner.card} ${corner.card}`,
		borderStyle: "none",
		borderWidth: 0,
		boxShadow: `inset 0 1px 0 ${color.border}`,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		display: "flex",
		fontFamily: "inherit",
		fontSize: type.t2,
		height: 40,
		justifyContent: "center",
		lineHeight: type.body,
		margin: 0,
		outline: { default: "none", ":focus-visible": `2px solid ${color.accent}` },
		outlineOffset: -2,
		padding: 0,
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "background-color, color",
		width: "100%",
	},
	scroll: {
		borderRadius: corner.card,
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

type Sx = { sx?: stylex.StyleXStyles }

export type TableProps = { children: ReactNode } & Sx

export function Table({ children, sx }: TableProps) {
	return <div {...stylex.props(styles.table, sx)}>{children}</div>
}

export type HeadProps = { columns: string; children: ReactNode; sticky?: boolean } & Sx

/** The one mono line above the rows; `columns` is the grid template every row shares. */
export function Head({ columns, children, sticky = false, sx }: HeadProps) {
	return (
		<div {...stylex.props(styles.head, styles.cols(columns), sticky && styles.sticky, sx)}>{children}</div>
	)
}

export type TrProps = { columns: string; children: ReactNode; hover?: boolean } & Sx

export function Tr({ columns, children, hover = false, sx }: TrProps) {
	return <div {...stylex.props(styles.row, styles.cols(columns), hover && styles.hover, sx)}>{children}</div>
}

export function Detail({ id, children, sx }: { id?: string; children: ReactNode } & Sx) {
	return (
		<div {...(id ? { id } : {})} {...stylex.props(styles.detail, sx)}>
			{children}
		</div>
	)
}

/** `.moreRow`: the last line of a ledger that has more, 40px, centred. */
export function MoreRow({ children, onPress, sx }: { children: ReactNode; onPress: () => void } & Sx) {
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

/**
 * `.listscroll`: a ledger that scrolls on its own to the bottom of the window, the head stuck to
 * its top.
 */
export function ListScroll({ children, sx }: { children: ReactNode } & Sx) {
	return (
		<div ref={fit} {...stylex.props(styles.scroll, sx)}>
			{children}
		</div>
	)
}
