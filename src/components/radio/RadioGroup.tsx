import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, createContext, useContext, useId, useMemo } from "react"
import { styled } from "../../lib/styled"
import { useControllableState } from "../../lib/useControllableState"
import { color, font, space, type } from "../../tokens.stylex"

type RadioGroupContextValue = {
	name: string
	value: string
	disabled: boolean
	variant: "plain" | "card"
	select: (value: string) => void
}

/** Carries a `RadioGroup`'s name, value and state to the `Radio`s inside it. */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

/** Reads the enclosing `RadioGroup`; throws when there is none. */
export function useRadioGroup() {
	const group = useContext(RadioGroupContext)
	if (!group) throw new Error("Radio must be rendered inside a RadioGroup")
	return group
}

const styles = stylex.create({
	// borderWidth 而不是 border:0 —— StyleX 0.19 會靜默丟掉 border 簡寫,fieldset 的
	// 原生 2px groove 邊框就留在畫面上
	fieldset: { borderWidth: 0, margin: 0, padding: 0, display: "grid", gap: space.sm },
	legend: {
		padding: 0,
		marginBottom: space.xxs,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: type.snug,
		color: color.text,
	},
})

export type RadioGroupProps = Omit<ComponentProps<"fieldset">, "onChange" | "defaultValue"> & {
	/** The group's visible name, rendered as the fieldset's `<legend>`. */
	legend?: ReactNode
	/** The `name` every radio in the group shares; a unique one is made when omitted. */
	name?: string
	/** The picked option's value, for a controlled group. */
	value?: string
	/** The option picked at first, for an uncontrolled group. @default "" */
	defaultValue?: string
	/** `plain` lists bare options; `card` puts each option in a bordered card that highlights when picked. @default "plain" */
	variant?: "plain" | "card"
	/** The newly picked option's value. */
	onValueChange?: (value: string) => void
	/** The `Radio` options. */
	children: ReactNode
}

/** A fieldset of `Radio` options where exactly one can be picked. */
export function RadioGroup({
	legend,
	name,
	value,
	defaultValue = "",
	variant = "plain",
	onValueChange,
	disabled = false,
	children,
	...props
}: RadioGroupProps) {
	const fallbackName = useId()
	const resolvedName = name ?? fallbackName
	const [selected, select] = useControllableState(value, defaultValue, onValueChange)
	const context = useMemo(
		() => ({ name: resolvedName, value: selected, disabled, variant, select }),
		[resolvedName, selected, disabled, variant, select],
	)
	return (
		<fieldset {...props} disabled={disabled} {...styled(props, styles.fieldset)}>
			{legend != null && <legend {...stylex.props(styles.legend)}>{legend}</legend>}
			<RadioGroupContext value={context}>{children}</RadioGroupContext>
		</fieldset>
	)
}
