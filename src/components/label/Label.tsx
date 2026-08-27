import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { styled } from "../../lib/styled"
import { color, font, text } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		display: "flex",
		alignItems: "baseline",
		gap: "0.35rem",
		fontFamily: font.body,
		fontSize: text.sm,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		color: color.text,
	},
	required: { color: color.danger },
	optional: { fontWeight: 400, fontSize: text.xs, color: color.textFaint },
})

export type LabelProps = ComponentProps<"label"> & {
	required?: boolean
	optional?: boolean
	optionalLabel?: string
}

export function Label({ required, optional, optionalLabel = "選填", children, ...props }: LabelProps) {
	return (
		<label {...props} {...styled(props, styles.base)}>
			{children}
			{required && (
				<span aria-hidden="true" {...stylex.props(styles.required)}>
					*
				</span>
			)}
			{optional && <span {...stylex.props(styles.optional)}> {optionalLabel}</span>}
		</label>
	)
}
