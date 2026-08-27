import { type AriaAttributes, createContext, useContext } from "react"

export type FieldContextValue = {
	controlId: string
	describedBy?: string
	invalid: boolean
	required: boolean
	disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

type ControlProps = {
	"aria-describedby"?: string
	"aria-invalid"?: AriaAttributes["aria-invalid"]
	required?: boolean
	disabled?: boolean
}

export type FieldControlProps = {
	id?: string
	"aria-describedby"?: string
	required?: boolean
	disabled?: boolean
}

/** A Field owns its control's id, so a caller-supplied `id` is ignored inside one. */
export function useFieldControl(props: ControlProps): FieldControlProps & { invalid: boolean } {
	const field = useContext(FieldContext)
	const ownInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"
	if (!field) return { invalid: ownInvalid }
	return {
		id: field.controlId,
		"aria-describedby": props["aria-describedby"] ?? field.describedBy,
		required: props.required ?? field.required,
		disabled: props.disabled ?? field.disabled,
		invalid: ownInvalid || field.invalid,
	}
}
