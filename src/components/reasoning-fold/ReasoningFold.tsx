import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useEffect, useId, useRef, useState } from "react"
import { reset } from "../../lib/styled"
import { color, corner, motion, space, text, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const AUTO_COLLAPSE_MS = 1000

const shimmer = stylex.keyframes({ to: { backgroundPosition: "-200% 0" } })

const styles = stylex.create({
	fold: { display: "grid" },
	// 膠囊:凹下去的 surface 底、無框,hover 深一階
	row: {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		boxSizing: "border-box",
		height: 32,
		paddingInline: space.sm,
		fontSize: type.t2,
		lineHeight: text.leadingSnug,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: color.surface, ":hover": color.accentSubtle },
		cursor: "pointer",
		justifySelf: "start",
		borderRadius: corner.pill,
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	chevron: {
		width: 14,
		height: 14,
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
	},
	chevronOpen: { rotate: "90deg" },
	// 左線對齊膠囊裡 chevron 的中線
	body: {
		marginBlockStart: space.xs,
		paddingInlineStart: space.sm,
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.border,
		marginInlineStart: `calc(${space.sm} + 6px)`,
		fontSize: type.t2,
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
		<Glyph {...stylex.props(styles.chevron, open && styles.chevronOpen)}>
			<path d="m9 6 6 6-6 6" />
		</Glyph>
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
	const [justFinished, setJustFinished] = useState(false)

	if (wasStreaming !== streaming) {
		setWasStreaming(streaming)
		setJustFinished(!streaming)
		if (streaming && !userToggled) setOpen(true)
	}

	useEffect(() => {
		if (userToggled || streaming || !justFinished) return
		const timer = setTimeout(() => {
			setOpen(false)
			if (body.current?.contains(document.activeElement)) row.current?.focus()
			setJustFinished(false)
		}, AUTO_COLLAPSE_MS)
		return () => clearTimeout(timer)
	}, [streaming, userToggled, justFinished])

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
				{...stylex.props(reset.control, styles.row)}
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
