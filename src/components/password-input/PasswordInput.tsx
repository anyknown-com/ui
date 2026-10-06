import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type KeyboardEvent, useId, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { reset, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { controlStyles } from "../input/Input"
import { useFieldControl } from "../label/fieldContext"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	field: { position: "relative" },
	input: { paddingInlineEnd: "2.4rem" },
	toggle: {
		position: "absolute",
		insetInlineEnd: space.xxs,
		insetBlockStart: "50%",
		translate: "0 -50%",
		display: "grid",
		placeItems: "center",
		width: "1.75rem",
		height: "1.75rem",
		borderRadius: corner.pill,
		color: color.textMuted,
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
	},
	meter: { display: "grid", gap: space.xxs, marginTop: space.xxs },
	bars: { display: "flex", gap: space.xxs },
	// forced colors 會把底色換掉:空格只剩框,填滿的塗成 CanvasText,格數仍看得出來
	bar: {
		height: "0.25rem",
		flex: 1,
		borderRadius: corner.pill,
		backgroundColor: { default: color.border, [FORCED]: "Canvas" },
		forcedColorAdjust: "none",
		outline: { default: null, [FORCED]: "1px solid GrayText" },
		outlineOffset: -1,
		transitionProperty: "background-color",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
	},
	barWeak: { backgroundColor: { default: color.danger, [FORCED]: "CanvasText" } },
	barFair: { backgroundColor: { default: color.warning, [FORCED]: "CanvasText" } },
	barStrong: { backgroundColor: { default: color.accent, [FORCED]: "CanvasText" } },
	label: { fontFamily: font.body, fontSize: type.t1, color: color.textMuted, minHeight: "1.2em", margin: 0 },
	labelWeak: { color: color.danger },
	warningIcon: { color: color.warning, flex: "none" },
	caps: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		backgroundColor: color.warningSubtle,
		color: color.text,
		borderRadius: corner.small,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: type.t1,
		marginTop: space.xxs,
	},
	error: { fontFamily: font.body, fontSize: type.t1, color: color.danger, margin: 0, marginTop: space.xxs },
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

const strings = defineStrings({
	"zh-TW": {
		show: "顯示 passphrase",
		shown: "passphrase 已顯示",
		capsLock: "Caps Lock 開著。",
		mismatch: "再輸入一次同樣的 passphrase。",
		levelEmpty: "至少 12 個字元。",
		levelWeak: "弱，至少要 12 個字元。",
		levelFair: "可 — 建議混入更多種字元。",
		levelStrong: "強",
		levelVeryStrong: "很強",
	},
	en: {
		show: "Show passphrase",
		shown: "Passphrase shown",
		capsLock: "Caps Lock is on.",
		mismatch: "Enter the same passphrase again.",
		levelEmpty: "At least 12 characters.",
		levelWeak: "Weak — use at least 12 characters.",
		levelFair: "Fair — mix in more kinds of characters.",
		levelStrong: "Strong",
		levelVeryStrong: "Very strong",
	},
})

/**
 * PasswordInput's built-in words (follow `<LocaleProvider>`): the reveal toggle, the strength
 * word for each level 0–4 (`levelEmpty` doubles as the length requirement hint), the Caps Lock
 * warning and the confirm mismatch. Override any with `labels`.
 */
export type PasswordInputLabels = StringsOf<typeof strings>

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
	/** The passphrase (controlled). */
	value?: string
	/** The starting passphrase when uncontrolled. */
	defaultValue?: string
	/** Called with the new passphrase on every edit. */
	onValueChange?: (value: string) => void
	/** Shows a four-segment strength meter and its word under the field. */
	meter?: boolean
	/** Maps the passphrase to a strength level 0–4; the meter fills that many segments. */
	scorer?: (value: string) => number
	/** One word per level 0–4, indexed by `scorer`'s result. Wins over the `level*` labels. */
	levelLabels?: string[]
	/** Warns while Caps Lock is on. */
	capsLockWarning?: boolean
	/** The Caps Lock warning. Wins over `labels.capsLock`. */
	capsLockLabel?: string
	/** The passphrase this field must repeat; a difference marks the field invalid. */
	confirmOf?: string
	/** The message when the field does not match `confirmOf`. Wins over `labels.mismatch`. */
	mismatchLabel?: string
	/**
	 * The reveal toggle's name. It stays the same while the passphrase is shown; `aria-pressed`
	 * says which state it is in. Wins over `labels.show`.
	 */
	showLabel?: string
	/** Announced when the passphrase is revealed. Wins over `labels.shown`. */
	shownStatus?: string
	/** Forces the invalid state; otherwise it follows the mismatch and the enclosing field. */
	invalid?: boolean
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<PasswordInputLabels>
}

/** A passphrase field with a reveal toggle, an optional strength meter, a Caps Lock warning and a confirm check. */
export function PasswordInput({
	value,
	defaultValue = "",
	onValueChange,
	meter = false,
	scorer = defaultScorer,
	levelLabels,
	capsLockWarning = true,
	capsLockLabel,
	confirmOf,
	mismatchLabel,
	showLabel,
	shownStatus,
	invalid,
	labels,
	autoComplete = "new-password",
	...props
}: PasswordInputProps) {
	const t = useStrings(strings, labels)
	const levelWords = levelLabels ?? [t.levelEmpty, t.levelWeak, t.levelFair, t.levelStrong, t.levelVeryStrong]
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
		// Inside a Field this is the caller's or the field's ids; outside one, the caller's own
		field["aria-describedby"] ?? props["aria-describedby"],
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
					aria-label={showLabel ?? t.show}
					aria-pressed={revealed}
					onClick={(event) => {
						setRevealed((shown) => !shown)
						event.currentTarget.parentElement?.querySelector("input")?.focus()
					}}
					{...stylex.props(reset.control, styles.toggle)}
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
						{levelWords[level] ?? ""}
					</p>
				</div>
			)}
			{capsLockWarning && (
				<p id={capsId} role="status" {...stylex.props(capsOn ? styles.caps : styles.srOnly)}>
					{capsOn && (
						<>
							<WarningIcon />
							{capsLockLabel ?? t.capsLock}
						</>
					)}
				</p>
			)}
			<p id={errorId} {...stylex.props(mismatched ? styles.error : styles.srOnly)}>
				{mismatched ? (mismatchLabel ?? t.mismatch) : ""}
			</p>
			<span role="status" {...stylex.props(styles.srOnly)}>
				{revealed ? (shownStatus ?? t.shown) : ""}
			</span>
		</div>
	)
}
