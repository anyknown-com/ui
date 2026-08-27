import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { usePrefersReducedMotion } from "../../lib/motion"
import { useAnimationFrame } from "../../lib/useAnimationFrame"
import { type VoiceState, voicePath } from "../../lib/voice"
import { color, font, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	voice: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontFamily: font.body,
	},
	viz: { width: "3rem", height: "1.5rem", flex: "none", overflow: "visible" },
	fibre: { fill: "none", stroke: color.textFaint, strokeWidth: 1.6, strokeLinecap: "round" },
	fibreActive: { stroke: color.accent },
	label: { fontSize: text.sm, color: color.textMuted },
	labelStrong: { fontWeight: 500, color: color.text },
	motionLabel: {
		display: { default: "none", [REDUCED]: "inline" },
		fontFamily: font.mono,
		fontSize: "0.62rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		color: color.accent,
	},
})

const STATE_TEXT: Record<VoiceState, { strong: string; rest: string }> = {
	idle: { strong: "閒置", rest: "" },
	listening: { strong: "聆聽中", rest: "…說完就送" },
	thinking: { strong: "思考中", rest: "" },
	speaking: { strong: "說話中", rest: "…插話會打斷" },
}

export type VoiceIndicatorProps = {
	state: VoiceState
	level?: number
	statusLabel?: string
}

export function VoiceIndicator({ state, level = 0.4, statusLabel }: VoiceIndicatorProps) {
	const reduced = usePrefersReducedMotion()
	const [t, setT] = useState(1.2)
	useAnimationFrame(!reduced && state !== "idle", (elapsed) => setT(elapsed / 1000))

	const copy = STATE_TEXT[state]

	return (
		<div {...stylex.props(styles.voice)}>
			<svg viewBox="0 0 48 24" aria-hidden="true" {...stylex.props(styles.viz)}>
				<path
					d={voicePath(state, reduced ? 1.2 : t, level)}
					{...stylex.props(styles.fibre, state !== "idle" && styles.fibreActive)}
				/>
			</svg>
			<span role="status" {...stylex.props(styles.label)}>
				{state === "idle" && "通話待命 · "}
				<b {...stylex.props(styles.labelStrong)}>{statusLabel ?? copy.strong}</b>
				{copy.rest}
			</span>
			{state !== "idle" && <span {...stylex.props(styles.motionLabel)}>{copy.strong}</span>}
		</div>
	)
}
