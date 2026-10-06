import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, useId, useMemo } from "react"
import { styled } from "../../lib/styled"
import { color, font, space, type } from "../../tokens.stylex"
import { FieldContext } from "./fieldContext"
import { Label } from "./Label"

const styles = stylex.create({
	group: { display: "grid", gap: space.xxs },
	dimmed: { opacity: { default: 1, ":has(:disabled)": 0.5 } },
	help: { margin: 0, fontFamily: font.body, fontSize: type.t1, color: color.textMuted },
	error: { margin: 0, fontFamily: font.body, fontSize: type.t1, color: color.danger },
})

export type FieldProps = Omit<ComponentProps<"div">, "children"> & {
	/** The control's visible name, rendered as a `Label` tied to the control. */
	label?: ReactNode
	/** A muted hint under the control, linked to it with `aria-describedby`. */
	help?: ReactNode
	/** An error message under the control; when set, the control is marked invalid and the message is announced. */
	error?: ReactNode
	/** Marks the control as required and adds a red `*` to the label. @default false */
	required?: boolean
	/** Adds a muted "optional" after the label. */
	optional?: boolean
	/** Disables the control and dims the whole field. @default false */
	disabled?: boolean
	/** The one form control (`Input`, `Textarea`, …) the field labels and describes. */
	children: ReactNode
}

/** Wraps one form control with its label, help text and error, and wires the ids and ARIA between them. */
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
