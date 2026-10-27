import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, Ref } from "react"
import { type StyleArg, reset, styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { XGlyph } from "../icon/glyphs"

const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	// 字加可選的 6px 點:沒有底、框、環,顏色只標狀態
	base: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontFamily: font.body,
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: 1,
		paddingBlock: space.xxs,
	},
	neutral: { color: color.textMuted },
	mono: { fontFamily: font.mono, color: color.textMuted, letterSpacing: "0.02em" },
	// live = 正在做(跟 StatusBadge 的 live 同名)
	live: { color: color.signal },
	success: { color: color.success },
	warning: { color: color.warning },
	danger: { color: color.danger },
	dot: {
		width: 6,
		height: 6,
		borderRadius: corner.shape,
		backgroundColor: "currentColor",
		forcedColorAdjust: { default: null, [FORCED]: "none" },
		flex: "none",
	},
	count: { fontFamily: font.mono, fontSize: type.t1, fontWeight: 600, lineHeight: 1 },
	// 可按的 chip:一層 wash,形狀只給會按的東西
	chip: {
		minHeight: 28,
		paddingBlock: 0,
		paddingInline: space.sm,
		borderRadius: corner.shape,
		fontSize: type.t2,
		backgroundColor: color.wash,
		color: color.text,
	},
	pressable: {
		cursor: "pointer",
		backgroundColor: { default: color.wash, ":hover": color.washHover },
		transitionProperty: "background-color",
		transitionDuration: motion.fast,
		transitionTimingFunction: motion.linear,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	pressed: {
		backgroundColor: { default: color.washHover, ":hover": color.washHover },
		fontWeight: 600,
	},
	remove: {
		position: "relative",
		display: "grid",
		placeItems: "center",
		width: "1rem",
		height: "1rem",
		// 圓鈕比字高:負的 block margin 讓它不撐高 chip(跟其他 badge 等高)
		marginBlock: "-0.2rem",
		marginInlineEnd: "-0.2rem",
		borderRadius: corner.shape,
		cursor: "pointer",
		color: "inherit",
		opacity: { default: 0.7, ":hover": 1, ":focus-visible": 1 },
		backgroundColor: {
			default: "transparent",
			":hover": color.washHover,
		},
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 1,
		// 看起來 16px、可點 24px(WCAG 2.2 target size),不影響版面
		"::after": { content: '""', position: "absolute", inset: "-0.25rem" },
	},
})

export type BadgeProps = Omit<ComponentProps<"span">, "color"> & {
	/** The words' colour: `neutral` grey, `mono` grey in the mono face, `live` blue (doing), `success` green, `warning` amber (waiting on you), `danger` red. @default "neutral" */
	variant?: "neutral" | "mono" | "live" | "success" | "warning" | "danger"
	/** A 6px dot before the words, in the same colour. */
	dot?: boolean
	/** A number after the words, in the mono face. */
	count?: number
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** A short word, with an optional 6px dot, that marks a status, category or count. Native `<span>` props pass through. */
export function Badge({ variant = "neutral", dot, count, children, sx, ...props }: BadgeProps) {
	return (
		<span {...props} {...styled(props, styles.base, styles[variant], sx)}>
			{dot === true && <span aria-hidden="true" {...stylex.props(styles.dot)} />}
			{children}
			{count != null && <span {...stylex.props(styles.count)}>{count}</span>}
		</span>
	)
}

/** removeLabel 只有在真的有 × 的時候才必填 —— 沒有按鈕就沒有要唸的東西。 */
export type ChipProps = Omit<BadgeProps, "ref" | "variant" | "dot"> &
	(
		| {
				/** Shows a × button that calls this, for removing the chip (a filter, a tag). */
				onRemove: () => void
				/** The × button's accessible name ("Remove filter"); required with `onRemove`. */
				removeLabel: string
		  }
		| {
				/** Shows a × button that calls this, for removing the chip (a filter, a tag). */
				onRemove?: undefined
				/** The × button's accessible name ("Remove filter"); required with `onRemove`. */
				removeLabel?: string
		  }
	) & {
		/** Makes the chip a real `<button>`; without it (or a pressed state) the chip is a label. */
		onClick?: () => void
		/** On or off, for a controlled toggle chip (`aria-pressed`). Pair it with `onPressedChange`. */
		pressed?: boolean
		/** Whether a toggle chip starts on, for an uncontrolled one. */
		defaultPressed?: boolean
		/** Called with the next state when a toggle chip is pressed. Giving it makes the chip a toggle. */
		onPressedChange?: (pressed: boolean) => void
		/** The chip's element: a `<span>`, or the `<button>` when the chip can be pressed. */
		ref?: Ref<HTMLSpanElement | HTMLButtonElement>
	}

/**
 * A badge you can act on: a filter with a × to remove it (`onRemove`), a button (`onClick`), or
 * a toggle (`pressed` / `defaultPressed` / `onPressedChange`, read out with `aria-pressed`).
 */
export function Chip({
	onRemove,
	removeLabel,
	onClick,
	pressed,
	defaultPressed,
	onPressedChange,
	children,
	sx,
	ref,
	...props
}: ChipProps) {
	const toggle = pressed !== undefined || defaultPressed !== undefined || onPressedChange != null
	const [isPressed, setPressed] = useControllableState(pressed, defaultPressed ?? false, onPressedChange)
	const body = (
		<>
			{children}
			{onRemove != null && (
				<button
					type="button"
					aria-label={removeLabel}
					onClick={onRemove}
					{...stylex.props(reset.control, styles.remove)}
				>
					<XGlyph width={12} height={12} />
				</button>
			)}
		</>
	)

	if (onClick == null && !toggle) {
		return (
			<span
				ref={ref as Ref<HTMLSpanElement> | undefined}
				{...props}
				{...styled(props, styles.base, styles.chip, sx)}
			>
				{body}
			</span>
		)
	}
	return (
		<button
			ref={ref as Ref<HTMLButtonElement> | undefined}
			type="button"
			aria-pressed={toggle ? isPressed : undefined}
			onClick={() => {
				if (toggle) setPressed(!isPressed)
				onClick?.()
			}}
			{...props}
			{...styled(
				props,
				reset.control,
				styles.base,
				styles.chip,
				styles.pressable,
				toggle && isPressed && styles.pressed,
				sx,
			)}
		>
			{body}
		</button>
	)
}
