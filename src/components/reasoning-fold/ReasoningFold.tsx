import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useEffect, useId, useRef, useState } from "react"
import { color, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const AUTO_COLLAPSE_MS = 1000

const shimmer = stylex.keyframes({ to: { backgroundPosition: "-200% 0" } })

const styles = stylex.create({
	fold: { display: "grid" },
	row: {
		all: "unset",
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontSize: text.xs,
		lineHeight: text.leadingSnug,
		color: { default: color.textMuted, ":hover": color.text },
		cursor: "pointer",
		paddingBlock: "0.2rem",
		justifySelf: "start",
		borderRadius: radius.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	chevron: {
		color: color.textFaint,
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	chevronOpen: { rotate: "90deg" },
	body: {
		marginBlockStart: space.xs,
		paddingInlineStart: `calc(12px + ${space.xxs})`,
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.border,
		marginInlineStart: 5,
		fontSize: text.xs,
		lineHeight: text.leadingRelaxed,
		fontStyle: "italic",
		color: color.textMuted,
	},
	shimmer: {
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
})

function Chevron({ open }: { open: boolean }) {
	return (
		<svg
			width="11"
			height="11"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.chevron, open && styles.chevronOpen)}
		>
			<path d="m9 6 6 6-6 6" />
		</svg>
	)
}

export type ReasoningFoldProps = {
	streaming?: boolean
	durationSec?: number
	defaultOpen?: boolean
	streamingLabel?: string
	onToggle?: (open: boolean) => void
	children: ReactNode
}

export function ReasoningFold({
	streaming = false,
	durationSec,
	defaultOpen = false,
	streamingLabel = "思考中…",
	onToggle,
	children,
}: ReasoningFoldProps) {
	const bodyId = useId()
	const row = useRef<HTMLButtonElement>(null)
	const body = useRef<HTMLDivElement>(null)
	const [userToggled, setUserToggled] = useState(false)
	const [open, setOpen] = useState(defaultOpen || streaming)
	const [wasStreaming, setWasStreaming] = useState(streaming)

	if (wasStreaming !== streaming) {
		setWasStreaming(streaming)
		if (streaming && !userToggled) setOpen(true)
	}

	useEffect(() => {
		if (userToggled || streaming) return
		const timer = setTimeout(() => {
			setOpen(false)
			if (body.current?.contains(document.activeElement)) row.current?.focus()
		}, AUTO_COLLAPSE_MS)
		return () => clearTimeout(timer)
	}, [streaming, userToggled])

	const label = streaming ? (
		<span {...stylex.props(styles.shimmer)}>{streamingLabel}</span>
	) : durationSec != null ? (
		`思考了 ${durationSec} 秒`
	) : (
		"思考過程"
	)

	return (
		<div {...stylex.props(styles.fold)}>
			<button
				type="button"
				ref={row}
				aria-expanded={open}
				aria-controls={bodyId}
				onClick={() => {
					setUserToggled(true)
					setOpen((value) => !value)
					onToggle?.(!open)
				}}
				{...stylex.props(styles.row)}
			>
				<Chevron open={open} />
				{label}
			</button>
			<div id={bodyId} ref={body} hidden={!open} {...stylex.props(styles.body)}>
				{children}
			</div>
		</div>
	)
}
