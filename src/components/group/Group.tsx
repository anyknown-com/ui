import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, space, tone, type } from "../../tokens.stylex"
import { Chevron } from "../icon/Chevron"
import type { ReactNode } from "react"
import { icon } from "../icon/icon"

/**
 * `.group` / `.item` / `.row`: a bordered list where each line is a thing (a server, a key, a
 * rule) with its name, its state and its one action on the right. What a row opens unfolds under
 * it in an `Expand`, never over the screen.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	group: {
		backgroundColor: color.surface,
		borderRadius: corner.card,
		boxShadow: `inset 0 0 0 1px ${color.border}`,
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
	},
	item: {
		borderRadius: {
			default: 0,
			":first-child": `${corner.card} ${corner.card} 0 0`,
			":last-child": `0 0 ${corner.card} ${corner.card}`,
		},
		boxShadow: { default: "none", ":not(:first-child)": `inset 0 1px 0 ${color.border}` },
		overflow: "hidden",
	},
	go: { backgroundColor: { default: "transparent", ":hover": color.layer3 } },
	row: {
		alignItems: "center",
		columnGap: space.sm,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		minHeight: 40,
		paddingBlock: space.xs,
		paddingInline: space.sm,
	},
	rowgo: {
		alignItems: "center",
		backgroundColor: "transparent",
		borderRadius: corner.sm,
		borderStyle: "none",
		borderWidth: 0,
		color: "inherit",
		cursor: "pointer",
		display: "flex",
		flexWrap: "wrap",
		fontFamily: "inherit",
		fontSize: "inherit",
		gap: `0 ${space.xs}`,
		lineHeight: "inherit",
		margin: 0,
		minWidth: 0,
		outline: { default: "none", ":focus-visible": `2px solid ${color.accent}` },
		outlineOffset: 2,
		padding: 0,
		textAlign: "start",
	},
	still: { cursor: "default" },
	mark: {
		alignItems: "center",
		borderRadius: corner.sm,
		color: color.text,
		display: "grid",
		flex: "none",
		fontSize: type.t1,
		fontWeight: 600,
		height: 22,
		justifyItems: "center",
		placeItems: "center",
		width: 22,
	},
	markTint: (tint: string) => ({ backgroundColor: `color-mix(in srgb, ${tint}, ${color.layer3})` }),
	name: {
		flex: "none",
		fontSize: type.t2,
		fontWeight: 500,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	sep: { color: tone.faint, flex: "none", fontSize: type.t2 },
	status: {
		alignItems: "center",
		color: color.textMuted,
		display: "inline-flex",
		fontSize: type.t2,
		gap: space.xs,
		minWidth: 0,
	},
	statusText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	warn: { color: color.warning },
	dot: { backgroundColor: color.warning, borderRadius: "50%", flex: "none", height: 6, width: 6 },
	tag: { color: color.textMuted, flex: "none", fontFamily: font.mono, fontSize: type.t2 },
	act: { alignItems: "center", display: "flex", gap: space.xs },
	chevron: { color: tone.faint },
	expand: {
		display: "grid",
		gridTemplateRows: "0fr",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionProperty: "grid-template-rows",
		transitionTimingFunction: motion.easeOut,
	},
	shown: { gridTemplateRows: "1fr" },
	clip: { minHeight: 0, overflow: "hidden" },
	in: {
		alignItems: "flex-start",
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		paddingBlock: `0 ${space.sm}`,
		paddingInline: `calc(${space.sm} + 22px + ${space.xs}) ${space.sm}`,
	},
	plain: { paddingBlock: `${space.xs} ${space.sm}`, paddingInline: space.sm },
	text: { color: color.textMuted, fontSize: type.t2, lineHeight: type.body, margin: 0 },
	faint: { color: tone.faint },
	err: { color: color.warning },
	acts: { alignItems: "center", display: "flex", gap: space.xs },
	empty: {
		color: color.textMuted,
		fontSize: type.t2,
		lineHeight: type.body,
		margin: 0,
		padding: space.sm,
	},
})

type Sx = { sx?: stylex.StyleXStyles }

export function Group({ children, sx }: { children: ReactNode } & Sx) {
	return <div {...stylex.props(styles.group, sx)}>{children}</div>
}

export function Item({ children, go = false, sx }: { children: ReactNode; go?: boolean } & Sx) {
	return <div {...stylex.props(styles.item, go && styles.go, sx)}>{children}</div>
}

export type MarkProps = { letter: string; tint: string; sx?: stylex.StyleXStyles }

/** The 22px square with the first letter; `tint` is `<colour> <percent>%` for the mix. */
export function Mark({ letter, tint, sx }: MarkProps) {
	return (
		<div aria-hidden="true" {...stylex.props(styles.mark, styles.markTint(tint), sx)}>
			{letter}
		</div>
	)
}

export type StatusProps = { children: ReactNode; warn?: boolean; sx?: stylex.StyleXStyles }

export function Status({ children, warn = false, sx }: StatusProps) {
	return (
		<span {...stylex.props(styles.status, warn && styles.warn, sx)}>
			{warn && <span {...stylex.props(styles.dot)} aria-hidden="true" />}
			<span {...stylex.props(styles.statusText)}>{children}</span>
		</span>
	)
}

export function Sep() {
	return (
		<span {...stylex.props(styles.sep)} aria-hidden="true">
			·
		</span>
	)
}

export type RowProps = {
	mark?: ReactNode
	name: ReactNode
	/** What follows the name after a `·`: a `Status`, a mono value, a tag. */
	children?: ReactNode
	actions?: ReactNode
	/** The whole line is the way in; a chevron says so. */
	onPress?: () => void
	chevron?: boolean
	sx?: stylex.StyleXStyles
}

export function Row({ mark, name, children, actions, onPress, chevron = false, sx }: RowProps) {
	const inner = (
		<>
			{mark}
			<span {...stylex.props(styles.name)}>{name}</span>
			{children !== undefined && <Sep />}
			{children}
		</>
	)

	return (
		<div {...stylex.props(styles.row, sx)}>
			{onPress ? (
				<button type="button" onClick={onPress} {...stylex.props(styles.rowgo)}>
					{inner}
				</button>
			) : (
				<div {...stylex.props(styles.rowgo, styles.still)}>{inner}</div>
			)}
			<div {...stylex.props(styles.act)}>
				{actions}
				{chevron && (
					<Chevron direction="right" {...stylex.props(icon.sm, styles.chevron)} aria-hidden="true" />
				)}
			</div>
		</div>
	)
}

export type ExpandProps = {
	open: boolean
	/** `plain` drops the mark indent, for a form that is not under a row's mark. */
	plain?: boolean
	children: ReactNode
	sx?: stylex.StyleXStyles
}

/** `.exp`: what a row opens, unfolding under it in 200ms and taking no room when shut. */
export function Expand({ open, plain = false, children, sx }: ExpandProps) {
	return (
		<div {...(open ? {} : { inert: true })} {...stylex.props(styles.expand, open && styles.shown, sx)}>
			<div {...stylex.props(styles.clip)}>
				<div {...stylex.props(styles.in, plain && styles.plain)}>{open ? children : null}</div>
			</div>
		</div>
	)
}

export type NoteProps = {
	children: ReactNode
	faint?: boolean
	err?: boolean
	sx?: stylex.StyleXStyles
}

/** A sentence inside an `Expand`: what it means, or what went wrong. */
export function Note({ children, faint = false, err = false, sx }: NoteProps) {
	return (
		<p
			role={err ? "alert" : undefined}
			{...stylex.props(styles.text, faint && styles.faint, err && styles.err, sx)}
		>
			{children}
		</p>
	)
}

export function Acts({ children, sx }: { children: ReactNode } & Sx) {
	return <div {...stylex.props(styles.acts, sx)}>{children}</div>
}

/** `.empty`: nothing here yet, said inside the group in one muted line. */
export function Empty({ children, sx }: { children: ReactNode } & Sx) {
	return <p {...stylex.props(styles.empty, sx)}>{children}</p>
}

export function Tag({ children, sx }: { children: ReactNode } & Sx) {
	return <span {...stylex.props(styles.tag, sx)}>{children}</span>
}
