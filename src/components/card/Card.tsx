import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, shadow, space, tone } from "../../tokens.stylex"

const styles = stylex.create({
	// A card on the sheet: rest elevation, its ring is the only edge. White on the light sheet,
	// one step up (`surface`) on the dark one; `tone.railLayer2` is that pair.
	base: {
		backgroundColor: tone.railLayer2,
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
