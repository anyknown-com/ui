import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"

/**
 * `.srows` / `.srow`: a setting per line, 36px — its name and one line of help on the left, the
 * control on the right. The rows sit on the page: no fill, no corners, no lines, only space.
 */

const styles = stylex.create({
	rows: {
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
	},
	row: {
		alignItems: "center",
		columnGap: space.sm,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		minHeight: 36,
		paddingBlock: 6,
		paddingInline: 0,
	},
	key: { minWidth: 0 },
	label: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		fontSize: type.t2,
		fontWeight: 500,
		gap: space.xs,
		minWidth: 0,
	},
	help: { color: color.textMuted, fontSize: type.t2 },
	value: { color: color.textMuted, fontFamily: font.mono, fontSize: type.t2, whiteSpace: "nowrap" },
	ctl: { alignItems: "center", display: "flex", flex: "none", gap: space.xs },
	dot: { backgroundColor: color.text, borderRadius: corner.shape, flex: "none", height: 6, width: 6 },
})

type Sx = {
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

export type SettingsRowsProps = {
	/** The `SettingsRow`s. */
	children: ReactNode
} & Sx

/** Settings on the page, one `SettingsRow` per line, no fill and no lines. */
export function SettingsRows({ children, sx }: SettingsRowsProps) {
	return <div {...stylex.props(styles.rows, sx)}>{children}</div>
}

export type SettingsRowProps = {
	/** The setting's name. */
	label: ReactNode
	/** One muted line of help under the name. */
	help?: ReactNode
	/** The control on the right, such as a `Switch` or a `SettingsValue`. */
	children?: ReactNode
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** One setting: its name and help on the left, its control on the right. */
export function SettingsRow({ label, help, children, sx }: SettingsRowProps) {
	return (
		<div {...stylex.props(styles.row, sx)}>
			<div {...stylex.props(styles.key)}>
				<div {...stylex.props(styles.label)}>{label}</div>
				{help !== undefined && <div {...stylex.props(styles.help)}>{help}</div>}
			</div>
			{children !== undefined && <div {...stylex.props(styles.ctl)}>{children}</div>}
		</div>
	)
}

export type HelpProps = {
	/** The muted reading. */
	children: ReactNode
} & Sx

/** `.help` inline: a muted reading on a row's label line. */
export function Help({ children, sx }: HelpProps) {
	return <span {...stylex.props(styles.help, sx)}>{children}</span>
}

export type SettingsValueProps = {
	/** The value as text. */
	children: ReactNode
} & Sx

/** `.val`: a mono reading, like `•••• 9b7c`. */
export function SettingsValue({ children, sx }: SettingsValueProps) {
	return <span {...stylex.props(styles.value, sx)}>{children}</span>
}

/** @deprecated Use `SettingsValue`; the generic name will be removed in a future major. */
export const Value = SettingsValue

export type DotProps = Sx

/** A 6px ink dot that marks a row's label, hidden from screen readers. */
export function Dot({ sx }: DotProps) {
	return <span aria-hidden="true" {...stylex.props(styles.dot, sx)} />
}
