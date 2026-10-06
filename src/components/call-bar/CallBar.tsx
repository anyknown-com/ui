import * as stylex from "@stylexjs/stylex"
import { color, corner, font, ink, type } from "../../tokens.stylex"
import { formatClock } from "../../lib/format"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
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

const strings = defineStrings({
	"zh-TW": {
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
		hangUp: "掛斷",
	},
	en: {
		listening: "On a call",
		"user-speaking": "You're speaking",
		transcribing: "Transcribing",
		holding: "Waiting for you to finish",
		thinking: "Thinking",
		speaking: "Replying",
		interrupted: "Paused",
		muted: "Muted",
		call: "Call",
		mute: "Mute",
		hangUp: "Hang up",
	},
})

/**
 * The CallBar's built-in words (follow `<LocaleProvider>`): one per `CallStatus`, plus `muted`,
 * the group name `call`, and the button names `mute` and `hangUp`. The mute button keeps its
 * name and reports its state with `aria-pressed`.
 */
export type CallBarLabels = StringsOf<typeof strings>

const FORCED = "@media (forced-colors: active)"

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
		// Forced colors drop the surface paper; an outline keeps the bar's edge.
		outline: { default: null, [FORCED]: "1px solid CanvasText" },
	},
	dot: { marginInlineEnd: 2 },
	timer: {
		color: color.textMuted,
		flex: 1,
		fontFamily: font.mono,
		fontSize: type.t2,
		fontVariantNumeric: "tabular-nums",
	},
	// IconButton's `open` wash, drawn here because `open` would drop the button's tooltip.
	// The pressed wash is a background, which forced colors drop: draw a ring instead.
	mutedButton: {
		backgroundColor: ink.n8,
		color: color.text,
		borderStyle: { default: "none", [FORCED]: "solid" },
		borderWidth: { default: 0, [FORCED]: 1 },
		borderColor: { default: null, [FORCED]: "ButtonText" },
	},
	hangUp: { color: { default: color.danger, ":hover": color.danger } },
	icon: { flexShrink: 0, height: 18, pointerEvents: "none", width: 18 },
})

export type CallBarProps = {
	/** What the call is doing now; shown as text next to the dot. */
	status: CallStatus
	/** How long the call has run. */
	seconds: number
	/** The mic is muted: the text reads `muted` and the mute button shows the crossed-out mic. */
	muted: boolean
	/** Asked to mute (`true`) or unmute (`false`). */
	onMute: (muted: boolean) => void
	/** Called when the hang-up button is pressed. */
	onHangUp: () => void
	/** Override built-in words for this bar; the rest follow `<LocaleProvider>`. Muted wins over the status. */
	labels?: Partial<CallBarLabels>
	/** Extra StyleX styles for the bar. */
	sx?: stylex.StyleXStyles
}

/** The voice-call bar that stands in for the Composer while a call runs. */
export function CallBar({ status, seconds, muted, onMute, onHangUp, labels, sx }: CallBarProps) {
	const words = useStrings(strings, labels)
	const Glyph = muted ? MicOffGlyph : MicGlyph

	return (
		<div role="group" aria-label={words.call} {...stylex.props(styles.box, sx)}>
			<LiveDot sx={styles.dot} />
			<span>{muted ? words.muted : words[status]}</span>
			<span {...stylex.props(styles.timer)}>{formatClock(seconds)}</span>
			<IconButton
				label={words.mute}
				aria-pressed={muted}
				onClick={() => onMute(!muted)}
				sx={muted && styles.mutedButton}
			>
				<Glyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
			<IconButton label={words.hangUp} onClick={onHangUp} sx={styles.hangUp}>
				<PhoneOffGlyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
		</div>
	)
}
