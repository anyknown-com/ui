import { Drawer } from "@base-ui/react/drawer"
import * as stylex from "@stylexjs/stylex"
import type { ReactElement, ReactNode } from "react"
import { layerStyles, returnFocusOnExit } from "../../lib/popup"
import { color, corner, focusRing, font, motion, shadow, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// Windows 高對比:陰影會消失、顏色換成系統色;邊界與焦點環明確給 CanvasText / Highlight
const FORCED = "@media (forced-colors: active)"

// 進場:Base UI 掛上時先給 data-starting-style、下一幀拿掉;退場掛 data-ending-style,等 transition 跑完才拆
const OFFSTAGE = ":is([data-starting-style], [data-ending-style])"

const styles = stylex.create({
	// 跟 Dialog 同一層 scrim,不加 blur;往下拖時跟著拖的比例淡掉
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: color.scrim,
		opacity: { default: "calc(1 - var(--drawer-swipe-progress, 0))", [OFFSTAGE]: 0 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.slide, ":is([data-swiping])": "0s", [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	viewport: {
		position: "fixed",
		inset: 0,
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
	},
	// modal 階的底、陰影;只有上面兩角是圓的(16px,照核可的 prototype)
	popup: {
		display: "flex",
		flexDirection: "column",
		boxSizing: "border-box",
		width: "100%",
		// 560px
		maxWidth: "35rem",
		maxHeight: "85dvh",
		backgroundColor: color.surfaceRaised,
		color: color.text,
		fontFamily: font.body,
		borderWidth: 1,
		borderBottomWidth: 0,
		borderStyle: "solid",
		borderColor: { default: "transparent", [FORCED]: "CanvasText" },
		borderTopLeftRadius: corner.float,
		borderTopRightRadius: corner.float,
		boxShadow: shadow.modal,
		paddingTop: space.xs,
		paddingInline: space.xs,
		paddingBottom: `calc(${space.xs} + env(safe-area-inset-bottom))`,
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: -2,
		// 拖曳中 Base UI 直接寫 inline transform;放手後回到這裡,照拖的距離滑回去或滑出去
		transform: { default: "translateY(var(--drawer-swipe-movement-y, 0px))", [OFFSTAGE]: "translateY(100%)" },
		transitionProperty: "transform",
		transitionDuration: { default: motion.slide, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	tall: { height: "60dvh" },
	grabber: {
		flexShrink: 0,
		width: "2.25rem",
		height: space.xxs,
		marginInline: "auto",
		marginBottom: space.sm,
		borderRadius: corner.pill,
		backgroundColor: { default: color.borderStrong, [FORCED]: "CanvasText" },
	},
	title: {
		flexShrink: 0,
		margin: 0,
		paddingInline: space.xs,
		paddingBottom: space.xs,
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		lineHeight: type.tight,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// head 不捲、children 捲;Drawer.Content 讓滑鼠在這裡選字而不是拖
	content: { display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 },
	body: { flexGrow: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" },
})

export type SheetProps = {
	/** Controlled open state. */
	open?: boolean
	/** Initial open state when uncontrolled. */
	defaultOpen?: boolean
	/** Called when the sheet opens or closes, from the trigger, Escape, the backdrop or a swipe down. */
	onOpenChange?: (open: boolean) => void
	/** `SheetTrigger` and `SheetContent`. */
	children: ReactNode
}

/** A modal sheet that slides up from the bottom: focus moves in and is trapped, Escape, the backdrop and a swipe down close it. */
export function Sheet({ children, ...props }: SheetProps) {
	return (
		<Drawer.Root swipeDirection="down" {...props}>
			{children}
		</Drawer.Root>
	)
}

export type SheetTriggerProps = {
	/** The element that opens the sheet, usually a `Button` or `IconButton`. Focus returns to it on close. */
	children: ReactElement
}

/** Makes its child open the surrounding `Sheet`. */
export function SheetTrigger({ children }: SheetTriggerProps) {
	return <Drawer.Trigger render={children} />
}

export type SheetContentProps = {
	/** The heading under the grab bar; it names the sheet. One line, cut off with an ellipsis. */
	title: ReactNode
	/** `auto` fits the content, up to 85% of the window; `tall` is always 60% of the window. @default "auto" */
	height?: "auto" | "tall"
	/** Content under the title that does not scroll (a back button, a filter). */
	head?: ReactNode
	/** The part that scrolls. */
	children?: ReactNode
}

/** The sheet panel, its backdrop and its portal. Put it inside `Sheet`. */
export function SheetContent({ title, height = "auto", head, children }: SheetContentProps) {
	return (
		<Drawer.Portal>
			<Drawer.Backdrop {...stylex.props(layerStyles.dialogBackdrop, styles.backdrop)} />
			<Drawer.Viewport {...stylex.props(layerStyles.dialog, styles.viewport)}>
				<Drawer.Popup
					ref={returnFocusOnExit}
					{...stylex.props(styles.popup, height === "tall" && styles.tall)}
				>
					<div aria-hidden="true" {...stylex.props(styles.grabber)} />
					<Drawer.Title {...stylex.props(styles.title)}>{title}</Drawer.Title>
					<Drawer.Content {...stylex.props(styles.content)}>
						{head}
						<div {...stylex.props(styles.body)}>{children}</div>
					</Drawer.Content>
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	)
}
