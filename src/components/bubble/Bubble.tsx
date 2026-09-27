import * as stylex from "@stylexjs/stylex"
import { color, radius, type } from "../../tokens.stylex"
import { Markdown } from "../markdown/Markdown"

/**
 * One message as the thread shows it: a full-width rounded box, green for what the person said
 * and `layer3` for the reply. The person's words show as typed; the reply is markdown, its tables
 * ruled. Where the box sits and how wide it is belongs to the thread, not to the bubble.
 */

const styles = stylex.create({
	bubble: {
		borderRadius: radius.xl,
		color: color.text,
		fontSize: type.t3,
		lineHeight: type.body,
		overflowWrap: "anywhere",
		paddingBlock: 12,
		paddingInline: 16,
	},
	user: { backgroundColor: color.successHl },
	assistant: { backgroundColor: color.layer3 },
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
