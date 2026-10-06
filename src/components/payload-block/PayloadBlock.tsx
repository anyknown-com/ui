import * as stylex from "@stylexjs/stylex"
import { color, corner, font, type } from "../../tokens.stylex"
import type { ReactNode } from "react"
import { useCopy } from "../../lib/useCopy"
import { IconButton } from "../icon-button/IconButton"
import { CheckGlyph, CopyGlyph } from "../icon/glyphs"
import { ICON_STROKE } from "../icon/icon"

/**
 * What a tool was called with, or what it gave back: mono in a sunken block that scrolls sideways,
 * a copy button in its corner. No language header, unlike `CodeBlock`.
 *
 * This package ships no highlighter. A shell that has one (shiki, say) passes `highlight` and
 * draws the code itself; without it the code is plain text. Nothing here goes through `innerHTML`.
 */

const COPIED_MS = 1500

const styles = stylex.create({
	block: {
		backgroundColor: color.surface,
		borderRadius: corner.card,
		color: color.text,
		fontFamily: font.mono,
		fontSize: type.t2,
		lineHeight: type.snug,
		// 放進 grid / flex 也是自己橫捲,不把外面撐寬
		minWidth: 0,
		position: "relative",
	},
	code: {
		overflowX: "auto",
		paddingBlock: 12,
		paddingInlineEnd: 48,
		paddingInlineStart: 16,
	},
	plain: { fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", margin: 0 },
	copy: { insetBlockStart: 6, insetInlineEnd: 6, position: "absolute" },
	icon: { flexShrink: 0, height: 14, pointerEvents: "none", width: 14 },
})

export type PayloadBlockProps = {
	/** What is shown and copied, like `JSON.stringify(input, null, 2)`. */
	code: string
	/** Draws `code` coloured; its result goes where the plain `<pre>` would. */
	highlight?: (code: string) => ReactNode
	/** @default "複製" */
	copyLabel?: string
	/** @default "已複製" */
	copiedLabel?: string
	sx?: stylex.StyleXStyles
}

export function PayloadBlock({
	code,
	highlight,
	copyLabel = "複製",
	copiedLabel = "已複製",
	sx,
}: PayloadBlockProps) {
	const { copied, copy } = useCopy(COPIED_MS)
	const Glyph = copied ? CheckGlyph : CopyGlyph

	return (
		<div {...stylex.props(styles.block, sx)}>
			<div {...stylex.props(styles.code)}>
				{highlight ? highlight(code) : <pre {...stylex.props(styles.plain)}>{code}</pre>}
			</div>
			<IconButton
				label={copied ? copiedLabel : copyLabel}
				size="sm"
				onClick={() => copy(code)}
				sx={styles.copy}
			>
				<Glyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
		</div>
	)
}
