import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, font, motion, space, text, type } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

// 輸入框是紙上凹下去的一格:surface 底 + 1px border(邊界要 3:1 才看得到,只靠底色不夠)。
// focus 時框換 focusRing(= signal),外面再加一圈 2px 的淡環。
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
		fontSize: text.sm,
		// 單行控件的行高只要裝得下字:行高一大,md 會被撐得比 button 的 2.5rem 高
		// (Textarea 自己蓋回 leadingRelaxed,多行照樣好讀)
		lineHeight: text.leadingTight,
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, "@media (prefers-reduced-motion: reduce)": "0s" },
		transitionTimingFunction: motion.ease,
		outline: {
			default: "none",
			":focus-visible": `2px solid color-mix(in srgb, ${color.focusRing} 32%, transparent)`,
		},
		outlineOffset: 0,
		cursor: { default: "auto", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		"::placeholder": { color: color.textFaint },
	},
	invalid: {
		borderColor: { default: color.danger, ":hover:not(:disabled)": color.danger },
		outlineColor: `color-mix(in srgb, ${color.danger} 32%, transparent)`,
	},
	// 跟 button 的 40 / 32 對齊
	md: { minHeight: "2.5rem", paddingBlock: space.xs, paddingInline: space.sm },
	sm: { minHeight: "2rem", paddingBlock: space.xxs, paddingInline: space.xs, fontSize: type.t2 },
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
	size?: "sm" | "md"
	invalid?: boolean
	/** Keys, URLs, ids: anything read character by character. */
	mono?: boolean
	leadingIcon?: ReactNode
	sx?: StyleArg
}

export function Input({ size = "md", invalid, mono = false, leadingIcon, sx, ...props }: InputProps) {
	const { invalid: fieldInvalid, ...field } = useFieldControl(props)
	const isInvalid = invalid ?? fieldInvalid
	const input = (
		<input
			{...props}
			{...field}
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
