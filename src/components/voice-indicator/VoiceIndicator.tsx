import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { usePrefersReducedMotion } from "../../lib/motion"
import { useAnimationFrame } from "../../lib/useAnimationFrame"
import { type VoiceState, voicePath } from "../../lib/voice"
import { color, corner, font, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	voice: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		backgroundColor: color.surface,
		borderRadius: corner.pill,
		paddingBlock: space.xs,
		paddingInlineStart: space.sm,
		paddingInlineEnd: space.md,
		fontFamily: font.body,
	},
	viz: { width: "3rem", height: "1.5rem", flex: "none", overflow: "visible" },
	fibre: { fill: "none", stroke: color.textFaint, strokeWidth: 1.6, strokeLinecap: "round" },
	// 聽、想、說都是 agent 正在做事:signal
	fibreActive: { stroke: color.signal },
	label: { fontSize: type.t2, color: color.textMuted },
	labelStrong: { fontWeight: 500, color: color.text },
	motionLabel: {
		display: { default: "none", [REDUCED]: "inline" },
		fontFamily: font.mono,
		fontSize: "0.62rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		color: color.signal,
	},
})

const strings = defineStrings({
	"zh-TW": {
		idle: "閒置",
		listening: "聆聽中",
		thinking: "思考中",
		speaking: "說話中",
		listeningHint: "…說完就送",
		speakingHint: "…插話會打斷",
		standby: "通話待命 · ",
	},
	en: {
		idle: "Idle",
		listening: "Listening",
		thinking: "Thinking",
		speaking: "Speaking",
		listeningHint: "… sends when you stop",
		speakingHint: "… talk to interrupt",
		standby: "Call on standby · ",
	},
})

/**
 * The VoiceIndicator's built-in words (follow `<LocaleProvider>`): one name per state, the
 * hints after listening and speaking, and the `standby` prefix shown before idle.
 */
export type VoiceIndicatorLabels = StringsOf<typeof strings>

const HINT: Record<VoiceState, "listeningHint" | "speakingHint" | null> = {
	idle: null,
	listening: "listeningHint",
	thinking: null,
	speaking: "speakingHint",
}

export type VoiceIndicatorProps = {
	/** What the voice session is doing; the status text is announced when it changes. */
	state: VoiceState
	/** Input loudness from 0 to 1; only moves the drawing, never the announced text. */
	level?: number
	/** Shorthand that replaces the state's name (`labels[state]`); wins over it. */
	statusLabel?: string
	/** Override built-in words for this indicator; the rest follow `<LocaleProvider>`. */
	labels?: Partial<VoiceIndicatorLabels>
}

/** A voice session's state: a decorative waveform plus a polite status line. */
export function VoiceIndicator({ state, level = 0.4, statusLabel, labels }: VoiceIndicatorProps) {
	const words = useStrings(strings, labels)
	const reduced = usePrefersReducedMotion()
	const [t, setT] = useState(1.2)
	useAnimationFrame(!reduced && state !== "idle", (elapsed) => setT(elapsed / 1000))

	const name = statusLabel ?? words[state]
	const hint = HINT[state]

	return (
		<div {...stylex.props(styles.voice)}>
			<svg viewBox="0 0 48 24" aria-hidden="true" {...stylex.props(styles.viz)}>
				<path
					d={voicePath(state, reduced ? 1.2 : t, level)}
					{...stylex.props(styles.fibre, state !== "idle" && styles.fibreActive)}
				/>
			</svg>
			<span role="status" {...stylex.props(styles.label)}>
				{state === "idle" && words.standby}
				<b {...stylex.props(styles.labelStrong)}>{name}</b>
				{hint != null && words[hint]}
			</span>
			{state !== "idle" && (
				<span aria-hidden="true" {...stylex.props(styles.motionLabel)}>
					{name}
				</span>
			)}
		</div>
	)
}
