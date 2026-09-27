import * as stylex from "@stylexjs/stylex"
import { color, radius, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { FileGlyph } from "../icon/glyphs"
import { ICON_STROKE } from "../icon/icon"

/**
 * What a message carries, as 150px tiles in a wrapping row. A picture fills its tile and its
 * caption turns white over it; any other file is a glyph in the corner under its name.
 */

const styles = stylex.create({
	grid: {
		color: color.text,
		display: "flex",
		flexWrap: "wrap",
		fontSize: type.t2,
		gap: 16,
		lineHeight: type.tight,
	},
	tile: {
		backgroundColor: color.layer3,
		borderRadius: radius.xl,
		color: color.text,
		flexShrink: 0,
		fontSize: type.t2,
		height: 150,
		lineHeight: type.tight,
		margin: 0,
		overflow: "hidden",
		position: "relative",
		width: 150,
	},
	photo: { height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" },
	glyph: {
		color: color.textMuted,
		height: 28,
		insetBlockEnd: 16,
		insetInlineStart: 16,
		position: "absolute",
		width: 28,
	},
	caption: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		insetBlockStart: 0,
		insetInline: 0,
		paddingBlock: 12,
		paddingInline: 16,
		position: "absolute",
	},
	onImage: { color: "#FFFFFF", textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)" },
	name: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	meta: { color: color.textMuted, fontSize: type.t1 },
})

export type AttachmentGridProps = { children: ReactNode; sx?: stylex.StyleXStyles }

export function AttachmentGrid({ children, sx }: AttachmentGridProps) {
	return <div {...stylex.props(styles.grid, sx)}>{children}</div>
}

export type AttachmentTileProps = {
	name: string
	/** The kind in a word under the name, like `PDF`. */
	label: string
	/** The picture's URL, for an image: it fills the tile. Without it the tile shows a file glyph. */
	preview?: string
	sx?: stylex.StyleXStyles
}

export function AttachmentTile({ name, label, preview, sx }: AttachmentTileProps) {
	const image = preview !== undefined

	return (
		<figure {...stylex.props(styles.tile, sx)}>
			{image ? (
				<img src={preview} alt="" {...stylex.props(styles.photo)} />
			) : (
				<FileGlyph {...stylex.props(styles.glyph)} strokeWidth={ICON_STROKE} />
			)}
			<figcaption {...stylex.props(styles.caption, image && styles.onImage)}>
				<span {...stylex.props(styles.name)}>{name}</span>
				<span {...stylex.props(styles.meta, image && styles.onImage)}>{label}</span>
			</figcaption>
		</figure>
	)
}
