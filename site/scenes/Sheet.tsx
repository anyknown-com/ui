// The paper a scene draws on. There is one sheet: the scene frame has no desk and a Sheet is
// only a column on it, with no fill, corner or shadow. Scenes may use more than one.
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
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

const MOBILE = breakpoint.phone

/**
 * The layout of a sheet that holds a thread: a header bar, the scrolling thread and the dock with
 * the composer. Every part keeps the same inline margin (24px, 16px on a phone), and the header
 * row, the thread and the composer sit in one centred column, so all three share their left and
 * right edges. The Thread brings its own block padding; nothing here adds space between turns.
 */
export const chat = stylex.create({
	header: {
		paddingBlockStart: space.md,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	headerRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		minHeight: space.xl,
	},
	scroll: {
		flexGrow: 1,
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	column: { maxWidth: "44rem", marginInline: "auto" },
	dock: {
		paddingBlockEnd: { default: space.lg, [MOBILE]: space.md },
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	// A sub agent's row lines up with the tool groups and text around it.
	flush: { marginInlineStart: 0 },
})

/** Space above a turn that `startOnWholeTurn` brings to the top: the thread's own top padding. */
const TURN_GAP = 24

/**
 * For compact scenes that follow the newest turn. After the thread is scrolled to its end, a turn
 * that the top edge cuts is scrolled back to its own top, so a tile never opens mid-turn and any
 * cut is at the bottom. Rects are scaled on tiles; scrollTop is not, hence the ratio.
 */
export function startOnWholeTurn(box: HTMLElement, thread: HTMLElement | null) {
	if (thread == null) return
	const frame = box.getBoundingClientRect()
	const scale = frame.height / box.offsetHeight || 1
	for (const turn of thread.children) {
		const rect = turn.getBoundingClientRect()
		if (rect.top < frame.top && rect.bottom > frame.top) {
			box.scrollTop -= (frame.top - rect.top) / scale + TURN_GAP
			return
		}
	}
}

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
