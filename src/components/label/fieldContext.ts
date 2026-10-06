import { type AriaAttributes, createContext, useContext } from "react"

/** What a `Field` tells the control inside it. */
export type FieldContextValue = {
	/** The id the control must use, so the label points at it. */
	controlId: string
	/** Ids of the error and help text, for the control's `aria-describedby`. */
	describedBy?: string
	/** True when the field shows an error. */
	invalid: boolean
	/** True when the field is required. */
	required: boolean
	/** True when the field is disabled. */
	disabled: boolean
}

/** Carries a `Field`'s ids and state to the control inside it; `null` outside a field. */
export const FieldContext = createContext<FieldContextValue | null>(null)

type ControlProps = {
	"aria-describedby"?: string
	"aria-invalid"?: AriaAttributes["aria-invalid"]
	required?: boolean
	disabled?: boolean
}

/** The props a control spreads to join its `Field`. */
export type FieldControlProps = {
	/** The control's id, owned by the field. */
	id?: string
	/** Ids of the field's error and help text. */
	"aria-describedby"?: string
	/** The field's required state, unless the control sets its own. */
	required?: boolean
	/** The field's disabled state, unless the control sets its own. */
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
