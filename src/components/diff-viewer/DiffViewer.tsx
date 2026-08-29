import * as stylex from "@stylexjs/stylex"
import { Fragment, useId, useMemo, useState } from "react"
import { reset } from "../../lib/styled"
import { type DiffRow, buildDiffRows, collapseRows, countChanges, diffKind } from "../../lib/diff"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const unfold = stylex.keyframes({
	from: { opacity: 0, translate: "0 -3px" },
	to: { opacity: 1, translate: "0 0" },
})

const styles = stylex.create({
	diff: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		overflow: "hidden",
	},
	head: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontFamily: font.mono,
		fontSize: "0.8rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.text,
	},
	dot: { width: "0.5rem", height: "0.5rem", borderRadius: radius.full, flex: "none" },
	dotModified: { backgroundColor: color.warning },
	dotAdded: { backgroundColor: color.accent },
	dotDeleted: { backgroundColor: color.danger },
	stat: { marginInlineStart: "auto", fontSize: "0.72rem", color: color.textMuted },
	plus: { color: color.success, fontWeight: 600 },
	minus: { color: color.danger, fontWeight: 600 },
	body: { overflowX: "auto", outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` } },
	line: {
		display: "flex",
		fontFamily: font.mono,
		fontSize: text.code,
		lineHeight: 1.55,
		whiteSpace: "pre",
		minWidth: "max-content",
	},
	lineAdd: { backgroundColor: color.successSubtle },
	lineDel: { backgroundColor: color.dangerSubtle },
	number: {
		flex: "none",
		width: "2.6rem",
		textAlign: "end",
		paddingInlineEnd: space.xs,
		color: color.textFaint,
		userSelect: "none",
		fontSize: "11px",
		lineHeight: 1.85,
	},
	sign: { flex: "none", width: "1.1rem", textAlign: "center", userSelect: "none", color: color.textFaint },
	signAdd: { color: color.success },
	signDel: { color: color.danger },
	code: { paddingInlineEnd: space.md },
	mark: { backgroundColor: "transparent", color: "inherit", borderRadius: 2 },
	markAdd: { backgroundColor: color.successHl },
	markDel: { backgroundColor: color.dangerHl },
	fold: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		width: "100%",
		boxSizing: "border-box",
		cursor: "pointer",
		backgroundColor: { default: color.bg, ":hover": color.accentSubtle },
		borderBlockWidth: 1,
		borderBlockStyle: "solid",
		borderBlockColor: color.border,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		fontFamily: font.mono,
		fontSize: "0.74rem",
		lineHeight: 1,
		color: { default: color.textMuted, ":hover": color.text },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	chevron: {
		transitionProperty: "rotate",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	chevronOpen: { rotate: "90deg" },
	foldLines: {
		overflow: "hidden",
		animationName: { default: unfold, [REDUCED]: "none" },
		animationDuration: "160ms",
		animationTimingFunction: "ease-out",
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
})

const KIND_LABEL = { modified: "已修改", added: "新增檔案", deleted: "已刪除" } as const

const SIGN = { context: " ", add: "+", del: "−" } as const
const PREFIX = { context: "", add: "新增行 ", del: "刪除行 " } as const

function Line({ row }: { row: DiffRow }) {
	return (
		<div
			{...stylex.props(
				styles.line,
				row.type === "add" && styles.lineAdd,
				row.type === "del" && styles.lineDel,
			)}
		>
			<span aria-hidden="true" {...stylex.props(styles.number)}>
				{row.beforeNo ?? ""}
			</span>
			<span aria-hidden="true" {...stylex.props(styles.number)}>
				{row.afterNo ?? ""}
			</span>
			<span
				aria-hidden="true"
				{...stylex.props(
					styles.sign,
					row.type === "add" && styles.signAdd,
					row.type === "del" && styles.signDel,
				)}
			>
				{SIGN[row.type]}
			</span>
			<span {...stylex.props(styles.code)}>
				{PREFIX[row.type] !== "" && <span {...stylex.props(styles.srOnly)}>{PREFIX[row.type]}</span>}
				{row.segments.map((segment, index) =>
					segment.marked ? (
						<mark
							key={index}
							{...stylex.props(styles.mark, row.type === "add" ? styles.markAdd : styles.markDel)}
						>
							{segment.text}
						</mark>
					) : (
						<Fragment key={index}>{segment.text}</Fragment>
					),
				)}
			</span>
		</div>
	)
}

function Fold({ rows, label }: { rows: DiffRow[]; label: string }) {
	const id = useId()
	const [open, setOpen] = useState(false)
	return (
		<>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen((value) => !value)}
				{...stylex.props(reset.control, styles.fold)}
			>
				<svg
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden="true"
					{...stylex.props(styles.chevron, open && styles.chevronOpen)}
				>
					<path d="m9 6 6 6-6 6" />
				</svg>
				{label}
			</button>
			<div id={id} hidden={!open} {...stylex.props(open && styles.foldLines)}>
				{rows.map((row, index) => (
					<Line key={index} row={row} />
				))}
			</div>
		</>
	)
}

export type DiffFile = {
	path: string
	before?: string
	after?: string
	kind?: "modified" | "added" | "deleted"
}

export type DiffViewerProps = {
	file: DiffFile
	collapseContext?: number
	wordDiff?: boolean
	foldLabel?: (count: number) => string
}

export function DiffViewer({
	file,
	collapseContext = 3,
	wordDiff = true,
	foldLabel = (count) => `⋯ ${count} 行未變動`,
}: DiffViewerProps) {
	const kind = file.kind ?? diffKind(file.before, file.after)
	const { blocks, added, removed } = useMemo(() => {
		const rows = buildDiffRows(file.before ?? "", file.after ?? "", { wordDiff })
		return { blocks: collapseRows(rows, collapseContext), ...countChanges(rows) }
	}, [file.before, file.after, wordDiff, collapseContext])

	return (
		<div {...stylex.props(styles.diff)}>
			<div {...stylex.props(styles.head)}>
				<span
					aria-hidden="true"
					{...stylex.props(
						styles.dot,
						kind === "modified" && styles.dotModified,
						kind === "added" && styles.dotAdded,
						kind === "deleted" && styles.dotDeleted,
					)}
				/>
				<span {...stylex.props(styles.srOnly)}>{KIND_LABEL[kind]}</span>
				{file.path}
				<span {...stylex.props(styles.stat)}>
					<b {...stylex.props(styles.plus)}>{`+${added}`}</b>{" "}
					<b {...stylex.props(styles.minus)}>{`−${removed}`}</b>
				</span>
			</div>
			<div tabIndex={0} role="region" aria-label={`${file.path} 的變更`} {...stylex.props(styles.body)}>
				{blocks.map((block, index) =>
					block.kind === "fold" ? (
						<Fold key={`${file.path}-${index}`} rows={block.rows} label={foldLabel(block.rows.length)} />
					) : (
						block.rows.map((row, rowIndex) => <Line key={`${index}-${rowIndex}`} row={row} />)
					),
				)}
			</div>
		</div>
	)
}
