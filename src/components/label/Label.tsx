import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, styled } from "../../lib/styled"
import { color, font, type } from "../../tokens.stylex"

const styles = stylex.create({
	base: {
		display: "flex",
		alignItems: "baseline",
		gap: "0.35rem",
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: type.snug,
		color: color.text,
	},
	required: { color: color.danger },
	optional: { fontWeight: 400, fontSize: type.t1, color: color.textMuted },
})

const strings = defineStrings({
	"zh-TW": { optional: "選填" },
	en: { optional: "optional" },
})

/** Label's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type LabelLabels = StringsOf<typeof strings>

export type LabelProps = ComponentProps<"label"> & {
	/** A red `*` after the name, hidden from screen readers (the control's `required` says it). */
	required?: boolean
	/** A muted "optional" after the name. */
	optional?: boolean
	/** @deprecated Use `labels={{ optional }}`. */
	optionalLabel?: string
	/** Override built-in words for this label; the rest follow `<LocaleProvider>`. */
	labels?: Partial<LabelLabels>
	sx?: StyleArg
}

/** A form control's visible name. Inside a `Field`, the field renders it for you. */
export function Label({ required, optional, optionalLabel, labels, children, sx, ...props }: LabelProps) {
	const t = useStrings(strings, {
		...labels,
		...(optionalLabel !== undefined && { optional: optionalLabel }),
	})
	return (
		<label {...props} {...styled(props, styles.base, sx)}>
			{children}
			{required && (
				<span aria-hidden="true" {...stylex.props(styles.required)}>
					*
				</span>
			)}
			{optional && <span {...stylex.props(styles.optional)}> {t.optional}</span>}
		</label>
	)
}
