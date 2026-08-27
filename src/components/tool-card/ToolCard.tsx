import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId, useState } from "react"
import { useCopy } from "../../lib/useCopy"
import { formatDuration } from "../../lib/format"
import { color, font, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const spin = stylex.keyframes({ to: { rotate: "360deg" } })
const shimmer = stylex.keyframes({ to: { backgroundPosition: "-200% 0" } })

const styles = stylex.create({
	card: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "hidden",
	},
	cardError: { borderColor: `color-mix(in srgb, ${color.danger} 45%, ${color.border})` },
	row: {
		all: "unset",
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		width: "100%",
		boxSizing: "border-box",
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontFamily: font.body,
		fontSize: text.xs,
		lineHeight: text.leadingSnug,
		color: color.text,
		cursor: "pointer",
		backgroundColor: {
			default: "transparent",
			":hover": `color-mix(in srgb, ${color.border} 22%, ${color.surface})`,
		},
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	title: { fontWeight: 500, flex: "none" },
	subtitle: {
		color: color.textMuted,
		fontFamily: font.mono,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	time: {
		marginInlineStart: "auto",
		color: color.textFaint,
		fontVariantNumeric: "tabular-nums",
		flex: "none",
	},
	chevron: {
		color: color.textFaint,
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	chevronOpen: { rotate: "180deg" },
	ok: { color: color.success, flex: "none" },
	bad: { color: color.danger, flex: "none" },
	spinner: {
		width: 11,
		height: 11,
		flex: "none",
		borderWidth: 1.5,
		borderStyle: "solid",
		borderColor: color.borderStrong,
		borderTopColor: color.accent,
		borderRadius: radius.full,
		animationName: spin,
		animationDuration: { default: "0.8s", [REDUCED]: "1.6s" },
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	spinnerWarning: { borderTopColor: color.warning },
	detail: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		display: "grid",
		gap: space.xxs,
	},
	ioLabel: {
		fontFamily: font.mono,
		fontSize: "0.62rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
	},
	io: {
		margin: 0,
		fontFamily: font.mono,
		fontSize: text.code,
		lineHeight: text.leadingNormal,
		backgroundColor: color.bg,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.sm,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		overflowX: "auto",
		whiteSpace: "pre",
		color: color.text,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	ioError: {
		backgroundColor: color.dangerSubtle,
		borderColor: `color-mix(in srgb, ${color.danger} 35%, ${color.border})`,
		color: color.danger,
		whiteSpace: "pre-wrap",
	},
	copyError: {
		all: "unset",
		fontFamily: font.body,
		fontSize: text.xs,
		color: color.danger,
		cursor: "pointer",
		justifySelf: "start",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: `color-mix(in srgb, ${color.danger} 40%, ${color.border})`,
		borderRadius: radius.sm,
		paddingBlock: "0.2rem",
		paddingInline: space.xxs,
		outline: { default: "none", ":focus-visible": `2px solid ${color.danger}` },
		outlineOffset: 1,
	},
	retryLine: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		fontFamily: font.body,
		fontSize: text.xs,
		color: color.warning,
	},
	retryCount: { marginInlineStart: "auto", fontVariantNumeric: "tabular-nums" },
	subLine: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		paddingInline: space.sm,
		paddingBottom: space.xs,
		fontFamily: font.body,
		fontSize: text.xs,
		color: color.textMuted,
	},
	chip: {
		fontFamily: font.mono,
		fontSize: "0.68rem",
		lineHeight: text.leadingSnug,
		color: color.textFaint,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.sm,
		paddingBlock: "0.05rem",
		paddingInline: space.xxs,
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
		paddingInline: space.sm,
		paddingBottom: space.xs,
		fontFamily: font.body,
		fontSize: text.xs,
		lineHeight: text.leadingSnug,
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
		marginInline: space.sm,
		paddingInlineStart: space.sm,
		display: "grid",
		gap: space.xs,
	},
	quote: {
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.borderStrong,
		paddingInlineStart: space.xs,
		color: color.textMuted,
		fontFamily: font.body,
		fontSize: text.xs,
		lineHeight: text.leadingSnug,
		margin: 0,
	},
	nestedText: { fontFamily: font.body, fontSize: text.xs, lineHeight: text.leadingSnug, margin: 0 },
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

const DEFAULT_OPEN_TOOLS = new Set(["shell", "edit", "write"])

function Chevron({ open }: { open: boolean }) {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.chevron, open && styles.chevronOpen)}
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
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

	return (
		<div {...stylex.props(styles.card, state === "error" && styles.cardError)}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={detailId}
				onClick={() => setOpen((value) => !value)}
				{...stylex.props(styles.row)}
			>
				{state === "running" && (
					<span role="status" aria-label={runningLabel} {...stylex.props(styles.spinner)} />
				)}
				{state === "completed" && (
					<span aria-label={completedLabel} {...stylex.props(styles.ok)}>
						✓
					</span>
				)}
				{state === "error" && (
					<span aria-label={errorLabel} {...stylex.props(styles.bad)}>
						✗
					</span>
				)}
				<span {...stylex.props(styles.title)}>{title ?? VERBS[tool] ?? tool}</span>
				{subtitle != null && <span {...stylex.props(styles.subtitle)}>{subtitle}</span>}
				<span {...stylex.props(styles.time)}>
					{durationLabel ?? (durationMs != null ? formatDuration(durationMs) : "")}
				</span>
				<Chevron open={open} />
			</button>
			{secondLine}
			{footer}
			<div id={detailId} hidden={!open} {...stylex.props(styles.detail)}>
				{children}
			</div>
			{retry != null && (
				<div role="status" {...stylex.props(styles.retryLine)}>
					<span aria-hidden="true" {...stylex.props(styles.spinner, styles.spinnerWarning)} />
					{`重試中(第 ${retry.attempt} 次,${Math.round(retry.delayMs / 1000)} 秒後)…`}
					<span {...stylex.props(styles.retryCount)}>{`重試 ${retry.attempt}/${retry.max}`}</span>
				</div>
			)}
		</div>
	)
}

export function ToolInput({ json, label = "輸入" }: { json: unknown; label?: string }) {
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="region" aria-label={label} {...stylex.props(styles.io)}>
				{typeof json === "string" ? json : JSON.stringify(json, null, 1)}
			</pre>
		</>
	)
}

export function ToolOutput({ text: value, label = "輸出" }: { text: string; label?: string }) {
	return (
		<>
			<span {...stylex.props(styles.ioLabel)}>{label}</span>
			<pre tabIndex={0} role="region" aria-label={label} {...stylex.props(styles.io)}>
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
			<pre tabIndex={0} role="region" aria-label={label} {...stylex.props(styles.io, styles.ioError)}>
				{value}
			</pre>
			<button type="button" onClick={() => copy(value)} {...stylex.props(styles.copyError)}>
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
