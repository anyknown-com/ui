import * as stylex from "@stylexjs/stylex"
import { type ReactNode, createContext, use, useId, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { reset } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { useCopy } from "../../lib/useCopy"
import { formatDuration } from "../../lib/format"
import { color, corner, focusRing, font, ink, motion, shadow, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"

// 左邊的圖示底 36px;第二行以後的內容跟標題對齊 = 卡片左 padding + 圖示底 + 間距
const TILE = 36
const INDENT = `calc(${space.md} + ${TILE}px + ${space.sm})`
const SWEEP = 40

const spin = stylex.keyframes({ to: { rotate: "360deg" } })
const shimmer = stylex.keyframes({ to: { backgroundPosition: "-200% 0" } })
const sweep = stylex.keyframes({
	from: { transform: "translateX(-100%)" },
	to: { transform: `translateX(${(100 / SWEEP) * 100}%)` },
})

const styles = stylex.create({
	card: {
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.rest,
		borderRadius: corner.card,
		overflow: "hidden",
		// forced colors 下陰影消失,卡片要靠外框才看得出邊界;錯誤卡框加粗
		outline: { default: null, [FORCED]: "1px solid CanvasText" },
	},
	cardError: {
		boxShadow: `0 0 0 1px color-mix(in srgb, ${color.danger} 45%, ${color.border}), ${shadow.rest}`,
		outline: { default: null, [FORCED]: `${focusRing.width} solid CanvasText` },
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: space.sm,
		width: "100%",
		boxSizing: "border-box",
		paddingBlock: space.sm,
		paddingInline: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		color: color.text,
		textAlign: "start",
		cursor: "pointer",
		backgroundColor: { default: "transparent", ":hover": ink.n4 },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	tile: {
		display: "grid",
		placeItems: "center",
		flex: "none",
		width: TILE,
		height: TILE,
		borderRadius: corner.control,
		backgroundColor: color.surface,
		color: color.textMuted,
	},
	// 狀態本來就有三種不同的圖形(工具圖示 / 勾 / 叉)與文字;forced colors 再用框區分
	tileRunning: {
		backgroundColor: color.signalSubtle,
		color: color.signal,
		outline: { default: null, [FORCED]: "1px solid Highlight" },
	},
	tileOk: { color: color.success },
	tileBad: {
		backgroundColor: color.dangerSubtle,
		color: color.danger,
		outline: { default: null, [FORCED]: `${focusRing.width} solid CanvasText` },
	},
	glyph: { width: 18, height: 18, pointerEvents: "none" },
	main: { flex: 1, minWidth: 0, display: "grid", gap: 6 },
	line: { display: "flex", alignItems: "baseline", gap: space.xs, minWidth: 0 },
	title: { fontWeight: 500, flex: "none" },
	subtitle: {
		color: color.textMuted,
		fontFamily: font.mono,
		fontSize: type.t2,
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// 展開時路徑整段顯示,折行而不切掉
	subtitleOpen: { overflowWrap: "anywhere", whiteSpace: "normal" },
	track: {
		position: "relative",
		height: 6,
		borderRadius: corner.pill,
		backgroundColor: color.accentSubtle,
		overflow: "hidden",
		outline: { default: null, [FORCED]: "1px solid CanvasText" },
	},
	// forced colors 會把背景色清掉:進度條自己保留顏色,用 Highlight
	bar: {
		position: "absolute",
		insetBlock: 0,
		insetInlineStart: 0,
		width: `${SWEEP}%`,
		borderRadius: corner.pill,
		backgroundColor: { default: color.signal, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		animationName: { default: sweep, [REDUCED]: "none" },
		animationDuration: motion.loopSlow,
		animationTimingFunction: motion.linear,
		animationIterationCount: "infinite",
	},
	// 定量:寬度跟著 progress 走,不掃
	fill: {
		position: "absolute",
		insetBlock: 0,
		insetInlineStart: 0,
		borderRadius: corner.pill,
		backgroundColor: { default: color.signal, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		transitionProperty: "width",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	fillWidth: (percent: number) => ({ width: `${percent}%` }),
	time: {
		flex: "none",
		fontSize: type.t2,
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
	chevron: {
		width: 14,
		height: 14,
		color: color.textFaint,
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
	},
	chevronOpen: { rotate: "180deg" },
	spinner: {
		width: 11,
		height: 11,
		flex: "none",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: { default: color.borderStrong, [FORCED]: "GrayText" },
		borderTopColor: { default: color.warning, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		borderRadius: corner.pill,
		animationName: spin,
		animationDuration: { default: motion.loopFast, [REDUCED]: motion.loopSlow },
		animationTimingFunction: motion.linear,
		animationIterationCount: "infinite",
	},
	// 展開內容、io 標籤與重試列都從標題那條邊開始(INDENT),跟 subagent 的第二行同一條線
	detail: {
		paddingBlockEnd: space.sm,
		paddingInlineStart: INDENT,
		paddingInlineEnd: space.md,
		display: { default: "grid", ":is([hidden])": "none" },
		gap: space.xxs,
	},
	ioLabel: {
		fontFamily: font.body,
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: 1,
		color: color.textMuted,
		marginBlockStart: space.xxs,
	},
	io: {
		margin: 0,
		fontFamily: font.mono,
		fontSize: type.code,
		lineHeight: type.snug,
		backgroundColor: color.surface,
		borderRadius: corner.small,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		overflowX: "auto",
		whiteSpace: "pre",
		color: color.text,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	ioError: {
		backgroundColor: color.dangerSubtle,
		color: color.danger,
		whiteSpace: "pre-wrap",
	},
	copyError: {
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		color: color.danger,
		cursor: "pointer",
		justifySelf: "start",
		backgroundColor: {
			default: color.dangerSubtle,
			":hover": `color-mix(in srgb, ${color.danger} 16%, ${color.dangerSubtle})`,
		},
		borderRadius: corner.pill,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	retryLine: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		paddingBlockEnd: space.sm,
		paddingInlineStart: INDENT,
		paddingInlineEnd: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.warning,
	},
	subLine: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		paddingInlineStart: INDENT,
		paddingInlineEnd: space.md,
		paddingBottom: space.sm,
		marginBlockStart: `calc(${space.xxs} * -1)`,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.textMuted,
	},
	chip: {
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: type.snug,
		color: color.textMuted,
		backgroundColor: color.surface,
		borderRadius: corner.pill,
		paddingBlock: "0.1rem",
		paddingInline: space.xs,
		flex: "none",
	},
	now: {
		backgroundImage: {
			default: `linear-gradient(90deg, ${color.textMuted} 30%, ${color.textFaint} 50%, ${color.textMuted} 70%)`,
			[REDUCED]: "none",
		},
		backgroundSize: "200% 100%",
		backgroundClip: { default: "text", [REDUCED]: "border-box" },
		color: { default: "transparent", [REDUCED]: color.textMuted },
		animationName: { default: shimmer, [REDUCED]: "none" },
		animationDuration: motion.loopSlow,
		animationTimingFunction: motion.linear,
		animationIterationCount: "infinite",
	},
	summary: {
		paddingInlineStart: INDENT,
		paddingInlineEnd: space.md,
		paddingBottom: space.sm,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		color: color.textMuted,
		display: "-webkit-box",
		WebkitLineClamp: 3,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	},
	nested: {
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.border,
		marginBlock: space.xxs,
		paddingInlineStart: space.sm,
		display: "grid",
		gap: space.xs,
	},
	quote: {
		color: color.textMuted,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		margin: 0,
	},
	nestedText: { fontFamily: font.body, fontSize: type.t2, lineHeight: type.snug, margin: 0 },
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

const strings = defineStrings({
	"zh-TW": {
		verbRead: "讀取",
		verbEdit: "編輯",
		verbWrite: "寫入",
		verbShell: "執行",
		verbSearch: "搜尋",
		verbFetch: "取得",
		verbSubagent: "委派",
		running: "執行中",
		completed: "完成",
		failed: "失敗",
		retry: (attempt: number, max: number, seconds: number) =>
			`${seconds} 秒後重試(第 ${attempt} / ${max} 次)`,
		input: "輸入",
		output: "輸出",
		error: "錯誤",
		copyError: "複製錯誤",
		copied: "已複製 ✓",
		toolCount: (count: number) => `${count} 工具`,
	},
	en: {
		verbRead: "Read",
		verbEdit: "Edit",
		verbWrite: "Write",
		verbShell: "Run",
		verbSearch: "Search",
		verbFetch: "Fetch",
		verbSubagent: "Delegate",
		running: "Running",
		completed: "Done",
		failed: "Failed",
		retry: (attempt: number, max: number, seconds: number) =>
			`Retrying in ${seconds}s (attempt ${attempt} of ${max})`,
		input: "Input",
		output: "Output",
		error: "Error",
		copyError: "Copy error",
		copied: "Copied ✓",
		toolCount: (count: number) => `${count} ${count === 1 ? "tool" : "tools"}`,
	},
})

/**
 * The ToolCard family's built-in words (follow `<LocaleProvider>`). Override any with
 * `<ToolCard labels={…}>`; ToolInput, ToolOutput, ToolError and SubagentLine inside the card
 * read the same overrides.
 */
export type ToolCardLabels = StringsOf<typeof strings>

const VERBS: Record<string, `verb${string}` & keyof ToolCardLabels> = {
	read: "verbRead",
	edit: "verbEdit",
	write: "verbWrite",
	shell: "verbShell",
	search: "verbSearch",
	fetch: "verbFetch",
	subagent: "verbSubagent",
}

// The card's `labels`, handed down to the family parts rendered inside it
const LabelsContext = createContext<Partial<ToolCardLabels> | undefined>(undefined)

function useInheritedStrings() {
	return useStrings(strings, use(LabelsContext))
}

// lucide 的路徑:file-text / pencil / file-plus / terminal / search / globe / bot,其他工具用 wrench
const TOOL_PATHS: Record<string, string[]> = {
	read: [
		"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		"M14 2v4a2 2 0 0 0 2 2h4",
		"M16 13H8",
		"M16 17H8",
	],
	edit: [
		"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	],
	write: [
		"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		"M14 2v4a2 2 0 0 0 2 2h4",
		"M12 12v6",
		"M9 15h6",
	],
	shell: ["m4 17 6-6-6-6", "M12 19h8"],
	search: ["m21 21-4.34-4.34", "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"],
	fetch: [
		"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
		"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
		"M2 12h20",
	],
	subagent: [
		"M12 8V4H8",
		"M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z",
		"M2 14h2",
		"M20 14h2",
		"M15 13v2",
		"M9 13v2",
	],
	tool: [
		"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",
	],
}

const STATE_PATHS = { completed: ["M20 6 9 17l-5-5"], error: ["M18 6 6 18", "m6 6 12 12"] }

function ToolGlyph({ paths }: { paths: string[] }) {
	return (
		<Glyph {...stylex.props(styles.glyph)}>
			{paths.map((d) => (
				<path key={d} d={d} />
			))}
		</Glyph>
	)
}

const DEFAULT_OPEN_TOOLS = new Set(["shell", "edit", "write"])

function Chevron({ open }: { open: boolean }) {
	return (
		<Glyph {...stylex.props(styles.chevron, open && styles.chevronOpen)}>
			<path d="m6 9 6 6 6-6" />
		</Glyph>
	)
}

/** Where a tool call is: still running, finished, or failed. */
export type ToolState = "running" | "completed" | "error"

/** A pending retry: which try comes next, of how many, and how long until it starts. */
export type ToolRetry = { attempt: number; max: number; delayMs: number }

export type ToolCardProps = {
	/**
	 * The tool's name. `read`, `edit`, `write`, `shell`, `search`, `fetch` and `subagent` get
	 * their own icon and verb; any other name shows a wrench and itself.
	 */
	tool: string
	/** The row's title. Defaults to the tool's verb (from the locale), or the tool name. */
	title?: string
	/** What it acted on (a path, a command, a URL), in mono; clipped with the full text on hover. */
	subtitle?: string
	/** Running, completed (the default) or error. Announced politely when it changes. */
	state?: ToolState
	/** How long the call took, formatted for the row (e.g. `300ms`, `1.2s`). */
	durationMs?: number
	/** The row's time text as-is, e.g. a running clock. Wins over `durationMs`. */
	durationLabel?: string
	/**
	 * Whether the detail panel is shown. Pass it to control the card; it then no longer opens
	 * itself on error, since you own the state. Pair it with `onOpenChange`.
	 */
	open?: boolean
	/**
	 * Whether the detail panel starts shown when `open` is not passed. Without it, `shell`,
	 * `edit` and `write` start open, the rest start collapsed, and any card opens when it
	 * errors.
	 */
	defaultOpen?: boolean
	/** Called with the new state when the user opens or closes the card. Opening on error is not reported. */
	onOpenChange?: (open: boolean) => void
	/**
	 * How far the running call is, as a fraction from 0 to 1 (values outside are clamped).
	 * Fills the bar and is exposed as a progressbar (0–100) while `state` is `running`.
	 * Leave it undefined for the indeterminate sweep, the default.
	 */
	progress?: number
	/** A pending retry: shows a spinner line with the countdown words and announces them. */
	retry?: ToolRetry
	/** Override built-in words for this card and the family parts inside it; the rest follow `<LocaleProvider>`. */
	labels?: Partial<ToolCardLabels>
	/**
	 * The retry line, shown and announced: when the next try starts and which try of how many it is.
	 * Wins over `labels.retry`.
	 */
	retryLabel?: (attempt: number, max: number, seconds: number) => string
	/** The running state's word. Wins over `labels.running`. */
	runningLabel?: string
	/** The completed state's word. Wins over `labels.completed`. */
	completedLabel?: string
	/** The error state's word. Wins over `labels.failed`. */
	errorLabel?: string
	/** A line under the row that stays visible when collapsed, e.g. `<SubagentLine>`. */
	secondLine?: ReactNode
	/** Content after `secondLine` that stays visible when collapsed, e.g. `<SubagentSummary>`. */
	footer?: ReactNode
	/** The detail panel the row folds: `<ToolInput>`, `<ToolOutput>`, `<ToolError>`, `<SubagentThread>`. */
	children?: ReactNode
}

/**
 * One tool call in the thread: a row (icon, verb, target, time) that folds open to the call's
 * input and output. The row is a real button with `aria-expanded` and `aria-controls`: Enter
 * and Space toggle it. The state is announced politely, once per change.
 */
export function ToolCard({
	tool,
	title,
	subtitle,
	state = "completed",
	durationMs,
	durationLabel,
	open: openProp,
	defaultOpen,
	onOpenChange,
	progress,
	retry,
	labels,
	retryLabel,
	runningLabel,
	completedLabel,
	errorLabel,
	secondLine,
	footer,
	children,
}: ToolCardProps) {
	const t = useStrings(strings, labels)
	const detailId = useId()
	// No onChange here: only the user's click reports through onOpenChange, not the error auto-open
	const [open, setOpen] = useControllableState(
		openProp,
		defaultOpen ?? (state === "error" || DEFAULT_OPEN_TOOLS.has(tool)),
	)
	const [wasState, setWasState] = useState(state)

	// A tool usually mounts as `running` and only later fails; NOTES says any
	// error is expanded, so react to the transition, not just the initial state.
	if (wasState !== state) {
		setWasState(state)
		if (state === "error" && defaultOpen == null && openProp === undefined) setOpen(true)
	}
	const STATE_LABELS = {
		running: runningLabel ?? t.running,
		completed: completedLabel ?? t.completed,
		error: errorLabel ?? t.failed,
	}
	const retryText =
		retry != null ? (retryLabel ?? t.retry)(retry.attempt, retry.max, Math.round(retry.delayMs / 1000)) : ""
	const time = durationLabel ?? (durationMs != null ? formatDuration(durationMs) : "")
	const fraction =
		state === "running" && progress != null && Number.isFinite(progress)
			? Math.min(1, Math.max(0, progress))
			: undefined

	return (
		<LabelsContext value={labels}>
			<div {...stylex.props(styles.card, state === "error" && styles.cardError)}>
				<button
					type="button"
					aria-expanded={open}
					aria-controls={detailId}
					onClick={() => {
						setOpen(!open)
						onOpenChange?.(!open)
					}}
					{...stylex.props(reset.control, styles.row)}
				>
					<span
						{...stylex.props(
							styles.tile,
							state === "running" && styles.tileRunning,
							state === "completed" && styles.tileOk,
							state === "error" && styles.tileBad,
						)}
					>
						<ToolGlyph
							paths={state === "running" ? (TOOL_PATHS[tool] ?? TOOL_PATHS.tool) : STATE_PATHS[state]}
						/>
						{state !== "running" && <span {...stylex.props(styles.srOnly)}>{STATE_LABELS[state]}</span>}
					</span>
					<span {...stylex.props(styles.main)}>
						<span {...stylex.props(styles.line)}>
							<span id={`${detailId}-title`} {...stylex.props(styles.title)}>
								{title ?? (Object.hasOwn(VERBS, tool) ? t[VERBS[tool]] : tool)}
							</span>
							{subtitle != null && (
								<span
									id={`${detailId}-subtitle`}
									title={subtitle}
									{...stylex.props(styles.subtitle, open && styles.subtitleOpen)}
								>
									{subtitle}
								</span>
							)}
						</span>
						{state === "running" && (
							<span aria-hidden="true" {...stylex.props(styles.track)}>
								<span
									{...stylex.props(
										fraction != null ? styles.fill : styles.bar,
										fraction != null && styles.fillWidth(fraction * 100),
									)}
								/>
							</span>
						)}
					</span>
					{time !== "" && <span {...stylex.props(styles.time)}>{time}</span>}
					<Chevron open={open} />
				</button>
				{/* A button's children are presentational, so the progressbar sits beside it, visually hidden;
			    the bar inside the row is its picture. */}
				{fraction != null && (
					<span
						role="progressbar"
						aria-labelledby={
							subtitle != null ? `${detailId}-title ${detailId}-subtitle` : `${detailId}-title`
						}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(fraction * 100)}
						{...stylex.props(styles.srOnly)}
					/>
				)}
				{secondLine}
				{footer}
				<div id={detailId} hidden={!open} {...stylex.props(styles.detail)}>
					{children}
				</div>
				{retry != null && (
					<div aria-hidden="true" {...stylex.props(styles.retryLine)}>
						<span {...stylex.props(styles.spinner)} />
						{retryText}
					</div>
				)}
				<span role="status" {...stylex.props(styles.srOnly)}>
					{[STATE_LABELS[state], retryText].filter(Boolean).join(" · ")}
				</span>
			</div>
		</LabelsContext>
	)
}

export type ToolInputProps = {
	/** The call's input: a string as-is, anything else as JSON. */
	json: unknown
	/** The pane's name. Wins over the card's `labels.input`. */
	label?: string
}

/** The tool call's input pane, for inside a ToolCard. */
export function ToolInput({ json, label: labelProp }: ToolInputProps) {
	const t = useInheritedStrings()
	const label = labelProp ?? t.input
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="group" aria-label={label} {...stylex.props(styles.io)}>
				{typeof json === "string" ? json : JSON.stringify(json, null, 1)}
			</pre>
		</>
	)
}

export type ToolOutputProps = {
	/** The call's output text. */
	text: string
	/** The pane's name. Wins over the card's `labels.output`. */
	label?: string
}

/** The tool call's output pane, for inside a ToolCard. */
export function ToolOutput({ text: value, label: labelProp }: ToolOutputProps) {
	const t = useInheritedStrings()
	const label = labelProp ?? t.output
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="group" aria-label={label} {...stylex.props(styles.io)}>
				{value}
			</pre>
		</>
	)
}

export type ToolErrorProps = {
	/** The error text, also what the copy button copies. */
	text: string
	/** The pane's name. Wins over the card's `labels.error`. */
	label?: string
	/** The copy button's words. Wins over the card's `labels.copyError`. */
	copyLabel?: string
	/** The copy button's words right after copying. Wins over the card's `labels.copied`. */
	copiedLabel?: string
}

/** The tool call's error pane with a copy button, for inside a ToolCard. */
export function ToolError({ text: value, label: labelProp, copyLabel, copiedLabel }: ToolErrorProps) {
	const t = useInheritedStrings()
	const label = labelProp ?? t.error
	const { copied, copy } = useCopy()
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="group" aria-label={label} {...stylex.props(styles.io, styles.ioError)}>
				{value}
			</pre>
			<button type="button" onClick={() => copy(value)} {...stylex.props(reset.control, styles.copyError)}>
				{copied ? (copiedLabel ?? t.copied) : (copyLabel ?? t.copyError)}
			</button>
		</>
	)
}

export type SubagentLineProps = {
	/** The subagent's model, shown as a chip. */
	model?: string
	/** What it is doing right now, shimmering. Wins over `toolCount`. */
	now?: string
	/** How many tools it used, once it is done. */
	toolCount?: number
}

/** A subagent card's second line: its model and what it is doing, or how many tools it used. */
export function SubagentLine({ model, now, toolCount }: SubagentLineProps) {
	const t = useInheritedStrings()
	return (
		<div {...stylex.props(styles.subLine)}>
			{model != null && <span {...stylex.props(styles.chip)}>{model}</span>}
			{now != null ? (
				<span {...stylex.props(styles.now)}>{now}</span>
			) : toolCount != null ? (
				<span>{t.toolCount(toolCount)}</span>
			) : null}
		</div>
	)
}

export type SubagentSummaryProps = {
	/** The subagent's result, clamped to three lines. */
	children: ReactNode
}

/** A finished subagent's summary, for a ToolCard's `footer`, so it shows while collapsed. */
export function SubagentSummary({ children }: SubagentSummaryProps) {
	return <div {...stylex.props(styles.summary)}>{children}</div>
}

export type SubagentThreadProps = {
	/** The task the subagent was given, quoted at the top. */
	task?: ReactNode
	/** The subagent's own steps: nested ToolCards and SubagentText. */
	children?: ReactNode
}

/** A subagent's nested thread, indented under a rule, for inside a ToolCard. */
export function SubagentThread({ task, children }: SubagentThreadProps) {
	return (
		<div {...stylex.props(styles.nested)}>
			{task != null && <p {...stylex.props(styles.quote)}>{task}</p>}
			{children}
		</div>
	)
}

export type SubagentTextProps = {
	/** A paragraph the subagent wrote. */
	children: ReactNode
}

/** A paragraph of subagent text inside a SubagentThread. */
export function SubagentText({ children }: SubagentTextProps) {
	return <p {...stylex.props(styles.nestedText)}>{children}</p>
}
