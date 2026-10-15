// The paper a scene draws on. The scene frame is the desk (layer1); a Sheet is the app's main
// sheet on it (layer2, sheet corners, no shadow). Scenes may use more than one.
import { color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"

const styles = stylex.create({
	sheet: {
		display: "flex",
		flexDirection: "column",
		minWidth: 0,
		minHeight: 0,
		overflow: "hidden",
		color: color.text,
		backgroundColor: color.layer2,
		borderRadius: corner.sheet,
	},
	fill: { height: "100%" },
	stub: {
		flexGrow: 1,
		display: "grid",
		placeContent: "center",
		gap: space.xxs,
		textAlign: "center",
		padding: space.lg,
		minHeight: "16rem",
	},
	stubTitle: { fontFamily: font.display, fontSize: type.t4, fontWeight: 600, margin: 0 },
	stubText: { fontSize: type.t2, color: color.textMuted, margin: 0 },
})

export type SheetProps = {
	/** Fill the parent's height (compact scenes do). */
	fill?: boolean
	sx?: stylex.StyleXStyles
	children: ReactNode
}

export function Sheet({ fill, sx, children }: SheetProps) {
	return <div {...stylex.props(styles.sheet, fill && styles.fill, sx)}>{children}</div>
}

/** What a scene shows until someone builds it. */
export function SceneStub({ title, compact }: { title: string; compact?: boolean }) {
	return (
		<Sheet fill={compact}>
			<div {...stylex.props(styles.stub)}>
				<p {...stylex.props(styles.stubTitle)}>{title}</p>
				<p {...stylex.props(styles.stubText)}>This scene is being built.</p>
			</div>
		</Sheet>
	)
}
