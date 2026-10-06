import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useCallback, useId, useRef, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { reset } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, motion, space, type } from "../../tokens.stylex"
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
		lineHeight: type.snug,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: color.surface, ":hover": color.accentSubtle },
		cursor: "pointer",
		justifySelf: "start",
		borderRadius: corner.pill,
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	chevron: {
		width: 14,
		height: 14,
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
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
		lineHeight: type.body,
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
		animationTimingFunction: motion.linear,
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

const strings = defineStrings({
	"zh-TW": {
		streaming: "思考中…",
		thoughtFor: (seconds: number) => `思考了 ${seconds} 秒`,
		reasoning: "思考過程",
	},
	en: {
		streaming: "Thinking…",
		thoughtFor: (seconds: number) => `Thought for ${seconds} ${seconds === 1 ? "second" : "seconds"}`,
		reasoning: "Reasoning",
	},
})

/** ReasoningFold's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type ReasoningFoldLabels = StringsOf<typeof strings>

export type ReasoningFoldProps = {
	/** The model is still thinking: the row shimmers and, uncontrolled, the fold opens. */
	streaming?: boolean
	/** How long it thought, in whole seconds, shown in the row once streaming ends. */
	durationSec?: number
	/**
	 * Whether the reasoning is shown. Pass it to control the fold; the fold then neither opens
	 * for streaming nor collapses after it, since you own the state. Pair it with `onOpenChange`.
	 */
	open?: boolean
	/**
	 * Whether the reasoning starts shown when `open` is not passed. Collapsed by default; it
	 * also starts open while `streaming`.
	 */
	defaultOpen?: boolean
	/**
	 * Called with the new state when the user opens or closes the fold. The automatic open
	 * while streaming and the collapse a second after it are not reported.
	 */
	onOpenChange?: (open: boolean) => void
	/** Override built-in words for this fold; the rest follow `<LocaleProvider>`. */
	labels?: Partial<ReasoningFoldLabels>
	/** The row's words while streaming. Wins over `labels.streaming`. */
	streamingLabel?: string
	/** @deprecated Use onOpenChange. */
	onToggle?: (open: boolean) => void
	/** The reasoning text. */
	children: ReactNode
}

/**
 * The model's reasoning, folded under one row. It opens while the model is streaming and
 * collapses itself a second after, unless the user has toggled it. The row is a real button:
 * Enter and Space toggle it.
 */
export function ReasoningFold({
	streaming = false,
	durationSec,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	labels,
	streamingLabel,
	onToggle,
	children,
}: ReasoningFoldProps) {
	const t = useStrings(strings, labels)
	const bodyId = useId()
	const row = useRef<HTMLButtonElement>(null)
	const [userToggled, setUserToggled] = useState(false)
	const controlled = openProp !== undefined
	// 不傳 onChange:自動開合不回報,只有使用者按的那一下才叫 onOpenChange
	const [open, setOpen] = useControllableState(openProp, defaultOpen || streaming)
	const [wasStreaming, setWasStreaming] = useState(streaming)
	const [justFinished, setJustFinished] = useState(false)

	if (wasStreaming !== streaming) {
		setWasStreaming(streaming)
		setJustFinished(!streaming)
		if (streaming && !userToggled && !controlled) setOpen(true)
	}

	// 串流剛結束、使用者沒動過:一秒後自己收起。計時器掛在 body 的 ref callback 上 ——
	// 條件不成立時 ref 換成 undefined,React 會跑 cleanup 清掉計時器(卸載時也是)
	const collapseLater = useCallback(
		(node: HTMLDivElement) => {
			const timer = setTimeout(() => {
				setOpen(false)
				if (node.contains(document.activeElement)) row.current?.focus()
				setJustFinished(false)
			}, AUTO_COLLAPSE_MS)
			return () => clearTimeout(timer)
		},
		[setOpen],
	)
	const collapsing = justFinished && !userToggled && !streaming && !controlled

	const label = streaming ? (
		<span {...stylex.props(styles.shimmer)}>{streamingLabel ?? t.streaming}</span>
	) : durationSec != null ? (
		t.thoughtFor(durationSec)
	) : (
		t.reasoning
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
					setOpen(!open)
					onOpenChange?.(!open)
					onToggle?.(!open)
				}}
				{...stylex.props(reset.control, styles.row)}
			>
				<Chevron open={open} />
				{label}
			</button>
			<div
				id={bodyId}
				ref={collapsing ? collapseLater : undefined}
				hidden={!open}
				{...stylex.props(styles.body)}
			>
				{children}
			</div>
		</div>
	)
}
