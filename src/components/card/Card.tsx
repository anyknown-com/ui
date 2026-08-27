import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { styled } from "../../lib/styled"
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

export function Card(props: ComponentProps<"div">) {
	return <div {...props} {...styled(props, styles.base)} />
}
