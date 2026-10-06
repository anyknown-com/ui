import * as stylex from "@stylexjs/stylex"
import { color, corner, font, motion, space, tone, type } from "../../tokens.stylex"
import { Chevron } from "../icon/Chevron"
import type { ReactNode } from "react"
import { icon } from "../icon/icon"

/**
 * `.group` / `.item` / `.row`: a grouped list. An optional muted header above, the lines on one
 * sunken `surface` region of the sheet with hairlines between them, an optional muted footer below. The lines are cells
 * (`GroupCell`, `InputCell`, `TextCell`, `SliderCell`) or, for a thing with its name, its state
 * and its one action on the right, an `Item` holding a `Row`, whose detail unfolds under it in an
 * `Expand`, never over the screen.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	group: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: 6,
		lineHeight: type.body,
	},
	header: { color: color.textMuted, fontSize: type.t2, paddingInline: 16 },
	cells: { backgroundColor: color.surface, borderRadius: corner.card, overflow: "hidden" },
	footer: { color: color.textMuted, fontSize: type.t2, lineHeight: type.snug, paddingInline: 16 },
	item: {
		boxShadow: { default: "none", ":not(:first-child)": `inset 0 1px 0 ${color.border}` },
		fontSize: type.t2,
		overflow: "hidden",
	},
	go: { backgroundColor: { default: "transparent", ":hover": color.layer4 } },
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
		borderRadius: corner.small,
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
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
		padding: 0,
		textAlign: "start",
	},
	still: { cursor: "default" },
	mark: {
		alignItems: "center",
		borderRadius: corner.small,
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
	markTint: (tint: string) => ({ backgroundColor: `color-mix(in srgb, ${tint}, ${color.surface})` }),
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
		display: "flex",
		fontSize: type.t2,
		gap: 6,
		lineHeight: type.tight,
		minWidth: 0,
	},
	statusText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	warning: { color: color.warning },
	danger: { color: color.danger },
	dot: { borderRadius: "50%", boxSizing: "border-box", flex: "none", height: 7, width: 7 },
	filled: { backgroundColor: "currentColor" },
	hollow: { borderColor: "currentColor", borderStyle: "solid", borderWidth: 1.5 },
	dashed: { borderColor: "currentColor", borderStyle: "dashed", borderWidth: 1.5 },
	dotMuted: { color: color.textMuted },
	dotSuccess: { color: color.success },
	dotWarning: { color: color.warning },
	dotDanger: { color: color.danger },
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
	faint: { color: color.textMuted },
	err: { color: color.danger },
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

export type GroupProps = {
	/** A muted line above the card that names what the group is about. */
	header?: ReactNode
	/** A muted sentence under the card that says what the settings in it do. */
	footer?: ReactNode
	children: ReactNode
	sx?: stylex.StyleXStyles
}

export function Group({ header, footer, children, sx }: GroupProps) {
	return (
		<div {...stylex.props(styles.group, sx)}>
			{header !== undefined && <div {...stylex.props(styles.header)}>{header}</div>}
			<div {...stylex.props(styles.cells)}>{children}</div>
			{footer !== undefined && <div {...stylex.props(styles.footer)}>{footer}</div>}
		</div>
	)
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

export type StatusTone = "muted" | "success" | "warning" | "danger"

const DOT_TONE = {
	muted: styles.dotMuted,
	success: styles.dotSuccess,
	warning: styles.dotWarning,
	danger: styles.dotDanger,
} as const

export type StatusProps = {
	children: ReactNode
	/** `filled` settled, `hollow` waiting on someone, `dashed` gone stale. No dot without it. */
	dot?: "filled" | "hollow" | "dashed"
	/**
	 * The dot's colour. `warning` and `danger` colour the words too; a calm state reads muted.
	 * @default "muted"
	 */
	tone?: StatusTone
	/** Shorthand for `tone="warning"` with a filled dot. */
	warn?: boolean
	sx?: stylex.StyleXStyles
}

/** A state in words after a dot: the state after a row's name, or a list's status column. */
export function Status(props: StatusProps) {
	const { children, dot, warn = false, sx } = props
	const shape = dot ?? (warn ? "filled" : undefined)
	const hue = props.tone ?? (warn ? "warning" : "muted")
	return (
		<span
			{...stylex.props(
				styles.status,
				hue === "warning" && styles.warning,
				hue === "danger" && styles.danger,
				sx,
			)}
		>
			{shape !== undefined && (
				<span {...stylex.props(styles.dot, DOT_TONE[hue], styles[shape])} aria-hidden="true" />
			)}
			<span
				{...(typeof children === "string" ? { title: children } : {})}
				{...stylex.props(styles.statusText)}
			>
				{children}
			</span>
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
			<span {...(typeof name === "string" ? { title: name } : {})} {...stylex.props(styles.name)}>
				{name}
			</span>
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
