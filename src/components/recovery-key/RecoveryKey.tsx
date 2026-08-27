import * as stylex from "@stylexjs/stylex"
import { Fragment, type ReactNode, useState } from "react"
import { useCopy } from "../../lib/useCopy"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"
import { Checkbox } from "../checkbox/Checkbox"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	card: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		padding: space.md,
		display: "grid",
		gap: space.sm,
		fontFamily: font.body,
	},
	intro: { margin: 0, fontSize: text.xs, color: color.textMuted },
	keyBox: {
		position: "relative",
		backgroundColor: color.bg,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		padding: space.md,
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
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
		fontSize: text.base,
		fontWeight: 500,
		lineHeight: text.leadingRelaxed,
		letterSpacing: "0.06em",
		userSelect: "all",
		color: color.text,
		filter: "var(--ak-key-blur)",
		transitionProperty: "filter",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
	},
	veil: {
		position: "absolute",
		inset: 0,
		display: "grid",
		placeItems: "center",
		fontSize: text.xs,
		color: color.textMuted,
		pointerEvents: "none",
		opacity: "var(--ak-veil-opacity)",
	},
	actions: { display: "flex", gap: space.xs, justifyContent: "center", flexWrap: "wrap" },
	button: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":hover": color.borderStrong },
		borderRadius: radius.md,
		color: color.text,
		fontFamily: font.body,
		fontSize: "0.82rem",
		fontWeight: 500,
		lineHeight: 1,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		cursor: "pointer",
		transitionProperty: "border-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
	},
	copied: { color: color.accent, borderColor: color.accent },
	warning: {
		display: "flex",
		gap: space.xs,
		backgroundColor: color.warningSubtle,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: `color-mix(in srgb, ${color.warning} 40%, transparent)`,
		borderRadius: radius.md,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontSize: "0.82rem",
	},
	warningIcon: { color: color.warning, flex: "none", marginTop: "0.1rem" },
	warningText: { margin: 0 },
})

function CopyIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<rect x="9" y="9" width="12" height="12" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</svg>
	)
}

function DownloadIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
		</svg>
	)
}

function WarningIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.warningIcon)}
		>
			<path d="m12 3 10 18H2L12 3Z" />
			<path d="M12 10v4m0 3h.01" />
		</svg>
	)
}

export type RecoveryKeyProps = {
	value: string
	ack?: boolean
	onAckChange?: (ack: boolean) => void
	filename?: string
	intro?: ReactNode
	warning?: ReactNode
	ackLabel?: ReactNode
	revealLabel?: string
	hideLabel?: string
	veilLabel?: string
	copyLabel?: string
	copiedLabel?: string
	downloadLabel?: string
}

export function RecoveryKey({
	value,
	ack,
	onAckChange,
	filename = "anyknown-storage-recovery-key.txt",
	intro = "這是你的復原金鑰。忘記 passphrase 時,它是唯一能開回 vault 的東西 — 只會顯示這一次。",
	warning = "我們沒有你的金鑰副本,遺失就無法復原。把它抄在紙上,或存進密碼管理器。",
	ackLabel = "我已把復原金鑰抄下並存放在安全的地方。",
	revealLabel = "顯示復原金鑰",
	hideLabel = "隱藏復原金鑰",
	veilLabel = "hover 或點一下顯示",
	copyLabel = "複製",
	copiedLabel = "✓ 已複製",
	downloadLabel = "下載 .txt",
}: RecoveryKeyProps) {
	const [revealed, setRevealed] = useState(false)
	const { copied, copy } = useCopy()

	function download() {
		const url = URL.createObjectURL(new Blob([`${value}\n`], { type: "text/plain" }))
		const anchor = Object.assign(document.createElement("a"), { href: url, download: filename })
		anchor.click()
		setTimeout(() => URL.revokeObjectURL(url), 0)
	}

	return (
		<div {...stylex.props(styles.card)}>
			<p {...stylex.props(styles.intro)}>{intro}</p>
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
					{veilLabel}
				</span>
			</div>
			<div {...stylex.props(styles.actions)}>
				<button
					type="button"
					aria-pressed={revealed}
					onClick={() => setRevealed((shown) => !shown)}
					{...stylex.props(styles.button)}
				>
					{revealed ? hideLabel : revealLabel}
				</button>
				<button
					type="button"
					onClick={() => copy(value)}
					{...stylex.props(styles.button, copied && styles.copied)}
				>
					{!copied && <CopyIcon />}
					{copied ? copiedLabel : copyLabel}
				</button>
				<button type="button" onClick={download} {...stylex.props(styles.button)}>
					<DownloadIcon />
					{downloadLabel}
				</button>
			</div>
			<div role="note" {...stylex.props(styles.warning)}>
				<WarningIcon />
				<p {...stylex.props(styles.warningText)}>{warning}</p>
			</div>
			<Checkbox checked={ack} onCheckedChange={onAckChange} label={ackLabel} />
		</div>
	)
}
