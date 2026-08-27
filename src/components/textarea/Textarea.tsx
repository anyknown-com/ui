import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { space, text } from "../../tokens.stylex"
import { controlStyles } from "../input/Input"
import { useFieldControl } from "../label/fieldContext"

const styles = stylex.create({
	base: {
		minHeight: "4.5rem",
		paddingBlock: space.xs,
		paddingInline: space.sm,
		lineHeight: text.leadingRelaxed,
		resize: "vertical",
	},
	autoGrow: { fieldSizing: "content", resize: "none" },
	maxRows: (rows: number) => ({ maxHeight: `calc(${rows} * 1.6em + ${space.md})` }),
})

export type TextareaProps = ComponentProps<"textarea"> & {
	autoGrow?: boolean
	maxRows?: number
	invalid?: boolean
}

export function Textarea({ autoGrow, maxRows, invalid, ...props }: TextareaProps) {
	const field = useFieldControl(props)
	const isInvalid = invalid ?? field["aria-invalid"] === true
	return (
		<textarea
			{...props}
			{...field}
			aria-invalid={isInvalid || undefined}
			{...stylex.props(
				controlStyles.base,
				styles.base,
				autoGrow && styles.autoGrow,
				maxRows != null && styles.maxRows(maxRows),
				isInvalid && controlStyles.invalid,
			)}
		/>
	)
}
