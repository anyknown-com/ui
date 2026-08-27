import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, Fragment, type ReactNode, createContext, useContext } from "react"
import { styled } from "../../lib/styled"
import { color, font, radius, space } from "../../tokens.stylex"

export const KbdToneContext = createContext<"default" | "inverted">("default")

const styles = stylex.create({
	key: {
		display: "inline-grid",
		placeItems: "center",
		minWidth: "1.4rem",
		height: "1.4rem",
		paddingInline: space.xxs,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderBottomColor: color.borderStrong,
		borderRadius: radius.sm,
		boxShadow: `0 1px 0 ${color.borderStrong}`,
		fontFamily: font.mono,
		fontSize: "0.72rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.textMuted,
	},
	inverted: {
		backgroundColor: "color-mix(in srgb, currentColor 16%, transparent)",
		borderColor: "color-mix(in srgb, currentColor 28%, transparent)",
		borderBottomColor: "color-mix(in srgb, currentColor 28%, transparent)",
		boxShadow: "none",
		color: "inherit",
	},
	combo: { display: "inline-flex", gap: "0.2rem", alignItems: "center" },
	sequence: { display: "inline-flex", gap: space.xxs, alignItems: "center", color: color.textFaint },
})

export type KbdProps = ComponentProps<"kbd">

export function Kbd(props: KbdProps) {
	const tone = useContext(KbdToneContext)
	return <kbd {...props} {...styled(props, styles.key, tone === "inverted" && styles.inverted)} />
}

export type KbdGroupProps = Omit<ComponentProps<"span">, "children"> & {
	keys: string[]
	separator?: ReactNode
}

export function KbdGroup({ keys, separator, ...props }: KbdGroupProps) {
	return (
		<span {...props} {...styled(props, separator == null ? styles.combo : styles.sequence)}>
			{keys.map((key, index) => (
				<Fragment key={`${key}-${index}`}>
					{index > 0 && separator}
					<Kbd>{key}</Kbd>
				</Fragment>
			))}
		</span>
	)
}
