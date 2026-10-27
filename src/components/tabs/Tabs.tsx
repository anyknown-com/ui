import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"
import { styled } from "../../lib/styled"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	root: { display: "grid", gap: space.md },
	list: {
		display: "flex",
		gap: 2,
		position: "relative",
		width: "fit-content",
		maxWidth: "100%",
	},
	tab: {
		backgroundColor: "transparent",
		borderWidth: 0,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 400,
		lineHeight: type.snug,
		color: { default: color.textMuted, ":hover": color.text },
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		borderRadius: corner.shape,
		cursor: "pointer",
		transitionProperty: "color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
		zIndex: 1, // literal-ok: local stacking, the tab words over the sliding wash
	},
	tabDisabled: {
		opacity: 0.4,
		cursor: "not-allowed",
		color: { default: color.textMuted, [FORCED]: "GrayText" },
		forcedColorAdjust: "none",
	},
	// forced-colors:選中的那格疊在 Highlight 上,字要 HighlightText
	tabSelected: {
		color: { default: color.text, [FORCED]: "HighlightText" },
		fontWeight: 600,
		forcedColorAdjust: "none",
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
	},
	// Base UI 把 --active-tab-* 寫成 inline style;wash 的膠囊滑到選中的那格後面。
	// --active-tab-left 是從清單「左緣」量的物理距離(RTL 也是),所以錨在 left: 0
	indicator: {
		position: "absolute",
		insetBlockStart: 0,
		left: 0,
		width: "var(--active-tab-width)",
		height: "var(--active-tab-height)",
		translate: "var(--active-tab-left) var(--active-tab-top)",
		borderRadius: corner.shape,
		// forced-colors 會洗掉底色:改成 Highlight
		backgroundColor: { default: color.wash, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		pointerEvents: "none",
		transitionProperty: "translate, width",
		transitionDuration: { default: motion.slide, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	panel: {
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.textMuted,
		paddingBlock: space.xxs,
		borderRadius: corner.check,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
})

export type TabsProps = {
	/** The open tab's value, for controlled tabs. Pair it with `onValueChange`. */
	value?: string
	/** The tab open at first, for uncontrolled tabs. */
	defaultValue?: string
	/** The value of the tab the person opens. */
	onValueChange?: (value: string) => void
	/** A class name added to the root element. */
	className?: string
	/** A `TabsList` and its `TabsPanel`s. */
	children: ReactNode
}

/**
 * A set of panels where one shows at a time, switched by a row of tabs. ArrowLeft / ArrowRight
 * move between tabs; under `<DirectionProvider direction="rtl">` they swap, so ArrowLeft is next.
 */
export function Tabs({ children, ...props }: TabsProps) {
	return (
		<BaseTabs.Root {...props} {...styled(props, styles.root)}>
			{children}
		</BaseTabs.Root>
	)
}

export type TabsListProps = {
	/** The tab row's accessible name: what the tabs switch between. */
	"aria-label": string
	/** A class name added to the list element. */
	className?: string
	/** The `TabsTab`s. */
	children: ReactNode
}

/** The row of tabs inside `Tabs`; it draws the sliding indicator. */
export function TabsList({ children, ...rest }: TabsListProps) {
	return (
		<BaseTabs.List {...rest} {...styled(rest, styles.list)}>
			{children}
			<BaseTabs.Indicator {...stylex.props(styles.indicator)} />
		</BaseTabs.List>
	)
}

export type TabsTabProps = {
	/** The value that opens the `TabsPanel` with the same `value`. */
	value: string
	/** The tab cannot be opened and is drawn faded. */
	disabled?: boolean
	/** The tab's label. */
	children: ReactNode
}

/** One tab in a `TabsList`. */
export function TabsTab({ children, ...rest }: TabsTabProps) {
	return (
		<BaseTabs.Tab
			{...rest}
			className={(state) =>
				stylex.props(styles.tab, state.disabled && styles.tabDisabled, state.active && styles.tabSelected)
					.className ?? ""
			}
		>
			{children}
		</BaseTabs.Tab>
	)
}

export type TabsPanelProps = {
	/** The value of the tab that shows this panel. */
	value: string
	/** The panel's content. */
	children: ReactNode
	/** A class name added to the panel element. */
	className?: string
}

/** The content shown while the tab with the same `value` is open. */
export function TabsPanel({ children, ...rest }: TabsPanelProps) {
	return (
		<BaseTabs.Panel {...rest} {...styled(rest, styles.panel)}>
			{children}
		</BaseTabs.Panel>
	)
}
