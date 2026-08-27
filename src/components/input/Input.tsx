import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { styled } from "../../lib/styled"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"
import { useFieldControl } from "../label/fieldContext"

export const controlStyles = stylex.create({
	base: {
		width: "100%",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: {
			default: color.border,
			":hover:not(:disabled)": color.borderStrong,
			":focus-visible": color.focusRing,
		},
		borderRadius: radius.md,
		color: color.text,
		fontFamily: font.body,
		fontSize: text.sm,
		lineHeight: text.leadingNormal,
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, "@media (prefers-reduced-motion: reduce)": "0s" },
		transitionTimingFunction: motion.ease,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
		cursor: { default: "auto", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.5 },
		"::placeholder": { color: color.textFaint },
	},
	invalid: {
		borderColor: { default: color.danger, ":hover:not(:disabled)": color.danger },
		outlineColor: color.danger,
	},
	md: { minHeight: "2.25rem", paddingBlock: space.xs, paddingInline: space.sm },
	sm: { minHeight: "1.75rem", paddingBlock: space.xxs, paddingInline: space.xs, fontSize: text.xs },
})

const styles = stylex.create({
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
	leadingIcon?: ReactNode
}

export function Input({ size = "md", invalid, leadingIcon, ...props }: InputProps) {
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
				Boolean(leadingIcon) && (size === "sm" ? styles.withIconSm : styles.withIconMd),
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
