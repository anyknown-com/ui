import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, radius, space } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		padding: space.lg,
	},
})

type CardProps = ComponentProps<"div"> & { sx?: StyleArg }

export function Card({ sx, ...props }: CardProps) {
	return <div {...props} {...styled(props, styles.base, sx)} />
}
