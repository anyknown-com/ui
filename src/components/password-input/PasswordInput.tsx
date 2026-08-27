import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type KeyboardEvent, useId, useState } from "react"
import { styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, font, radius, space, text } from "../../tokens.stylex"
import { controlStyles } from "../input/Input"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	field: { position: "relative" },
	input: { paddingInlineEnd: "2.4rem" },
	toggle: {
		all: "unset",
		position: "absolute",
		insetInlineEnd: space.xxs,
		insetBlockStart: "50%",
		translate: "0 -50%",
		display: "grid",
		placeItems: "center",
		width: "1.75rem",
		height: "1.75rem",
		borderRadius: radius.sm,
		color: color.textMuted,
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	meter: { display: "grid", gap: space.xxs, marginTop: space.xxs },
	bars: { display: "flex", gap: space.xxs },
	bar: {
		height: "0.25rem",
		flex: 1,
		borderRadius: radius.full,
		backgroundColor: color.border,
		transitionProperty: "background-color",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
	},
	barWeak: { backgroundColor: color.danger },
	barFair: { backgroundColor: color.warning },
	barStrong: { backgroundColor: color.accent },
	label: { fontFamily: font.body, fontSize: text.xs, color: color.textMuted, minHeight: "1.2em", margin: 0 },
	labelWeak: { color: color.danger },
	warningIcon: { color: color.warning, flex: "none" },
	caps: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		backgroundColor: color.warningSubtle,
		color: color.text,
		borderRadius: radius.sm,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: text.xs,
		marginTop: space.xxs,
	},
	error: { fontFamily: font.body, fontSize: text.xs, color: color.danger, margin: 0, marginTop: space.xxs },
	srOnly: {
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
})

const LEVEL_LABELS = [
	"passphrase 無法找回,忘了就只能靠復原金鑰。",
	"弱 — 再長一點。",
	"可 — 建議混入更多種字元。",
	"強",
	"很強",
]

/** Length thresholds (8 / 12 / 20) × character classes. 12 matches storage's MIN_LENGTH. */
export function defaultScorer(value: string): number {
	if (!value) return 0
	let classes = 0
	for (const pattern of [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]) if (pattern.test(value)) classes += 1
	if (value.length < 8) return 1
	if (value.length < 12) return classes >= 3 ? 2 : 1
	if (value.length < 20) return classes >= 3 ? 3 : 2
	return classes >= 2 ? 4 : 3
}

const BAR_TONE = [null, styles.barWeak, styles.barFair, styles.barStrong, styles.barStrong] as const

function EyeIcon({ off }: { off: boolean }) {
	return off ? (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M2 12s3.5-7 10-7c1.8 0 3.4.5 4.7 1.3M22 12s-3.5 7-10 7c-1.8 0-3.4-.5-4.7-1.3M3 3l18 18" />
		</svg>
	) : (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function WarningIcon() {
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
			<path d="m12 3 10 18H2L12 3Z" />
			<path d="M12 10v4m0 3h.01" />
		</svg>
	)
}

export type PasswordInputProps = Omit<ComponentProps<"input">, "type" | "size" | "value"> & {
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	meter?: boolean
	scorer?: (value: string) => number
	levelLabels?: string[]
	capsLockWarning?: boolean
	capsLockLabel?: string
	confirmOf?: string
	mismatchLabel?: string
	showLabel?: string
	hideLabel?: string
	shownStatus?: string
	invalid?: boolean
}

export function PasswordInput({
	value,
	defaultValue = "",
	onValueChange,
	meter = false,
	scorer = defaultScorer,
	levelLabels = LEVEL_LABELS,
	capsLockWarning = true,
	capsLockLabel = "Caps Lock 開著。",
	confirmOf,
	mismatchLabel = "兩次輸入的 passphrase 不一樣。",
	showLabel = "顯示 passphrase",
	hideLabel = "隱藏 passphrase",
	shownStatus = "passphrase 已顯示",
	invalid,
	autoComplete = "new-password",
	...props
}: PasswordInputProps) {
	const base = useId()
	const meterId = `${base}meter`
	const capsId = `${base}caps`
	const errorId = `${base}error`

	const { invalid: fieldInvalid, ...field } = useFieldControl(props)
	const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange)
	const [revealed, setRevealed] = useState(false)
	const [capsOn, setCapsOn] = useState(false)

	const mismatched = confirmOf != null && current.length > 0 && current !== confirmOf
	const isInvalid = invalid ?? (mismatched || fieldInvalid)
	const level = meter ? scorer(current) : 0

	const describedBy = [
		meter ? meterId : null,
		capsLockWarning && capsOn ? capsId : null,
		mismatched ? errorId : null,
		field["aria-describedby"],
	]
		.filter(Boolean)
		.join(" ")

	function readCapsLock(event: KeyboardEvent<HTMLInputElement>) {
		if (!capsLockWarning || typeof event.getModifierState !== "function") return
		setCapsOn(event.getModifierState("CapsLock"))
	}

	return (
		<div>
			<div {...stylex.props(styles.field)}>
				<input
					{...props}
					{...field}
					type={revealed ? "text" : "password"}
					autoComplete={autoComplete}
					value={current}
					aria-invalid={isInvalid || undefined}
					aria-describedby={describedBy || undefined}
					onChange={(event) => {
						setCurrent(event.currentTarget.value)
						props.onChange?.(event)
					}}
					onKeyDown={(event) => {
						readCapsLock(event)
						props.onKeyDown?.(event)
					}}
					onKeyUp={(event) => {
						readCapsLock(event)
						props.onKeyUp?.(event)
					}}
					onBlur={(event) => {
						setCapsOn(false)
						props.onBlur?.(event)
					}}
					{...styled(
						props,
						controlStyles.base,
						controlStyles.md,
						styles.input,
						isInvalid && controlStyles.invalid,
					)}
				/>
				<button
					type="button"
					aria-label={revealed ? hideLabel : showLabel}
					aria-pressed={revealed}
					onClick={(event) => {
						setRevealed((shown) => !shown)
						event.currentTarget.parentElement?.querySelector("input")?.focus()
					}}
					{...stylex.props(styles.toggle)}
				>
					<EyeIcon off={revealed} />
				</button>
			</div>
			{meter && (
				<div id={meterId} {...stylex.props(styles.meter)}>
					<div aria-hidden="true" {...stylex.props(styles.bars)}>
						{[0, 1, 2, 3].map((index) => (
							<i key={index} {...stylex.props(styles.bar, index < level && BAR_TONE[level])} />
						))}
					</div>
					<p aria-live="polite" {...stylex.props(styles.label, level === 1 && styles.labelWeak)}>
						{levelLabels[level] ?? ""}
					</p>
				</div>
			)}
			{capsLockWarning && (
				<p id={capsId} role="status" {...stylex.props(capsOn ? styles.caps : styles.srOnly)}>
					{capsOn && (
						<>
							<WarningIcon />
							{capsLockLabel}
						</>
					)}
				</p>
			)}
			<p id={errorId} {...stylex.props(mismatched ? styles.error : styles.srOnly)}>
				{mismatched ? mismatchLabel : ""}
			</p>
			<span role="status" {...stylex.props(styles.srOnly)}>
				{revealed ? shownStatus : ""}
			</span>
		</div>
	)
}
