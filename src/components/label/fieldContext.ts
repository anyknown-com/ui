import { createContext, useContext } from "react"

export type FieldContextValue = {
	controlId: string
	describedBy?: string
	invalid: boolean
	required: boolean
	disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

type ControlProps = {
	id?: string
	"aria-describedby"?: string
	required?: boolean
	disabled?: boolean
}

export type FieldControlProps = {
	id?: string
	"aria-describedby"?: string
	"aria-invalid"?: true
	required?: boolean
	disabled?: boolean
}

export function useFieldControl(props: ControlProps): FieldControlProps {
	const field = useContext(FieldContext)
	if (!field) return {}
	return {
		id: props.id ?? field.controlId,
		"aria-describedby": props["aria-describedby"] ?? field.describedBy,
		"aria-invalid": field.invalid || undefined,
		required: props.required ?? field.required,
		disabled: props.disabled ?? field.disabled,
	}
}
