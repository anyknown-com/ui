import * as stylex from "@stylexjs/stylex"
import type { ComponentType, ReactNode } from "react"
import { color, font, radius, space, type } from "@anyknown/ui/tokens.stylex"

export interface DemoEntry {
	/** Section id and `#/demo/<id>` anchor. Keep the existing ids. */
	id: string
	/** Component folders (src/components/<folder>) this demo shows, e.g. ["attach-button", "pending-files"]. */
	covers: string[]
	/** Renders the full <Demo> section. */
	Component: ComponentType
}

const styles = stylex.create({
	section: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gap: space.xs,
		marginBottom: space.xl,
		scrollMarginTop: space.md,
	},
	heading: {
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textMuted,
		margin: 0,
	},
	sub: { fontFamily: font.mono, fontSize: type.t1, color: color.textMuted, margin: 0 },
	body: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.sm },
	panel: {
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: color.border,
		borderRadius: radius.lg,
		padding: space.md,
		backgroundColor: color.bg,
	},
	note: { fontFamily: font.body, fontSize: type.t1, color: color.textMuted, margin: 0 },
})

export function Demo({
	id,
	title,
	note,
	children,
}: {
	id: string
	title: string
	note?: string
	children: ReactNode
}) {
	return (
		<section id={id} {...stylex.props(styles.section)}>
			<h2 {...stylex.props(styles.heading)}>{title}</h2>
			{note != null && <p {...stylex.props(styles.note)}>{note}</p>}
			<div {...stylex.props(styles.panel)}>
				<div {...stylex.props(styles.body)}>{children}</div>
			</div>
		</section>
	)
}

export function Row({ children }: { children: ReactNode }) {
	return <div {...stylex.props(rowStyles.row)}>{children}</div>
}

const rowStyles = stylex.create({
	row: { display: "flex", flexWrap: "wrap", gap: space.sm, alignItems: "center" },
})

export function Label({ children }: { children: ReactNode }) {
	return <p {...stylex.props(styles.sub)}>{children}</p>
}
