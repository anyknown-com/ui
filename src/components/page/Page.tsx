import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"

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

type Sx = { sx?: stylex.StyleXStyles }

export type PageHeadProps = {
	title: ReactNode
	/** The summary beside the title, before the spacer: `已連接 3 · 工具 49`. */
	lead?: ReactNode
	/** The summary on the right, after the spacer: `已設定 3 / 8`, a stat line. */
	summary?: ReactNode
	actions?: ReactNode
} & Sx

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

export type PageNumberProps = { children: ReactNode }

/** A number inside a summary or a stat line: mono, in the text colour. */
export function PageNumber({ children }: PageNumberProps) {
	return <b {...stylex.props(styles.b)}>{children}</b>
}

/** @deprecated Use `PageNumber`; the generic name will be removed in a future major. */
export const B = PageNumber

export type SectionLabelProps = { children: ReactNode; end?: ReactNode; first?: boolean } & Sx

export function SectionLabel({ children, end, first = false, sx }: SectionLabelProps) {
	return (
		<div {...stylex.props(styles.slab, first && styles.slabFirst, sx)}>
			{children}
			{end !== undefined && <span {...stylex.props(styles.n)}>{end}</span>}
		</div>
	)
}

export type PageSubProps = { children: ReactNode } & Sx

export function PageSub({ children, sx }: PageSubProps) {
	return <p {...stylex.props(styles.sub, sx)}>{children}</p>
}

/** @deprecated Use `PageSub`; the generic name will be removed in a future major. */
export const Sub = PageSub

export type FootNoteProps = { children: ReactNode } & Sx

export function FootNote({ children, sx }: FootNoteProps) {
	return <p {...stylex.props(styles.foot, sx)}>{children}</p>
}

export type HintProps = { children: ReactNode } & Sx

export function Hint({ children, sx }: HintProps) {
	return <p {...stylex.props(styles.hint, sx)}>{children}</p>
}

export type SnippetProps = { children: ReactNode } & Sx

export function Snippet({ children, sx }: SnippetProps) {
	return <pre {...stylex.props(styles.code, sx)}>{children}</pre>
}

export type PanelProps = { children: ReactNode; padded?: boolean } & Sx

/** `.dpanel`: the sunken surface a section's rows sit on, no ring; `padded` when it holds prose. */
export function Panel({ children, padded = false, sx }: PanelProps) {
	return <div {...stylex.props(styles.panel, padded && styles.padded, sx)}>{children}</div>
}

export type StatLineProps = { children: ReactNode } & Sx

export function StatLine({ children, sx }: StatLineProps) {
	return <span {...stylex.props(styles.stat, sx)}>{children}</span>
}

export type StatBarProps = { percent: number; label?: string; text?: string }

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

export type BarsProps = {
	values: number[]
	/** What a bar says when the pointer is on it. */
	tip: (value: number, index: number) => string
	from: string
	to: string
	sx?: stylex.StyleXStyles
}

/** `.bars` + `.bx`: one bar a day, the first and last day named under them. */
export function Bars({ values, tip, from, to, sx }: BarsProps) {
	const max = Math.max(1, ...values)

	return (
		<div {...stylex.props(sx)}>
			<div {...stylex.props(styles.bars)} aria-label={`${from} – ${to}`}>
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

export type FaintProps = { children: ReactNode } & Sx

export function Faint({ children, sx }: FaintProps) {
	return <span {...stylex.props(styles.faint, sx)}>{children}</span>
}
