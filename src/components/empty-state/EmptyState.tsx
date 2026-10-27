import * as stylex from "@stylexjs/stylex"
import type { ElementType, ReactNode } from "react"
import { color, font, space, type } from "../../tokens.stylex"

const styles = stylex.create({
	root: {
		display: "grid",
		justifyItems: "start",
		gap: space.sm,
		fontFamily: font.body,
	},
	// 線條 icon、跟文字同一個墨色,不墊圓底
	icon: { display: "grid", placeItems: "center", color: color.textMuted },
	title: {
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		lineHeight: type.snug,
		margin: 0,
		color: color.text,
	},
	description: { margin: 0, fontSize: type.t2, color: color.textMuted, maxWidth: "18rem" },
	action: { marginTop: space.xxs },
})

export type EmptyStateProps = {
	/** A line icon above the title; decorative, hidden from screen readers. */
	icon?: ReactNode
	/** What is missing, said as a short heading. */
	title: ReactNode
	/** A muted sentence under the title: why it is empty or what to do. */
	description?: ReactNode
	/** A button or link under the text that fills the empty place. */
	action?: ReactNode
	/** The heading level the title renders as, to fit the page's outline. @default 3 */
	headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

/** A placeholder for a place with nothing in it yet: an icon, a title, a sentence and an action. */
export function EmptyState({ icon, title, description, action, headingLevel = 3 }: EmptyStateProps) {
	const Heading = `h${headingLevel}` as ElementType
	return (
		<div {...stylex.props(styles.root)}>
			{icon != null && (
				<span aria-hidden="true" {...stylex.props(styles.icon)}>
					{icon}
				</span>
			)}
			<Heading {...stylex.props(styles.title)}>{title}</Heading>
			{description != null && <p {...stylex.props(styles.description)}>{description}</p>}
			{action != null && <div {...stylex.props(styles.action)}>{action}</div>}
		</div>
	)
}
