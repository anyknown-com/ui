import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"
import type { StyleArg } from "../../lib/styled"
import { color, corner, focusRing, shadow } from "../../tokens.stylex"

const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	// 浮起來的一層:surfaceRaised 加 shadow.float,沒有框;數字照 prototype 的 chatbox。
	// 透明的框只為了 forced-colors(那裡陰影會消失)
	frame: {
		position: "relative",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: 6,
		paddingBlock: "10px 8px",
		paddingInline: "16px 10px",
		backgroundColor: color.surfaceRaised,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: "transparent", [FORCED]: "CanvasText" },
		borderRadius: corner.box,
		boxShadow: shadow.float,
		outline: {
			default: "none",
			":focus-within": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 0,
	},
	// 檔案拖到上面:虛線的焦點環,放開就收進來
	dragging: {
		outline: {
			default: `${focusRing.width} dashed ${color.focusRing}`,
			[FORCED]: `${focusRing.width} dashed Highlight`,
		},
	},
})

export type ComposerFrameProps = {
	/** What goes in the chatbox: the text field, its bar, pending files. */
	children: ReactNode
	/** A file is dragged over the chatbox: it shows a dashed ring. @default false */
	dragging?: boolean
	/** Extra StyleX styles for the frame. */
	sx?: StyleArg
}

/**
 * The chatbox's floating box: `surfaceRaised`, `shadow.float`, `corner.box`, no frame, and a
 * focus ring while anything inside has focus. `Composer` draws itself in it; an app's own
 * chatbox uses it for the same look.
 */
export function ComposerFrame({ children, dragging = false, sx }: ComposerFrameProps) {
	return (
		<div
			data-dragging={dragging || undefined}
			{...stylex.props(styles.frame, dragging && styles.dragging, sx)}
		>
			{children}
		</div>
	)
}
