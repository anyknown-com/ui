import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { useControllableState } from "../../lib/useControllableState"
import { color, font, motion, space, type } from "../../tokens.stylex"
import { Ghost } from "../ghost/Ghost"
import { Chevron } from "../icon/Chevron"
import { ICON_STROKE, icon } from "../icon/icon"
import { PayloadBlock } from "../payload-block/PayloadBlock"

/**
 * A run of tool calls in a thread: one muted line that says how many calls and which tools
 * (「用了 3 次工具：read ×2、shell」) or a `title`, with the chevron after the words, and a list
 * indented one step (16px) with no frame and no rules. Each row is a ✓ (or a red ✕), the
 * summary in Geist Mono and a muted duration at the end. A row opens to the call's input and output.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	root: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t2,
		gap: space.xxs,
		lineHeight: type.snug,
	},
	head: {
		alignItems: "center",
		alignSelf: "flex-start",
		backgroundColor: "transparent",
		color: { default: color.textMuted, ":hover": color.text },
		display: "inline-flex",
		fontSize: type.t2,
		gap: space.xxs,
		maxWidth: "100%",
		minHeight: 28,
		paddingInline: 0,
	},
	chevron: {
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "transform",
		transitionTimingFunction: motion.easeOut,
	},
	opened: { transform: "rotate(90deg)" },
	clip: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	list: {
		display: "flex",
		flexDirection: "column",
		gap: space.xxs,
		listStyle: "none",
		margin: 0,
		padding: 0,
		paddingInlineStart: space.md,
	},
	item: {
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.snug,
	},
	row: {
		alignItems: "baseline",
		backgroundColor: "transparent",
		color: color.text,
		columnGap: 8,
		display: "grid",
		fontSize: type.t2,
		gridTemplateColumns: "14px minmax(0, 1fr) auto auto",
		height: "auto",
		justifyContent: "flex-start",
		minHeight: 28,
		paddingInline: 0,
		textAlign: "start",
		whiteSpace: "normal",
		width: "100%",
	},
	mark: { color: color.textMuted, fontSize: type.t1 },
	failedMark: { color: color.danger },
	summary: { fontFamily: font.mono, overflowWrap: "anywhere", textAlign: "start" },
	risk: {
		color: color.textMuted,
		fontSize: type.t1,
		whiteSpace: "nowrap",
	},
	time: {
		color: color.textMuted,
		fontSize: type.t1,
		fontVariantNumeric: "tabular-nums",
		gridColumn: 4,
		whiteSpace: "nowrap",
	},
	body: {
		display: "flex",
		flexDirection: "column",
		gap: space.xxs,
		paddingBlockEnd: space.xxs,
		paddingInlineStart: 22,
	},
	output: {
		color: color.textMuted,
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: type.snug,
		margin: 0,
		maxHeight: "9.6em",
		overflow: "auto",
		whiteSpace: "pre",
	},
})

const strings = defineStrings({
	"zh-TW": {
		title: (count: number, tools: readonly string[]) => `用了 ${count} 次工具：${tools.join("、")}`,
	},
	en: {
		title: (count: number, tools: readonly string[]) =>
			`Made ${count} tool ${count === 1 ? "call" : "calls"}: ${tools.join(", ")}`,
	},
})

/** The ToolGroup's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type ToolGroupLabels = StringsOf<typeof strings>

/** One tool call in a group. */
export type ToolGroupCall = {
	/** Stable key for the row. */
	id: string
	/** The tool's name, like `read` or `shell`. Counted in the header and shown as the row's tooltip. */
	tool: string
	/** One line that says what the call did, like a path or a command. Cut with `…` when it does not fit. */
	summary: string
	/** What the tool was called with. Shown open as `JSON.stringify(input, null, 2)`; left out, no block. */
	input?: unknown
	/** What the tool gave back, as plain text. Left out or empty, no output. */
	output?: string
	/** Risk words drawn after the summary, already in the reader's language (「花錢」「刪除」). */
	risk?: readonly string[]
	/** The call ended in failure: the mark is a red ✕ instead of ✓. */
	failed?: boolean
	/** How long it took, already formatted in the reader's language (「2.1 秒」). Drawn grey at the row's end. */
	duration?: string
}

export type ToolGroupProps = {
	/** The calls, in the order they ran. */
	calls: readonly ToolGroupCall[]
	/** Replaces the built-in "n tool calls" title. */
	title?: string
	/** Controlled: whether the list shows. */
	open?: boolean
	/** Uncontrolled: whether the list starts shown. @default true */
	defaultOpen?: boolean
	/** Called when the header is clicked, with the new open state. */
	onOpenChange?: (open: boolean) => void
	/** Draws an input coloured; passed to each row's PayloadBlock. */
	highlight?: (code: string) => ReactNode
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<ToolGroupLabels>
	sx?: stylex.StyleXStyles
}

/** Each tool once, in first-use order, with `×n` when it ran more than once. */
function toolNames(calls: readonly ToolGroupCall[]) {
	const counts = new Map<string, number>()
	for (const call of calls) counts.set(call.tool, (counts.get(call.tool) ?? 0) + 1)
	return [...counts].map(([name, n]) => (n > 1 ? `${name} ×${n}` : name))
}

export function ToolGroup({
	calls,
	title,
	open: openProp,
	defaultOpen = true,
	onOpenChange,
	highlight,
	labels,
	sx,
}: ToolGroupProps) {
	const t = useStrings(strings, labels)
	const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)

	return (
		<section {...stylex.props(styles.root, sx)}>
			<Ghost aria-expanded={open} onClick={() => setOpen(!open)} sx={styles.head}>
				<span {...stylex.props(styles.clip)}>{title ?? t.title(calls.length, toolNames(calls))}</span>
				<Chevron
					direction="right"
					{...stylex.props(icon.md, styles.chevron, open && styles.opened)}
					strokeWidth={ICON_STROKE}
				/>
			</Ghost>
			{open && (
				<ul {...stylex.props(styles.list)}>
					{calls.map((call) => (
						<ToolItem key={call.id} call={call} highlight={highlight} />
					))}
				</ul>
			)}
		</section>
	)
}

function ToolItem({ call, highlight }: { call: ToolGroupCall; highlight?: (code: string) => ReactNode }) {
	const [open, setOpen] = useState(false)
	const risk = call.risk ?? []

	return (
		<li {...stylex.props(styles.item)}>
			<Ghost aria-expanded={open} title={call.tool} onClick={() => setOpen(!open)} sx={styles.row}>
				<span {...stylex.props(styles.mark, call.failed && styles.failedMark)}>
					{call.failed ? "✕" : "✓"}
				</span>
				<span {...stylex.props(styles.summary)}>{call.summary}</span>
				{risk.length > 0 ? <span {...stylex.props(styles.risk)}>{risk.join(" · ")}</span> : <span />}
				{call.duration ? <span {...stylex.props(styles.time)}>{call.duration}</span> : null}
			</Ghost>
			{open && (
				<div {...stylex.props(styles.body)}>
					{call.input !== undefined && (
						<PayloadBlock code={JSON.stringify(call.input, null, 2)} highlight={highlight} />
					)}
					{call.output ? <pre {...stylex.props(styles.output)}>{call.output}</pre> : null}
				</div>
			)}
		</li>
	)
}
