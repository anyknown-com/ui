import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"

/**
 * The words around the rows: the page's one line (`.page-h`), the label a section wears
 * (`.slab`), the sentence under a group (`.sub` / `.foot-note`), a code block, a stat line.
 */

const styles = stylex.create({
	head: {
		alignItems: "baseline",
		color: color.text,
		display: "flex",
		flexWrap: "wrap",
		gap: space.sm,
		lineHeight: type.body,
		marginBlock: `0 ${space.xs}`,
	},
	h1: { fontSize: type.t4, fontWeight: 600, lineHeight: type.tight, margin: 0 },
	sp: { flex: 1 },
	summary: { color: color.textMuted, fontSize: type.t2, minWidth: 0 },
	b: { color: color.text, fontFamily: font.mono, fontWeight: 400 },
	slab: {
		alignItems: "center",
		color: color.textMuted,
		display: "flex",
		fontFamily: font.mono,
		fontSize: type.t1,
		gap: space.xs,
		lineHeight: type.body,
		marginBlock: `${space.lg} ${space.xs}`,
	},
	slabFirst: { marginBlockStart: space.md },
	n: { marginInlineStart: "auto" },
	sub: {
		color: color.textMuted,
		fontSize: type.t2,
		lineHeight: type.body,
		marginBlock: `${space.sm} 0`,
	},
	foot: {
		color: color.textMuted,
		fontSize: type.t2,
		lineHeight: type.body,
		marginBlock: `${space.xs} 0`,
	},
	hint: {
		color: color.textMuted,
		fontSize: type.t2,
		lineHeight: type.body,
		marginBlock: `0 ${space.xs}`,
	},
	code: {
		backgroundColor: color.layer3,
		borderRadius: corner.small,
		color: color.textMuted,
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: 1.6,
		margin: 0,
		maxWidth: "44rem",
		overflowWrap: "break-word",
		paddingBlock: space.xs,
		paddingInline: space.sm,
		whiteSpace: "pre-wrap",
		wordBreak: "break-word",
	},
	panel: {
		backgroundColor: color.surface,
		borderRadius: corner.card,
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
	},
	padded: { display: "flex", flexDirection: "column", gap: space.xs, padding: space.sm },
	stat: {
		alignItems: "center",
		color: color.textMuted,
		display: "flex",
		flexWrap: "wrap",
		fontSize: type.t2,
		gap: space.xs,
		lineHeight: type.body,
	},
	sbar: {
		backgroundColor: color.layer4,
		borderRadius: corner.pill,
		flex: "none",
		height: 4,
		overflow: "hidden",
		width: "8rem",
	},
	sfill: (percent: number) => ({
		backgroundColor: color.accent,
		display: "block",
		height: "100%",
		width: `${percent}%`,
	}),
	bars: { alignItems: "flex-end", display: "flex", gap: 2, height: "6rem" },
	bar: {
		backgroundColor: {
			default: `color-mix(in srgb, ${color.accent} 60%, transparent)`,
			":hover": color.accent,
		},
		borderRadius: "2px 2px 0 0",
		flex: 1,
		minWidth: 0,
		position: "relative",
	},
	barH: (percent: number) => ({ height: `${percent}%` }),
	bx: {
		color: color.textMuted,
		display: "flex",
		fontFamily: font.mono,
		fontSize: type.t1,
		justifyContent: "space-between",
		marginBlockStart: space.xxs,
	},
	faint: { color: color.textMuted },
})

type Sx = {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

export type PageHeadProps = {
	/** The page's name, rendered as its `<h1>`. */
	title: ReactNode
	/** The summary beside the title, before the spacer: `已連接 3 · 工具 49`. */
	lead?: ReactNode
	/** The summary on the right, after the spacer: `已設定 3 / 8`, a stat line. */
	summary?: ReactNode
	/** Buttons at the end of the line. */
	actions?: ReactNode
} & Sx

/** The page's one heading line: the title, a summary beside it, another summary and actions on the right. */
export function PageHead({ title, lead, summary, actions, sx }: PageHeadProps) {
	return (
		<div {...stylex.props(styles.head, sx)}>
			<h1 {...stylex.props(styles.h1)}>{title}</h1>
			{lead !== undefined && <span {...stylex.props(styles.summary)}>{lead}</span>}
			<span {...stylex.props(styles.sp)} />
			{summary !== undefined && <span {...stylex.props(styles.summary)}>{summary}</span>}
			{actions}
		</div>
	)
}

export type PageNumberProps = {
	/** The number. */
	children: ReactNode
}

/** A number inside a summary or a stat line: mono, in the text colour. */
export function PageNumber({ children }: PageNumberProps) {
	return <b {...stylex.props(styles.b)}>{children}</b>
}

/** @deprecated Use `PageNumber`; the generic name will be removed in a future major. */
export const B = PageNumber

export type SectionLabelProps = {
	/** The section's name. */
	children: ReactNode
	/** Something pushed to the end of the line, such as a count. */
	end?: ReactNode
	/** Less space above, for the first section on the page. @default false */
	first?: boolean
} & Sx

/** The small mono label above a section of the page. */
export function SectionLabel({ children, end, first = false, sx }: SectionLabelProps) {
	return (
		<div {...stylex.props(styles.slab, first && styles.slabFirst, sx)}>
			{children}
			{end !== undefined && <span {...stylex.props(styles.n)}>{end}</span>}
		</div>
	)
}

export type PageSubProps = {
	/** The sentence. */
	children: ReactNode
} & Sx

/** A muted sentence under a group or section, with space above it. */
export function PageSub({ children, sx }: PageSubProps) {
	return <p {...stylex.props(styles.sub, sx)}>{children}</p>
}

/** @deprecated Use `PageSub`; the generic name will be removed in a future major. */
export const Sub = PageSub

export type FootNoteProps = {
	/** The note. */
	children: ReactNode
} & Sx

/** A muted note at the foot of a section, close under what it is about. */
export function FootNote({ children, sx }: FootNoteProps) {
	return <p {...stylex.props(styles.foot, sx)}>{children}</p>
}

export type HintProps = {
	/** The hint. */
	children: ReactNode
} & Sx

/** A muted sentence above what it explains. */
export function Hint({ children, sx }: HintProps) {
	return <p {...stylex.props(styles.hint, sx)}>{children}</p>
}

export type SnippetProps = {
	/** The code or config text, shown as written. */
	children: ReactNode
} & Sx

/** A small block of mono text, such as a command or config, that wraps instead of scrolling. */
export function Snippet({ children, sx }: SnippetProps) {
	return <pre {...stylex.props(styles.code, sx)}>{children}</pre>
}

export type PanelProps = {
	/** The rows or prose on the panel. */
	children: ReactNode
	/** Adds padding and a gap between children, for prose. @default false */
	padded?: boolean
} & Sx

/** `.dpanel`: the sunken surface a section's rows sit on, no ring; `padded` when it holds prose. */
export function Panel({ children, padded = false, sx }: PanelProps) {
	return <div {...stylex.props(styles.panel, padded && styles.padded, sx)}>{children}</div>
}

export type StatLineProps = {
	/** The readings, side by side; use `PageNumber` for the numbers. */
	children: ReactNode
} & Sx

/** A muted line of readings that wraps, such as counts and a `StatBar`. */
export function StatLine({ children, sx }: StatLineProps) {
	return <span {...stylex.props(styles.stat, sx)}>{children}</span>
}

export type StatBarProps = {
	/** How full the bar is, from 0 to 100; values outside are clamped. */
	percent: number
	/** The bar's accessible name. */
	label?: string
	/** What a screen reader says for the value, in place of the percentage. */
	text?: string
}

/** A thin 8rem bar that shows a percentage, read out as a progress bar. */
export function StatBar({ percent, label, text }: StatBarProps) {
	const value = Math.max(0, Math.min(100, percent))

	return (
		<span
			{...stylex.props(styles.sbar)}
			// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a 4px reading, not a control
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(value)}
			{...(label ? { "aria-label": label } : {})}
			{...(text ? { "aria-valuetext": text } : {})}
		>
			<i {...stylex.props(styles.sfill(value))} />
		</span>
	)
}

const strings = defineStrings({
	"zh-TW": { range: (from: string, to: string) => `${from} 到 ${to}` },
	en: { range: (from: string, to: string) => `${from} to ${to}` },
})

/** Bars' built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type PageLabels = StringsOf<typeof strings>

export type BarsProps = {
	/** One value a day, oldest first; bars are scaled to the largest. */
	values: number[]
	/** What a bar says when the pointer is on it (and to a screen reader). */
	tip: (value: number, index: number) => string
	/** The first day's name, under the first bar. */
	from: string
	/** The last day's name, under the last bar. */
	to: string
	/** Override built-in words for this chart; the rest follow `<LocaleProvider>`. */
	labels?: Partial<PageLabels>
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** `.bars` + `.bx`: one bar a day, the first and last day named under them. */
export function Bars({ values, tip, from, to, labels, sx }: BarsProps) {
	const t = useStrings(strings, labels)
	const max = Math.max(1, ...values)

	return (
		<div {...stylex.props(sx)}>
			<div role="group" aria-label={t.range(from, to)} {...stylex.props(styles.bars)}>
				{values.map((value, index) => (
					<i
						// oxlint-disable-next-line react/no-array-index-key -- one bar a day, in order
						key={index}
						title={tip(value, index)}
						{...stylex.props(styles.bar, styles.barH(Math.round((value / max) * 100)))}
					/>
				))}
			</div>
			<div {...stylex.props(styles.bx)}>
				<span>{from}</span>
				<span>{to}</span>
			</div>
		</div>
	)
}

export type FaintProps = {
	/** The words to mute. */
	children: ReactNode
} & Sx

/** Inline text in the muted colour. */
export function Faint({ children, sx }: FaintProps) {
	return <span {...stylex.props(styles.faint, sx)}>{children}</span>
}
