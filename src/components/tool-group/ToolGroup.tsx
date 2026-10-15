import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { Ghost } from "../ghost/Ghost"
import { Chevron } from "../icon/Chevron"
import { ICON_STROKE, icon } from "../icon/icon"
import { PayloadBlock } from "../payload-block/PayloadBlock"

/**
 * A run of tool calls in a thread: a header that says how many calls and which tools
 * (「用了 3 次工具：read ×2、shell」), and a framed list with one row per call. A row opens to
 * the call's input and output. The numbers are desktop's, copied from shell-ui's tool-group.
 */

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	root: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: space.xxs,
		lineHeight: type.snug,
	},
	head: {
		alignItems: "center",
		alignSelf: "flex-start",
		backgroundColor: "transparent",
		color: color.text,
		display: "inline-flex",
		fontSize: type.t3,
		gap: space.xxs,
		height: 28,
		maxWidth: "100%",
		paddingInline: space.xxs,
	},
	chevron: {
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionProperty: "transform",
		transitionTimingFunction: motion.easeOut,
	},
	closed: { transform: "rotate(-90deg)" },
	clip: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	list: {
		borderColor: color.border,
		borderRadius: corner.card,
		borderStyle: "solid",
		borderWidth: 1,
		listStyle: "none",
		margin: 0,
		overflow: "hidden",
		padding: 0,
	},
	item: {
		borderBlockStartColor: color.border,
		borderBlockStartStyle: { default: "solid", ":first-child": "none" },
		borderBlockStartWidth: 1,
		color: color.text,
		fontSize: type.t3,
		lineHeight: type.snug,
	},
	row: {
		alignItems: "center",
		backgroundColor: "transparent",
		borderRadius: 0,
		color: { default: color.textMuted, ":hover": color.text },
		display: "flex",
		fontSize: type.t3,
		gap: 6,
		height: "auto",
		justifyContent: "flex-start",
		minHeight: 44,
		// 列在有框、overflow hidden 的清單裡:焦點環往內畫,不然會被裁掉
		outlineOffset: -2,
		paddingBlock: 10,
		paddingInline: space.md,
		textAlign: "start",
		width: "100%",
	},
	risk: {
		color: color.textMuted,
		flexShrink: 0,
		fontSize: type.t3,
		lineHeight: type.snug,
		whiteSpace: "nowrap",
	},
	body: {
		display: "flex",
		flexDirection: "column",
		gap: space.sm,
		paddingBlockEnd: space.md,
		paddingInline: space.md,
	},
	output: {
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		margin: 0,
		paddingInline: space.xxs,
		whiteSpace: "pre-wrap",
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
}

export type ToolGroupProps = {
	/** The calls, in the order they ran. */
	calls: readonly ToolGroupCall[]
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
				<span {...stylex.props(styles.clip)}>{t.title(calls.length, toolNames(calls))}</span>
				<Chevron
					direction="down"
					{...stylex.props(icon.md, styles.chevron, !open && styles.closed)}
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
				<span {...stylex.props(styles.clip)}>{call.summary}</span>
				{risk.length > 0 && <span {...stylex.props(styles.risk)}>{risk.join(" · ")}</span>}
				<Chevron direction={open ? "down" : "right"} {...stylex.props(icon.md)} strokeWidth={ICON_STROKE} />
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
