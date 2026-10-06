import * as stylex from "@stylexjs/stylex"
import { color, corner, font, type } from "../../tokens.stylex"
import { formatClock } from "../../lib/format"
import { IconButton } from "../icon-button/IconButton"
import { MicGlyph, MicOffGlyph, PhoneOffGlyph } from "../icon/glyphs"
import { ICON_STROKE } from "../icon/icon"
import { LiveDot } from "../live-dot/LiveDot"

/**
 * The bar a chatbox turns into during a voice call: a breathing dot, what the call is doing, how
 * long it has run, mute and hang up. It keeps no state; the call session owns all of it.
 */

/** A call session's states, the same as the product contract's `CallStatus`. */
export type CallStatus =
	| "listening"
	| "user-speaking"
	| "transcribing"
	| "holding"
	| "thinking"
	| "speaking"
	| "interrupted"

export type CallBarLabels = Record<CallStatus | "muted" | "call" | "mute" | "unmute" | "hangUp", string>

const LABELS: CallBarLabels = {
	listening: "通話中",
	"user-speaking": "你在說話",
	transcribing: "聽寫中",
	holding: "等你說完",
	thinking: "思考中",
	speaking: "回話中",
	interrupted: "先停一下",
	muted: "已靜音",
	call: "通話",
	mute: "靜音",
	unmute: "取消靜音",
	hangUp: "掛斷",
}

const styles = stylex.create({
	// 取代 chatbox 的位置,所以跟 Composer 同一張凹下去的 surface 紙
	box: {
		alignItems: "center",
		backgroundColor: color.surface,
		borderRadius: corner.sheet,
		boxSizing: "border-box",
		color: color.text,
		display: "flex",
		fontSize: type.t3,
		gap: 8,
		lineHeight: type.snug,
		padding: 8,
		paddingInlineStart: 16,
	},
	dot: { marginInlineEnd: 2 },
	timer: {
		color: color.textMuted,
		flex: 1,
		fontFamily: font.mono,
		fontSize: type.t2,
		fontVariantNumeric: "tabular-nums",
	},
	hangUp: { color: { default: color.danger, ":hover": color.danger } },
	icon: { flexShrink: 0, height: 18, pointerEvents: "none", width: 18 },
})

export type CallBarProps = {
	status: CallStatus
	/** How long the call has run. */
	seconds: number
	muted: boolean
	/** Asked to mute (`true`) or unmute (`false`). */
	onMute: (muted: boolean) => void
	onHangUp: () => void
	/** The words, for another language. Muted wins over the status. */
	labels?: Partial<CallBarLabels>
	sx?: stylex.StyleXStyles
}

export function CallBar({ status, seconds, muted, onMute, onHangUp, labels, sx }: CallBarProps) {
	const words = { ...LABELS, ...labels }
	const Glyph = muted ? MicOffGlyph : MicGlyph

	return (
		<div role="group" aria-label={words.call} {...stylex.props(styles.box, sx)}>
			<LiveDot sx={styles.dot} />
			<span>{muted ? words.muted : words[status]}</span>
			<span {...stylex.props(styles.timer)}>{formatClock(seconds)}</span>
			<IconButton label={muted ? words.unmute : words.mute} open={muted} onClick={() => onMute(!muted)}>
				<Glyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
			<IconButton label={words.hangUp} onClick={onHangUp} sx={styles.hangUp}>
				<PhoneOffGlyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
		</div>
	)
}
