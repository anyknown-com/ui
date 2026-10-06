import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, font, type } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		display: "flex",
		alignItems: "baseline",
		gap: "0.35rem",
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: type.snug,
		color: color.text,
	},
	required: { color: color.danger },
	optional: { fontWeight: 400, fontSize: type.t1, color: color.textMuted },
})

export type LabelProps = ComponentProps<"label"> & {
	required?: boolean
	optional?: boolean
	optionalLabel?: string
	sx?: StyleArg
}

export function Label({ required, optional, optionalLabel = "選填", children, sx, ...props }: LabelProps) {
	return (
		<label {...props} {...styled(props, styles.base, sx)}>
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
