import * as stylex from "@stylexjs/stylex"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { Chevron } from "../icon/Chevron"
import { type ReactNode, createContext, useContext, useId, useMemo } from "react"
import { icon } from "../icon/icon"

/**
 * `.group` / `.item` / `.row`: a grouped list. An optional muted header above, the lines on one
 * page with only space between them, an optional muted footer below. The lines are cells
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
	header: { color: color.textMuted, fontSize: type.t2, paddingInline: space.sm },
	cells: { display: "flex", flexDirection: "column" },
	footer: { color: color.textMuted, fontSize: type.t2, lineHeight: type.snug, paddingInline: space.sm },
	item: {
		borderRadius: corner.shape,
		fontSize: type.t2,
		overflow: "hidden",
	},
	go: { backgroundColor: { default: "transparent", ":hover": color.wash } },
	row: {
		alignItems: "center",
		columnGap: space.sm,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		minHeight: 28,
		paddingBlock: space.xs,
		paddingInline: space.sm,
	},
	rowgo: {
		alignItems: "center",
		backgroundColor: "transparent",
		borderRadius: corner.shape,
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
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
		padding: 0,
		textAlign: "start",
	},
	still: { cursor: "default" },
	mark: {
		alignItems: "center",
		color: color.textMuted,
		display: "grid",
		flex: "none",
		fontSize: type.t1,
		fontWeight: 600,
		height: 22,
		justifyItems: "center",
		placeItems: "center",
		width: 22,
	},
	name: {
		flex: "none",
		fontSize: type.t2,
		fontWeight: 500,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	sep: { color: color.textMuted, flex: "none", fontSize: type.t2 },
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
	dot: {
		backgroundColor: "currentColor",
		borderRadius: corner.shape,
		flex: "none",
		height: 6,
		width: 6,
	},
	dotMuted: { color: color.textMuted },
	dotSuccess: { color: color.success },
	dotWarning: { color: color.warning },
	dotDanger: { color: color.danger },
	tag: { color: color.textMuted, flex: "none", fontFamily: font.mono, fontSize: type.t2 },
	act: { alignItems: "center", display: "flex", gap: space.xs },
	chevron: { color: color.textMuted },
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

type Sx = {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

export type GroupProps = {
	/** A muted line above the lines that names what the group is about. */
	header?: ReactNode
	/** A muted sentence under the lines that says what the settings in it do. */
	footer?: ReactNode
	/** The lines of the group: `GroupItem`s or cells. */
	children: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A grouped list: an optional header, the lines on the page with only space between them, an optional footer. */
export function Group({ header, footer, children, sx }: GroupProps) {
	return (
		<div {...stylex.props(styles.group, sx)}>
			{header !== undefined && <div {...stylex.props(styles.header)}>{header}</div>}
			<div {...stylex.props(styles.cells)}>{children}</div>
			{footer !== undefined && <div {...stylex.props(styles.footer)}>{footer}</div>}
		</div>
	)
}

type Disclosure = { open: boolean; setOpen: (open: boolean) => void; panelId: string }

const ItemContext = createContext<Disclosure | null>(null)

export type GroupItemProps = {
	/** A `GroupRow` and, under it, the `Expand` it opens. */
	children: ReactNode
	/** The whole item washes on hover, for a row that is a way in. */
	go?: boolean
	/** Whether the item's `Expand` is open, for a controlled item. Pair it with `onOpenChange`. */
	open?: boolean
	/** Whether the item's `Expand` starts open, for an uncontrolled item. @default false */
	defaultOpen?: boolean
	/** Called when a `GroupRow` with `expands` opens or shuts the item. */
	onOpenChange?: (open: boolean) => void
} & Sx

/**
 * One line of a `Group` with room under it: a `GroupRow`, and the `Expand` that row unfolds.
 * The item owns the open state; a row with `expands` toggles it and the `Expand` follows it.
 */
export function GroupItem({
	children,
	go = false,
	open,
	defaultOpen = false,
	onOpenChange,
	sx,
}: GroupItemProps) {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
	const panelId = useId()
	const disclosure = useMemo(() => ({ open: isOpen, setOpen, panelId }), [isOpen, setOpen, panelId])
	return (
		<div {...stylex.props(styles.item, go && styles.go, sx)}>
			<ItemContext value={disclosure}>{children}</ItemContext>
		</div>
	)
}

/** @deprecated Use `GroupItem`; the generic name will be removed in a future major. */
export const Item = GroupItem

export type MarkProps = {
	/** The letter, usually the first of the thing's name. */
	letter: string
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A 22px slot with a first letter in muted ink, no tile. */
export function Mark({ letter, sx }: MarkProps) {
	return (
		<div aria-hidden="true" {...stylex.props(styles.mark, sx)}>
			{letter}
		</div>
	)
}

/** The colour of a `Status`: `muted`, `success`, `warning` or `danger`. */
export type StatusTone = "muted" | "success" | "warning" | "danger"

const DOT_TONE = {
	muted: styles.dotMuted,
	success: styles.dotSuccess,
	warning: styles.dotWarning,
	danger: styles.dotDanger,
} as const

export type StatusProps = {
	/** The state in words; truncates, with the full text on hover when it is a string. */
	children: ReactNode
	/**
	 * The 6px dot's colour. `warning` and `danger` colour the words too; a calm state reads muted.
	 * @default "muted"
	 */
	tone?: StatusTone
	/** Shorthand for `tone="warning"`. */
	warn?: boolean
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A state in words after a solid 6px dot: the state after a row's name, or a list's status column. */
export function Status(props: StatusProps) {
	const { children, warn = false, sx } = props
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
			<span {...stylex.props(styles.dot, DOT_TONE[hue])} aria-hidden="true" />
			<span
				{...(typeof children === "string" ? { title: children } : {})}
				{...stylex.props(styles.statusText)}
			>
				{children}
			</span>
		</span>
	)
}

/** The faint `·` between a row's name and its state, hidden from screen readers. */
export function Sep() {
	return (
		<span {...stylex.props(styles.sep)} aria-hidden="true">
			·
		</span>
	)
}

export type GroupRowProps = {
	/** What leads the line: a `Mark`, a tile. */
	mark?: ReactNode
	/** The thing's name; truncates, with the full name on hover when it is a string. */
	name: ReactNode
	/** What follows the name after a `·`: a `Status`, a mono value, a tag. */
	children?: ReactNode
	/** The row's own controls on the right (a `Ghost`, a `Switch`). */
	actions?: ReactNode
	/** The whole line is the way in; a chevron says so. */
	onPress?: () => void
	/**
	 * The whole line opens and shuts the `Expand` of the `GroupItem` it sits in, and says so
	 * with `aria-expanded`. Runs before `onPress` when both are given.
	 */
	expands?: boolean
	/** A right-pointing chevron at the end: the row leads somewhere. */
	chevron?: boolean
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** @deprecated Use `GroupRowProps`. */
export type RowProps = GroupRowProps

/** A thing's line in a `Group`: its mark, its name, its state after a `·`, its actions. */
export function GroupRow({
	mark,
	name,
	children,
	actions,
	onPress,
	expands = false,
	chevron = false,
	sx,
}: GroupRowProps) {
	const item = useContext(ItemContext)
	const toggles = expands && item != null
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
			{onPress || toggles ? (
				<button
					type="button"
					{...(toggles ? { "aria-expanded": item.open, "aria-controls": item.panelId } : {})}
					onClick={() => {
						if (toggles) item.setOpen(!item.open)
						onPress?.()
					}}
					{...stylex.props(styles.rowgo)}
				>
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

/** @deprecated Use `GroupRow`; the generic name will be removed in a future major. */
export const Row = GroupRow

export type ExpandProps = {
	/**
	 * Open or shut. Leave it out inside a `GroupItem` to follow the item's state (its `open` /
	 * `defaultOpen` / `onOpenChange`, toggled by a `GroupRow` with `expands`); outside one, an
	 * `Expand` without `open` stays shut.
	 */
	open?: boolean
	/** `plain` drops the mark indent, for a form that is not under a row's mark. */
	plain?: boolean
	/** What unfolds; not rendered while shut. */
	children: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** `.exp`: what a row opens, unfolding under it in 200ms and taking no room when shut. */
export function Expand({ open: ownOpen, plain = false, children, sx }: ExpandProps) {
	const item = useContext(ItemContext)
	const open = ownOpen ?? item?.open ?? false
	return (
		<div
			{...(item ? { id: item.panelId } : {})}
			{...(open ? {} : { inert: true })}
			{...stylex.props(styles.expand, open && styles.shown, sx)}
		>
			<div {...stylex.props(styles.clip)}>
				<div {...stylex.props(styles.in, plain && styles.plain)}>{open ? children : null}</div>
			</div>
		</div>
	)
}

export type NoteProps = {
	/** The sentence. */
	children: ReactNode
	/** Draws the sentence in the muted colour, for a side remark. @default false */
	faint?: boolean
	/** Draws the sentence in red and announces it, for what went wrong. @default false */
	err?: boolean
	/** StyleX styles merged after the component's own. */
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

export type ActsProps = {
	/** The buttons, side by side. */
	children: ReactNode
} & Sx

/** A row of actions inside an `Expand`, such as Save and Cancel. */
export function Acts({ children, sx }: ActsProps) {
	return <div {...stylex.props(styles.acts, sx)}>{children}</div>
}

export type EmptyProps = {
	/** The one line that says there is nothing here yet. */
	children: ReactNode
} & Sx

/** `.empty`: nothing here yet, said inside the group in one muted line. */
export function Empty({ children, sx }: EmptyProps) {
	return <p {...stylex.props(styles.empty, sx)}>{children}</p>
}

export type TagProps = {
	/** The tag's word. */
	children: ReactNode
} & Sx

/** A muted mono word after a row's name, such as a version or a kind. */
export function Tag({ children, sx }: TagProps) {
	return <span {...stylex.props(styles.tag, sx)}>{children}</span>
}
