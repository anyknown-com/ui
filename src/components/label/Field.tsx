import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId, useMemo } from "react"
import { styled } from "../../lib/styled"
import { color, font, space, text } from "../../tokens.stylex"
import { FieldContext } from "./fieldContext"
import { Label } from "./Label"

const styles = stylex.create({
	group: { display: "grid", gap: space.xxs },
	dimmed: { opacity: { default: 1, ":has(:disabled)": 0.5 } },
	help: { margin: 0, fontFamily: font.body, fontSize: text.xs, color: color.textMuted },
	error: { margin: 0, fontFamily: font.body, fontSize: text.xs, color: color.danger },
})

export type FieldProps = Omit<ComponentProps<"div">, "children"> & {
	label?: ReactNode
	help?: ReactNode
	error?: ReactNode
	required?: boolean
	optional?: boolean
	disabled?: boolean
	children: ReactNode
}

export function Field({
	label,
	help,
	error,
	required = false,
	optional,
	disabled = false,
	children,
	...props
}: FieldProps) {
	const base = useId()
	const controlId = `${base}control`
	const helpId = `${base}help`
	const errorId = `${base}error`
	const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ")

	const value = useMemo(
		() => ({
			controlId,
			describedBy: describedBy || undefined,
			invalid: Boolean(error),
			required,
			disabled,
		}),
		[controlId, describedBy, error, required, disabled],
	)

	return (
		<div {...props} {...styled(props, styles.group, styles.dimmed)}>
			<FieldContext value={value}>
				{label != null && (
					<Label htmlFor={controlId} required={required} optional={optional}>
						{label}
					</Label>
				)}
				{children}
				{error != null && (
					<p id={errorId} role="alert" {...stylex.props(styles.error)}>
						{error}
					</p>
				)}
				{help != null && (
					<p id={helpId} {...stylex.props(styles.help)}>
						{help}
					</p>
				)}
			</FieldContext>
		</div>
	)
}
