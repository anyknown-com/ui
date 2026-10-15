import * as stylex from "@stylexjs/stylex"
import { color, corner, type } from "../../tokens.stylex"
import { Markdown } from "../markdown/Markdown"

/**
 * One message as the thread shows it. Both sides are a sunken `surface` bubble: what the person
 * said as typed, its tail at the end; the reply as markdown with ruled tables, its tail at the
 * start. Where the box sits and how wide it is belongs to the thread, not to the bubble.
 */

// 軟材規格的使用者泡泡是 18 18 6 18,圓角 token 沒有 18 這一階
const BUBBLE_CORNER = 18

const styles = stylex.create({
	bubble: {
		color: color.text,
		fontSize: type.t3,
		lineHeight: type.body,
		overflowWrap: "anywhere",
		paddingBlock: 12,
		backgroundColor: color.surface,
		borderRadius: BUBBLE_CORNER,
		paddingInline: 16,
		// forced colors 會換掉底色,泡泡只剩框才跟紙面分得開
		outline: { default: null, "@media (forced-colors: active)": "1px solid CanvasText" },
	},
	user: { borderEndEndRadius: corner.small },
	assistant: { borderEndStartRadius: corner.small },
	markdown: { fontSize: type.t3, lineHeight: type.body },
})

export type BubbleProps = {
	from: "user" | "assistant"
	children: string
	sx?: stylex.StyleXStyles
}

export function Bubble({ from, children, sx }: BubbleProps) {
	return (
		<div {...stylex.props(styles.bubble, styles[from], sx)}>
			{from === "user" ? (
				children
			) : (
				<Markdown tables="ruled" sx={styles.markdown}>
					{children}
				</Markdown>
			)}
		</div>
	)
}
