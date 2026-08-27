import * as stylex from "@stylexjs/stylex"
import type { ElementType, ReactNode } from "react"
import { color, font, radius, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	root: {
		display: "grid",
		justifyItems: "center",
		gap: space.xs,
		textAlign: "center",
		paddingBlock: space.xl,
		paddingInline: space.lg,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: color.border,
		borderRadius: radius.lg,
		fontFamily: font.body,
	},
	icon: {
		display: "grid",
		placeItems: "center",
		width: "2.6rem",
		height: "2.6rem",
		borderRadius: radius.full,
		backgroundColor: color.accentSubtle,
		color: color.accent,
	},
	title: {
		fontFamily: font.display,
		fontSize: text.base,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		margin: 0,
		color: color.text,
	},
	description: { margin: 0, fontSize: text.sm, color: color.textMuted, maxWidth: "18rem" },
	action: { marginTop: space.xxs },
})

export type EmptyStateProps = {
	icon?: ReactNode
	title: ReactNode
	description?: ReactNode
	action?: ReactNode
	headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

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
