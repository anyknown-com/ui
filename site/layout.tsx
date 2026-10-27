// The one layout system for the site. Every page is a column of blocks one section gap apart:
// a page head, then sections. Every section opens with the same head (title, optional lead,
// optional link on the trailing edge). Grids are halves or thirds of one 12-column grid with
// one gutter, so items in a grid are all the same size and edges line up across sections.
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"

/** Reading measure for leads and prose: about 70 characters of body text. */
const MEASURE = "44rem"

const GUTTER = space.lg

const styles = stylex.create({
	page: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		alignContent: "start",
		rowGap: space.xxl,
	},
	head: { display: "grid", gap: space.sm, justifyItems: "start", maxWidth: MEASURE },
	crumb: {
		fontSize: type.t2,
		lineHeight: type.tight,
		color: { default: color.textMuted, ":hover": color.text },
		textUnderlineOffset: 2,
	},
	title: {
		fontFamily: font.display,
		fontSize: type.t6,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		margin: 0,
		textWrap: "balance",
		overflowWrap: "anywhere",
	},
	display: { fontSize: type.t7, letterSpacing: "-0.01em" },
	lead: {
		fontSize: type.t4,
		lineHeight: type.snug,
		color: color.textMuted,
		margin: 0,
		textWrap: "pretty",
	},
	section: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		alignContent: "start",
		rowGap: space.lg,
		minWidth: 0,
		scrollMarginTop: space.lg,
	},
	sectionHead: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "baseline",
		justifyContent: "space-between",
		columnGap: space.lg,
		rowGap: space.xs,
	},
	sectionTitles: { display: "grid", gap: space.xs, maxWidth: MEASURE },
	h2: {
		fontFamily: font.display,
		fontSize: type.t5,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		margin: 0,
		textWrap: "balance",
	},
	sectionLead: {
		fontSize: type.t3,
		lineHeight: type.body,
		color: color.textMuted,
		margin: 0,
		textWrap: "pretty",
	},
	link: { fontSize: type.t3, color: color.text, textUnderlineOffset: 2, whiteSpace: "nowrap" },
})

/**
 * Grids. `halves` and `thirds` are 6- and 4-column spans of the 12-column grid; each drops a
 * column only when a cell would get narrower than its minimum, and auto-fill keeps every cell
 * the same width even when the last row is short.
 */
export const grid = stylex.create({
	halves: {
		display: "grid",
		gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, max(20rem, calc((100% - ${GUTTER}) / 2))), 1fr))`,
		gap: GUTTER,
	},
	thirds: {
		display: "grid",
		gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, max(15rem, calc((100% - 2 * ${GUTTER}) / 3))), 1fr))`,
		gap: GUTTER,
	},
	// Halves that hold their split down to the phone breakpoint (the home hero).
	split: {
		display: "grid",
		gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [breakpoint.tablet]: "minmax(0, 1fr)" },
		gap: GUTTER,
	},
})

/** One item in a grid: media, then a title, then one line. Same spacing everywhere. */
export const item = stylex.create({
	root: { display: "grid", alignContent: "start", gap: space.sm, minWidth: 0 },
	text: { display: "grid", gap: space.xxs },
	title: {
		fontFamily: font.body,
		fontSize: type.t4,
		lineHeight: type.tight,
		fontWeight: 600,
		color: color.text,
		margin: 0,
	},
	// Underlined while the pointer is on the item's link (which carries `stylex.defaultMarker()`).
	hoverTitle: {
		textDecorationLine: { default: "none", [stylex.when.ancestor(":hover")]: "underline" },
		textUnderlineOffset: 2,
	},
	line: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0, textWrap: "pretty" },
})

export function Page({ children }: { children: ReactNode }) {
	return <article {...stylex.props(styles.page)}>{children}</article>
}

export function PageHead({
	crumb,
	title,
	lead,
	display,
	children,
}: {
	crumb?: { href: string; label: string }
	title: ReactNode
	lead?: ReactNode
	/** The home page's one display heading. */
	display?: boolean
	children?: ReactNode
}) {
	return (
		<header {...stylex.props(styles.head)}>
			{crumb != null && (
				<a href={crumb.href} {...stylex.props(styles.crumb)}>
					{crumb.label}
				</a>
			)}
			<h1 {...stylex.props(styles.title, display && styles.display)}>{title}</h1>
			{lead != null && <div {...stylex.props(styles.lead)}>{lead}</div>}
			{children}
		</header>
	)
}

export function Section({
	id,
	title,
	lead,
	link,
	children,
}: {
	id?: string
	title: string
	lead?: ReactNode
	link?: { href: string; label: string }
	children: ReactNode
}) {
	const headingId = `s-${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
	return (
		<section id={id} aria-labelledby={headingId} {...stylex.props(styles.section)}>
			<div {...stylex.props(styles.sectionHead)}>
				<div {...stylex.props(styles.sectionTitles)}>
					<h2 id={headingId} {...stylex.props(styles.h2)}>
						{title}
					</h2>
					{lead != null && <p {...stylex.props(styles.sectionLead)}>{lead}</p>}
				</div>
				{link != null && (
					<a href={link.href} {...stylex.props(styles.link)}>
						{link.label}
					</a>
				)}
			</div>
			{children}
		</section>
	)
}
