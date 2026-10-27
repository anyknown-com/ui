import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, font, space, type } from "../../tokens.stylex"

const styles = stylex.create({
	// 沒有卡片、底、框:靠大小、字重和一種灰分層
	base: { display: "flex", flexDirection: "column", gap: space.xxs, minWidth: 0 },
	label: {
		fontFamily: font.body,
		fontSize: type.t1,
		lineHeight: type.tight,
		color: color.textMuted,
	},
	value: {
		fontFamily: font.body,
		fontSize: type.t5,
		fontWeight: 600,
		lineHeight: 1.25,
		color: color.text,
		fontVariantNumeric: "tabular-nums",
	},
	note: {
		fontFamily: font.body,
		fontSize: type.t1,
		lineHeight: type.tight,
		color: color.textMuted,
		fontVariantNumeric: "tabular-nums",
	},
})

export type StatProps = Omit<ComponentProps<"div">, "children"> & {
	/** What the number measures; shown small and grey above it. */
	label: ReactNode
	/** The number, as the words to show ("$3.10", "42"). Not parsed or formatted. */
	value: ReactNode
	/** One line under the number, such as a change or a period. */
	note?: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

/** A big number with its label above and an optional one-line note below. No card, fill or line. Native `<div>` props pass through. */
export function Stat({ label, value, note, sx, ...props }: StatProps) {
	return (
		<div {...props} {...styled(props, styles.base, sx)}>
			<span {...stylex.props(styles.label)}>{label}</span>
			<span {...stylex.props(styles.value)}>{value}</span>
			{note != null && <span {...stylex.props(styles.note)}>{note}</span>}
		</div>
	)
}
