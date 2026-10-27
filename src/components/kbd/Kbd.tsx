import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, Fragment, type ReactNode, createContext, useContext } from "react"
import { styled } from "../../lib/styled"
import { color, font, space, type } from "../../tokens.stylex"

/** Set to `"inverted"` to draw the `Kbd`s inside on a dark or coloured surface, such as a tooltip. */
export const KbdToneContext = createContext<"default" | "inverted">("default")

const styles = stylex.create({
	key: {
		display: "inline-grid",
		placeItems: "center",
		minWidth: "1.4rem",
		height: "1.4rem",
		paddingInline: space.xxs,
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: 1,
		color: color.textMuted,
	},
	inverted: { color: "inherit" },
	combo: { display: "inline-flex", gap: "0.2rem", alignItems: "center" },
	sequence: { display: "inline-flex", gap: space.xxs, alignItems: "center", color: color.textMuted },
})

export type KbdProps = ComponentProps<"kbd">

/** One keyboard key, drawn as Geist Mono `textMuted` text, no frame, fill or shadow. Native `<kbd>` props pass through. */
export function Kbd(props: KbdProps) {
	const tone = useContext(KbdToneContext)
	return <kbd {...props} {...styled(props, styles.key, tone === "inverted" && styles.inverted)} />
}

export type KbdGroupProps = Omit<ComponentProps<"span">, "children"> & {
	/** The keys, in order, each drawn as a `Kbd`. */
	keys: string[]
	/** Put between the keys for a sequence pressed one after another ("then"); without it the keys read as a combination pressed together. */
	separator?: ReactNode
}

/** A shortcut of several keys: a combination, or a sequence when `separator` is given. */
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
