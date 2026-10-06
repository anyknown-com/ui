import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId, useState } from "react"
import { reset } from "../../lib/styled"
import { useCopy } from "../../lib/useCopy"
import { formatDuration } from "../../lib/format"
import { color, corner, font, ink, shadow, space, text, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

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
	},
	cardError: {
		boxShadow: `0 0 0 1px color-mix(in srgb, ${color.danger} 45%, ${color.border}), ${shadow.rest}`,
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
		fontSize: text.sm,
		lineHeight: text.leadingSnug,
		color: color.text,
		textAlign: "start",
		cursor: "pointer",
		backgroundColor: { default: "transparent", ":hover": ink.n4 },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
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
	tileRunning: { backgroundColor: color.signalSubtle, color: color.signal },
	tileOk: { color: color.success },
	tileBad: { backgroundColor: color.dangerSubtle, color: color.danger },
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
	},
	bar: {
		position: "absolute",
		insetBlock: 0,
		insetInlineStart: 0,
		width: `${SWEEP}%`,
		borderRadius: corner.pill,
		backgroundColor: color.signal,
		animationName: { default: sweep, [REDUCED]: "none" },
		animationDuration: "1.6s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
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
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	chevronOpen: { rotate: "180deg" },
	spinner: {
		width: 11,
		height: 11,
		flex: "none",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: color.borderStrong,
		borderTopColor: color.warning,
		borderRadius: corner.pill,
		animationName: spin,
		animationDuration: { default: "0.8s", [REDUCED]: "1.6s" },
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	detail: {
		paddingBlockEnd: space.sm,
		paddingInline: space.md,
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
		fontSize: text.code,
		lineHeight: text.leadingNormal,
		backgroundColor: color.surface,
		borderRadius: corner.small,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		overflowX: "auto",
		whiteSpace: "pre",
		color: color.text,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
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
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	retryLine: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		paddingBlockEnd: space.sm,
		paddingInline: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.warning,
	},
	retryCount: { marginInlineStart: "auto", fontVariantNumeric: "tabular-nums" },
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
		lineHeight: text.leadingSnug,
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
		animationDuration: "1.6s",
		animationTimingFunction: "linear",
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

const VERBS: Record<string, string> = {
	read: "讀取",
	edit: "編輯",
	write: "寫入",
	shell: "執行",
	search: "搜尋",
	fetch: "取得",
	subagent: "委派",
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

export type ToolState = "running" | "completed" | "error"

export type ToolRetry = { attempt: number; max: number; delayMs: number }

export type ToolCardProps = {
	tool: string
	title?: string
	subtitle?: string
	state?: ToolState
	durationMs?: number
	durationLabel?: string
	defaultOpen?: boolean
	retry?: ToolRetry
	runningLabel?: string
	completedLabel?: string
	errorLabel?: string
	secondLine?: ReactNode
	footer?: ReactNode
	children?: ReactNode
}

export function ToolCard({
	tool,
	title,
	subtitle,
	state = "completed",
	durationMs,
	durationLabel,
	defaultOpen,
	retry,
	runningLabel = "執行中",
	completedLabel = "完成",
	errorLabel = "失敗",
	secondLine,
	footer,
	children,
}: ToolCardProps) {
	const detailId = useId()
	const [open, setOpen] = useState(defaultOpen ?? (state === "error" || DEFAULT_OPEN_TOOLS.has(tool)))
	const [wasState, setWasState] = useState(state)

	// A tool usually mounts as `running` and only later fails; NOTES says any
	// error is expanded, so react to the transition, not just the initial state.
	if (wasState !== state) {
		setWasState(state)
		if (state === "error" && defaultOpen == null) setOpen(true)
	}
	const STATE_LABELS = { running: runningLabel, completed: completedLabel, error: errorLabel }
	const retryText =
		retry != null ? `重試中(第 ${retry.attempt} 次,${Math.round(retry.delayMs / 1000)} 秒後)…` : ""
	const time = durationLabel ?? (durationMs != null ? formatDuration(durationMs) : "")

	return (
		<div {...stylex.props(styles.card, state === "error" && styles.cardError)}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={detailId}
				onClick={() => setOpen((value) => !value)}
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
						<span {...stylex.props(styles.title)}>{title ?? VERBS[tool] ?? tool}</span>
						{subtitle != null && (
							<span title={subtitle} {...stylex.props(styles.subtitle, open && styles.subtitleOpen)}>
								{subtitle}
							</span>
						)}
					</span>
					{state === "running" && (
						<span aria-hidden="true" {...stylex.props(styles.track)}>
							<span {...stylex.props(styles.bar)} />
						</span>
					)}
				</span>
				{time !== "" && <span {...stylex.props(styles.time)}>{time}</span>}
				<Chevron open={open} />
			</button>
			{secondLine}
			{footer}
			<div id={detailId} hidden={!open} {...stylex.props(styles.detail)}>
				{children}
			</div>
			{retry != null && (
				<div aria-hidden="true" {...stylex.props(styles.retryLine)}>
					<span {...stylex.props(styles.spinner)} />
					{retryText}
					<span {...stylex.props(styles.retryCount)}>{`重試 ${retry.attempt}/${retry.max}`}</span>
				</div>
			)}
			<span role="status" {...stylex.props(styles.srOnly)}>
				{[STATE_LABELS[state], retryText].filter(Boolean).join(" · ")}
			</span>
		</div>
	)
}

export function ToolInput({ json, label = "輸入" }: { json: unknown; label?: string }) {
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="group" aria-label={label} {...stylex.props(styles.io)}>
				{typeof json === "string" ? json : JSON.stringify(json, null, 1)}
			</pre>
		</>
	)
}

export function ToolOutput({ text: value, label = "輸出" }: { text: string; label?: string }) {
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
	text: string
	label?: string
	copyLabel?: string
	copiedLabel?: string
}

export function ToolError({
	text: value,
	label = "錯誤",
	copyLabel = "複製錯誤",
	copiedLabel = "已複製 ✓",
}: ToolErrorProps) {
	const { copied, copy } = useCopy()
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="group" aria-label={label} {...stylex.props(styles.io, styles.ioError)}>
				{value}
			</pre>
			<button type="button" onClick={() => copy(value)} {...stylex.props(reset.control, styles.copyError)}>
				{copied ? copiedLabel : copyLabel}
			</button>
		</>
	)
}

export type SubagentLineProps = {
	model?: string
	now?: string
	toolCount?: number
}

export function SubagentLine({ model, now, toolCount }: SubagentLineProps) {
	return (
		<div {...stylex.props(styles.subLine)}>
			{model != null && <span {...stylex.props(styles.chip)}>{model}</span>}
			{now != null ? (
				<span {...stylex.props(styles.now)}>{now}</span>
			) : toolCount != null ? (
				<span>{`${toolCount} 工具`}</span>
			) : null}
		</div>
	)
}

export function SubagentSummary({ children }: { children: ReactNode }) {
	return <div {...stylex.props(styles.summary)}>{children}</div>
}

export function SubagentThread({ task, children }: { task?: ReactNode; children?: ReactNode }) {
	return (
		<div {...stylex.props(styles.nested)}>
			{task != null && <p {...stylex.props(styles.quote)}>{task}</p>}
			{children}
		</div>
	)
}

export function SubagentText({ children }: { children: ReactNode }) {
	return <p {...stylex.props(styles.nestedText)}>{children}</p>
}
