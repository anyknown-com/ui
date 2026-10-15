// Inspect mode for scenes: each component in a scene sits in a <Part name="<folder>">. While
// inspect is off a Part renders its children and nothing else; while it is on it outlines them
// and adds a small name label that links to the component page.
import { color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { createContext, use, type ReactNode } from "react"

/** True while the scene frame's Inspect switch is on. Scenes never set it. */
export const InspectContext = createContext(false)

const styles = stylex.create({
	part: {
		position: "relative",
		outlineWidth: 1,
		outlineStyle: "dashed",
		outlineColor: color.borderControl,
		outlineOffset: 2,
		borderRadius: corner.small,
	},
	// A block part makes room above itself for its label, so the label never covers it.
	block: { marginBlockStart: space.lg },
	inline: { display: "inline-flex", verticalAlign: "middle" },
	label: {
		position: "absolute",
		insetBlockEnd: `calc(100% + ${space.xxs})`,
		insetInlineEnd: 0,
		zIndex: 1,
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: type.snug,
		fontWeight: 500,
		whiteSpace: "nowrap",
		textDecoration: { default: "none", ":hover": "underline" },
		color: color.accentText,
		backgroundColor: color.accent,
		borderRadius: corner.small,
		paddingInline: space.xxs,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	// An inline part sits in a row of other things; its label hangs below it instead.
	labelBelow: { insetBlockEnd: "auto", insetBlockStart: `calc(100% + ${space.xxs})` },
	labelStart: { insetInlineEnd: "auto", insetInlineStart: 0 },
})

export type PartProps = {
	/** The component folder under src/components, e.g. "tool-group". Also the label and link. */
	name: string
	/** For a component that sits in a line of text (a badge, a dot): the outline hugs it. */
	inline?: boolean
	/** Which edge the label lines up with. Use "start" for a part near the scene's inline-start edge. @default "end" */
	align?: "start" | "end"
	children: ReactNode
}

export function Part({ name, inline, align = "end", children }: PartProps) {
	const on = use(InspectContext)
	if (!on) return children
	const Tag = inline ? "span" : "div"
	return (
		<Tag data-part={name} {...stylex.props(styles.part, inline ? styles.inline : styles.block)}>
			{children}
			<a
				href={`#/components/${name}`}
				{...stylex.props(styles.label, inline && styles.labelBelow, align === "start" && styles.labelStart)}
			>
				{name}
			</a>
		</Tag>
	)
}
