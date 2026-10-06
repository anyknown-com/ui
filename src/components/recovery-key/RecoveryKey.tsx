import * as stylex from "@stylexjs/stylex"
import { Fragment, type ReactNode, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { useCopy } from "../../lib/useCopy"
import { color, corner, focusRing, font, motion, shadow, space, type } from "../../tokens.stylex"
import { Checkbox } from "../checkbox/Checkbox"
import { CheckGlyph, Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	// rest 階的卡片:surfaceRaised,淺色是白紙,暗色底色升一階
	card: {
		backgroundColor: color.surfaceRaised,
		borderRadius: corner.card,
		boxShadow: shadow.rest,
		padding: space.md,
		display: "grid",
		gap: space.sm,
		fontFamily: font.body,
	},
	intro: { margin: 0, fontSize: type.t1, color: color.textMuted },
	keyBox: {
		position: "relative",
		// 卡片裡凹下去的一塊,不加框
		backgroundColor: color.surface,
		borderRadius: corner.small,
		padding: space.md,
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -1,
		"--ak-key-blur": { default: "blur(7px)", ":hover": "none", ":focus-visible": "none" },
		"--ak-veil-opacity": { default: "1", ":hover": "0", ":focus-visible": "0" },
	},
	keyRevealed: { "--ak-key-blur": "none", "--ak-veil-opacity": "0" },
	separator: {
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
	groups: {
		display: "flex",
		flexWrap: "wrap",
		gap: `${space.xxs} ${space.xs}`,
		justifyContent: "center",
		fontFamily: font.mono,
		fontSize: type.t3,
		fontWeight: 500,
		lineHeight: type.body,
		letterSpacing: "0.06em",
		userSelect: "all",
		color: color.text,
		filter: "var(--ak-key-blur)",
		transitionProperty: "filter",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
	},
	veil: {
		position: "absolute",
		inset: 0,
		display: "grid",
		placeItems: "center",
		fontSize: type.t1,
		color: color.textMuted,
		pointerEvents: "none",
		opacity: "var(--ak-veil-opacity)",
	},
	actions: { display: "flex", gap: space.xs, justifyContent: "center", flexWrap: "wrap" },
	button: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		// secondary 膠囊:凹下去的 accentSubtle 底,無框
		backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 },
		borderWidth: 0,
		borderRadius: corner.pill,
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: 1,
		height: "2rem",
		paddingInline: space.sm,
		cursor: "pointer",
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 1,
	},
	copied: { color: color.success },
	warning: {
		display: "flex",
		gap: space.xs,
		backgroundColor: color.warningSubtle,
		color: color.text,
		borderRadius: corner.small,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontSize: type.t2,
	},
	warningIcon: { color: color.warning, flex: "none", marginTop: "0.1rem" },
	warningText: { margin: 0 },
})

function CopyIcon() {
	return (
		<Glyph width={13} height={13}>
			<rect x="9" y="9" width="12" height="12" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</Glyph>
	)
}

function DownloadIcon() {
	return (
		<Glyph width={13} height={13}>
			<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
		</Glyph>
	)
}

function WarningIcon() {
	return (
		<Glyph width={14} height={14} {...stylex.props(styles.warningIcon)}>
			<path d="m12 3 10 18H2L12 3Z" />
			<path d="M12 10v4m0 3h.01" />
		</Glyph>
	)
}

const strings = defineStrings({
	"zh-TW": {
		intro: "這是你的復原金鑰。忘記 passphrase 時,它是唯一能開回 vault 的東西 — 只會顯示這一次。",
		warning: "我們沒有你的金鑰副本,遺失就無法復原。把它抄在紙上,或存進密碼管理器。",
		ack: "我已把復原金鑰抄下並存放在安全的地方。",
		reveal: "顯示復原金鑰",
		hide: "隱藏復原金鑰",
		veil: "hover 或點一下顯示",
		copy: "複製",
		copied: "已複製",
		download: "下載 .txt",
	},
	en: {
		intro:
			"This is your recovery key. If you forget your passphrase, it is the only way back into your vault — and it is shown only this once.",
		warning:
			"We don't keep a copy of your key, so if you lose it, it can't be recovered. Write it down on paper or save it in a password manager.",
		ack: "I've written down my recovery key and stored it somewhere safe.",
		reveal: "Show recovery key",
		hide: "Hide recovery key",
		veil: "Hover or tap to show",
		copy: "Copy",
		copied: "Copied",
		download: "Download .txt",
	},
})

/**
 * RecoveryKey's built-in words (follow `<LocaleProvider>`): the intro, warning and
 * acknowledgement, the reveal / copy / download buttons and the veil hint. Override any with `labels`.
 */
export type RecoveryKeyLabels = StringsOf<typeof strings>

export type RecoveryKeyProps = {
	/** The recovery key, dash-separated groups (`K7PQ-WM2X-…`). */
	value: string
	/** Whether the acknowledgement checkbox is ticked (controlled). */
	ack?: boolean
	/** Called when the acknowledgement checkbox changes. */
	onAckChange?: (ack: boolean) => void
	/** The downloaded file's name. */
	filename?: string
	/** The text above the key. Wins over `labels.intro`. */
	intro?: ReactNode
	/** The warning note under the buttons. Wins over `labels.warning`. */
	warning?: ReactNode
	/** The acknowledgement checkbox's label. Wins over `labels.ack`. */
	ackLabel?: ReactNode
	/** The reveal button while the key is blurred. Wins over `labels.reveal`. */
	revealLabel?: string
	/** The reveal button while the key is shown. Wins over `labels.hide`. */
	hideLabel?: string
	/** The hint over the blurred key. Wins over `labels.veil`. */
	veilLabel?: string
	/** The copy button. Wins over `labels.copy`. */
	copyLabel?: string
	/** The copy button right after copying. Wins over `labels.copied`. */
	copiedLabel?: string
	/** The download button. Wins over `labels.download`. */
	downloadLabel?: string
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<RecoveryKeyLabels>
}

/** Shows a one-time recovery key, blurred until hovered or revealed, with copy, download and an acknowledgement. */
export function RecoveryKey({
	value,
	ack,
	onAckChange,
	filename = "anyknown-storage-recovery-key.txt",
	intro,
	warning,
	ackLabel,
	revealLabel,
	hideLabel,
	veilLabel,
	copyLabel,
	copiedLabel,
	downloadLabel,
	labels,
}: RecoveryKeyProps) {
	const t = useStrings(strings, labels)
	const [revealed, setRevealed] = useState(false)
	const { copied, copy } = useCopy()
	const copiedWord = copiedLabel ?? t.copied

	function download() {
		const url = URL.createObjectURL(new Blob([`${value}\n`], { type: "text/plain" }))
		const anchor = Object.assign(document.createElement("a"), { href: url, download: filename })
		anchor.click()
		setTimeout(() => URL.revokeObjectURL(url), 0)
	}

	return (
		<div {...stylex.props(styles.card)}>
			<p {...stylex.props(styles.intro)}>{intro ?? t.intro}</p>
			<div {...stylex.props(styles.keyBox, revealed && styles.keyRevealed)}>
				{/* The key itself is plain text so screen readers can read it out; the
				    blur is purely visual and the reveal is the button below. */}
				<div {...stylex.props(styles.groups)}>
					{value.split("-").map((group, index) => (
						<Fragment key={`${group}-${index}`}>
							{index > 0 && <span {...stylex.props(styles.separator)}>-</span>}
							<span>{group}</span>
						</Fragment>
					))}
				</div>
				<span aria-hidden="true" {...stylex.props(styles.veil)}>
					{veilLabel ?? t.veil}
				</span>
			</div>
			<div {...stylex.props(styles.actions)}>
				<button
					type="button"
					aria-pressed={revealed}
					onClick={() => setRevealed((shown) => !shown)}
					{...stylex.props(styles.button)}
				>
					{revealed ? (hideLabel ?? t.hide) : (revealLabel ?? t.reveal)}
				</button>
				<button
					type="button"
					onClick={() => copy(value)}
					{...stylex.props(styles.button, copied && styles.copied)}
				>
					{copied ? <CheckGlyph width={13} height={13} /> : <CopyIcon />}
					{copied ? copiedWord : (copyLabel ?? t.copy)}
				</button>
				<button type="button" onClick={download} {...stylex.props(styles.button)}>
					<DownloadIcon />
					{downloadLabel ?? t.download}
				</button>
			</div>
			{/* 按鈕自己的字換掉不一定會被唸;另放一個一直掛著的 status,複製成功時唸一次 */}
			<span role="status" {...stylex.props(styles.separator)}>
				{copied ? copiedWord : ""}
			</span>
			<div role="note" {...stylex.props(styles.warning)}>
				<WarningIcon />
				<p {...stylex.props(styles.warningText)}>{warning ?? t.warning}</p>
			</div>
			<Checkbox checked={ack} onCheckedChange={onAckChange} label={ackLabel ?? t.ack} />
		</div>
	)
}
