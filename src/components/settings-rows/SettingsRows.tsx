import * as stylex from "@stylexjs/stylex"
import { color, corner, font, space, type } from "../../tokens.stylex"
import type { ReactNode } from "react"

/**
 * `.srows` / `.srow`: a setting per line, 44px — its name and one line of help on the left, the
 * control on the right. The rows sit on one sunken `surface` region of the sheet, no ring around
 * it, hairlines between them.
 */

const styles = stylex.create({
	rows: {
		backgroundColor: color.surface,
		borderRadius: corner.card,
		color: color.text,
		fontSize: type.t2,
		lineHeight: type.body,
	},
	row: {
		alignItems: "center",
		borderRadius: {
			default: 0,
			":first-child": `${corner.card} ${corner.card} 0 0`,
			":last-child": `0 0 ${corner.card} ${corner.card}`,
		},
		boxShadow: { default: "none", ":not(:first-child)": `inset 0 1px 0 ${color.border}` },
		columnGap: space.sm,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		minHeight: 44,
		paddingBlock: space.xs,
		paddingInline: space.sm,
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
	dot: { backgroundColor: color.accent, borderRadius: "50%", flex: "none", height: 6, width: 6 },
})

type Sx = { sx?: stylex.StyleXStyles }

export type SettingsRowsProps = { children: ReactNode } & Sx

export function SettingsRows({ children, sx }: SettingsRowsProps) {
	return <div {...stylex.props(styles.rows, sx)}>{children}</div>
}

export type SettingsRowProps = {
	label: ReactNode
	help?: ReactNode
	children?: ReactNode
	sx?: stylex.StyleXStyles
}

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

export type HelpProps = { children: ReactNode } & Sx

/** `.help` inline: a muted reading on a row's label line. */
export function Help({ children, sx }: HelpProps) {
	return <span {...stylex.props(styles.help, sx)}>{children}</span>
}

export type SettingsValueProps = { children: ReactNode } & Sx

/** `.val`: a mono reading, like `•••• 9b7c`. */
export function SettingsValue({ children, sx }: SettingsValueProps) {
	return <span {...stylex.props(styles.value, sx)}>{children}</span>
}

/** @deprecated Use `SettingsValue`; the generic name will be removed in a future major. */
export const Value = SettingsValue

export type DotProps = Sx

export function Dot({ sx }: DotProps) {
	return <span aria-hidden="true" {...stylex.props(styles.dot, sx)} />
}
