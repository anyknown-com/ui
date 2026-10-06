import * as stylex from "@stylexjs/stylex"
import { color, corner, type } from "../../tokens.stylex"
import type { ComponentType, SVGProps } from "react"
import { ICON_STROKE } from "../icon/icon"

/** What leads a `GroupCell`: a glyph on a 28px tile, a letter on one, or a bare 28px glyph slot. */

/** A lucide icon, or anything drawn the same way. */
export type TileIcon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>

const styles = stylex.create({
	tile: {
		alignItems: "center",
		backgroundColor: color.layer4,
		borderRadius: corner.small,
		color: color.text,
		display: "flex",
		flexShrink: 0,
		fontSize: type.t3,
		height: 28,
		justifyContent: "center",
		lineHeight: type.tight,
		width: 28,
	},
	tileIcon: { height: 16, width: 16 },
	letter: { fontSize: type.t2, fontWeight: 600 },
	slot: {
		color: "inherit",
		display: "flex",
		flexShrink: 0,
		fontSize: type.t3,
		justifyContent: "center",
		lineHeight: type.tight,
		width: 28,
	},
	slotIcon: { height: 18, width: 18 },
})

export type IconTileProps = {
	/** The glyph drawn at 16px on the tile. */
	icon: TileIcon
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A glyph on a 28px tile, to lead a `GroupCell`. */
export function IconTile({ icon: Glyph, sx }: IconTileProps) {
	return (
		<span {...stylex.props(styles.tile, sx)}>
			<Glyph {...stylex.props(styles.tileIcon)} strokeWidth={ICON_STROKE} aria-hidden="true" />
		</span>
	)
}

export type LetterTileProps = {
	/** The tile shows its first letter, upper-cased. */
	name: string
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** A letter on a 28px tile, to lead a `GroupCell` for a thing with no icon of its own. */
export function LetterTile({ name, sx }: LetterTileProps) {
	return (
		<span aria-hidden="true" {...stylex.props(styles.tile, styles.letter, sx)}>
			{name.slice(0, 1).toUpperCase()}
		</span>
	)
}

export type ActionIconProps = {
	/** The glyph drawn at 18px. */
	icon: TileIcon
	/** StyleX styles merged after the component's own. */
	sx?: stylex.StyleXStyles
}

/** An 18px glyph in a 28px slot, no tile, in the cell's own colour: what leads an action cell. */
export function ActionIcon({ icon: Glyph, sx }: ActionIconProps) {
	return (
		<span {...stylex.props(styles.slot, sx)}>
			<Glyph {...stylex.props(styles.slotIcon)} strokeWidth={ICON_STROKE} aria-hidden="true" />
		</span>
	)
}
