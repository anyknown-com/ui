import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import { type ReactNode, createContext, useContext } from "react"
import { styled } from "../../lib/styled"
import { color, corner, focusRing, font, ink, motion, radius, shadow, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const FORCED = "@media (forced-colors: active)"

const VariantContext = createContext<"underline" | "pills">("underline")

const styles = stylex.create({
	root: { display: "grid", gap: space.xs },
	list: { display: "flex", gap: space.xxs, position: "relative" },
	underlineList: {
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
	},
	pillsList: {
		// 只包住自己的 pills:整條拉滿時,4px 的內距在一大片空白旁邊會看起來像沒有間距
		width: "fit-content",
		maxWidth: "100%",
		// 凹下去的 surface 軌道,不加框;選中的那格是浮在上面的一張紙
		backgroundColor: color.surface,
		borderRadius: corner.control,
		padding: space.xxs,
		gap: "0.15rem",
	},
	tab: {
		backgroundColor: { default: "transparent", ":hover": ink.n6 },
		borderWidth: 0,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: type.snug,
		color: { default: color.textMuted, ":hover": color.text },
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: radius.md,
		cursor: "pointer",
		transitionProperty: "color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	tabDisabled: {
		opacity: 0.4,
		cursor: "not-allowed",
		color: { default: color.textFaint, [FORCED]: "GrayText" },
		forcedColorAdjust: "none",
	},
	tabSelectedUnderline: { color: color.accent },
	// forced-colors:選中的那格疊在 Highlight 的藥丸上,字要 HighlightText
	tabSelectedPills: {
		color: { default: color.text, [FORCED]: "HighlightText" },
		backgroundColor: "transparent",
		forcedColorAdjust: "none",
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
	},
	pillTab: { zIndex: 1 },
	// Base UI 給的 --active-tab-left 是從清單「左緣」量的物理距離(RTL 也是),所以這裡錨在
	// left: 0 而不是 insetInlineStart —— 後者在 RTL 會從右緣起算,指示條往反方向跑
	indicator: {
		position: "absolute",
		bottom: -1,
		left: 0,
		height: 2,
		width: "var(--active-tab-width)",
		translate: "var(--active-tab-left)",
		// forced-colors 會把底色洗成 Canvas,底線就不見了
		backgroundColor: { default: color.accent, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		transitionProperty: "translate, width",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	// Indicator 本來就把 --active-tab-* 寫成 inline style,pills 直接拿它當滑動的藥丸。
	pillIndicator: {
		position: "absolute",
		insetBlockStart: 0,
		left: 0,
		width: "var(--active-tab-width)",
		height: "var(--active-tab-height)",
		translate: "var(--active-tab-left) var(--active-tab-top)",
		// 內層圓角 = 軌道 12 − 內距 4
		borderRadius: radius.md,
		// forced-colors 會拿掉陰影、洗掉底色:藥丸改成 Highlight
		backgroundColor: { default: color.surfaceRaised, [FORCED]: "Highlight" },
		forcedColorAdjust: "none",
		// 白紙對 surface 軌道只有 1.09:1;外圈一條 borderControl 環讓選中的那格有 3:1 的邊
		boxShadow: `0 0 0 1px ${color.borderControl}, ${shadow.rest}`,
		pointerEvents: "none",
		transitionProperty: "translate, width",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	panel: {
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.textMuted,
		paddingBlock: space.xxs,
		borderRadius: radius.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
})

export type TabsProps = {
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	variant?: "underline" | "pills"
	className?: string
	children: ReactNode
}

export function Tabs({ variant = "underline", children, ...props }: TabsProps) {
	return (
		<VariantContext value={variant}>
			<BaseTabs.Root {...props} {...styled(props, styles.root)}>
				{children}
			</BaseTabs.Root>
		</VariantContext>
	)
}

export type TabsListProps = { "aria-label": string; className?: string; children: ReactNode }

export function TabsList({ children, ...rest }: TabsListProps) {
	const variant = useContext(VariantContext)

	return (
		<BaseTabs.List
			{...rest}
			{...styled(rest, styles.list, variant === "underline" ? styles.underlineList : styles.pillsList)}
		>
			{children}
			<BaseTabs.Indicator
				{...stylex.props(variant === "underline" ? styles.indicator : styles.pillIndicator)}
			/>
		</BaseTabs.List>
	)
}

export type TabsTabProps = { value: string; disabled?: boolean; children: ReactNode }

export function TabsTab({ children, ...rest }: TabsTabProps) {
	const variant = useContext(VariantContext)
	return (
		<BaseTabs.Tab
			{...rest}
			className={(state) =>
				stylex.props(
					styles.tab,
					variant === "pills" && styles.pillTab,
					state.disabled && styles.tabDisabled,
					state.active && (variant === "underline" ? styles.tabSelectedUnderline : styles.tabSelectedPills),
				).className ?? ""
			}
		>
			{children}
		</BaseTabs.Tab>
	)
}

export type TabsPanelProps = { value: string; children: ReactNode; className?: string }

export function TabsPanel({ children, ...rest }: TabsPanelProps) {
	return (
		<BaseTabs.Panel {...rest} {...styled(rest, styles.panel)}>
			{children}
		</BaseTabs.Panel>
	)
}
