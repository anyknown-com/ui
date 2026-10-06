import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { breakpoint, color, corner, font, motion, space, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

// 輸入框是紙上凹下去的一格:surface 底 + 1px border(邊界要 3:1 才看得到,只靠底色不夠)。
// focus 時框換 focusRing(= signal),外面再貼一圈 2px 實心的 focusRing:淡環對底色不到 3:1,
// 看不出焦點在哪。invalid 的框留 danger,焦點環照樣是 focusRing。
export const controlStyles = stylex.create({
	base: {
		width: "100%",
		// 沒有 border-box,minHeight 2.5rem 是「內容」40px,再加 padding+border;
		// 元件不能靠 app 端有沒有 `*{box-sizing:border-box}` reset
		boxSizing: "border-box",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: {
			default: color.borderControl,
			":focus-visible": color.focusRing,
		},
		borderRadius: corner.control,
		color: color.text,
		fontFamily: font.body,
		// iOS Safari 在 16px 以下的欄位 focus 時會放大整頁;手機上一律 16px,不靠 maximum-scale
		fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput },
		// 單行控件的行高只要裝得下字:行高一大,md 會被撐得比 button 的 2.5rem 高
		// (Textarea 自己蓋回 leadingRelaxed,多行照樣好讀)
		lineHeight: type.dense,
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, "@media (prefers-reduced-motion: reduce)": "0s" },
		transitionTimingFunction: motion.ease,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
		cursor: { default: "auto", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		// textFaint 只有 3.75:1,提示字要讀得到:textMuted(4.5:1 以上)
		"::placeholder": { color: color.textMuted },
	},
	invalid: {
		borderColor: { default: color.danger, ":hover:not(:disabled)": color.danger },
	},
	// 跟 button 的 40 / 32 對齊
	md: { minHeight: "2.5rem", paddingBlock: space.xs, paddingInline: space.sm },
	sm: {
		minHeight: "2rem",
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput },
	},
})

const styles = stylex.create({
	mono: { fontFamily: font.mono },
	affix: { position: "relative", display: "block", width: "100%" },
	icon: {
		position: "absolute",
		insetInlineStart: space.xs,
		insetBlockStart: "50%",
		transform: "translateY(-50%)",
		display: "flex",
		color: color.textFaint,
		pointerEvents: "none",
	},
	withIconMd: { paddingInlineStart: space.xl },
	withIconSm: { paddingInlineStart: space.lg },
})

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
	/** `md` is 40px, the height of a `md` button; `sm` is 32px. @default "md" */
	size?: "sm" | "md"
	/** Draws the danger border and sets `aria-invalid`. Inside a `Field` with an `error`, it is set for you. */
	invalid?: boolean
	/** Keys, URLs, ids: anything read character by character. */
	mono?: boolean
	/** An icon inside the start edge (a search glyph); decorative, hidden from screen readers. */
	leadingIcon?: ReactNode
	/** The new text on every edit, next to the native `onChange`. Use `value` / `defaultValue` as usual. */
	onValueChange?: (value: string) => void
	sx?: StyleArg
}

/** A one-line text field. Native `<input>` props pass through; inside a `Field` it is wired to the label, help and error. */
export function Input({
	size = "md",
	invalid,
	mono = false,
	leadingIcon,
	onValueChange,
	onChange,
	sx,
	...props
}: InputProps) {
	const { invalid: fieldInvalid, ...field } = useFieldControl(props)
	const isInvalid = invalid ?? fieldInvalid
	const input = (
		<input
			{...props}
			{...field}
			onChange={(event) => {
				onChange?.(event)
				onValueChange?.(event.currentTarget.value)
			}}
			aria-invalid={isInvalid || undefined}
			{...styled(
				props,
				controlStyles.base,
				controlStyles[size],
				isInvalid && controlStyles.invalid,
				mono && styles.mono,
				Boolean(leadingIcon) && (size === "sm" ? styles.withIconSm : styles.withIconMd),
				sx,
			)}
		/>
	)
	if (!leadingIcon) return input
	return (
		<span {...stylex.props(styles.affix)}>
			<span aria-hidden="true" {...stylex.props(styles.icon)}>
				{leadingIcon}
			</span>
			{input}
		</span>
	)
}
