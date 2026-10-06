import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, shadow, space } from "../../tokens.stylex"

const styles = stylex.create({
	// A card on the sheet: rest elevation, its ring is the only edge. `surfaceRaised` is white on
	// the light sheet and one step up on the dark one, like every other rest card.
	base: {
		backgroundColor: color.surfaceRaised,
		borderRadius: corner.card,
		boxShadow: shadow.rest,
		color: color.text,
		padding: space.lg,
	},
})

type CardProps = ComponentProps<"div"> & { sx?: StyleArg }

export function Card({ sx, ...props }: CardProps) {
	return <div {...props} {...styled(props, styles.base, sx)} />
}
