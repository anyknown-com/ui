import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import { type ReactNode, createContext, useContext } from "react"
import { styled } from "../../lib/styled"
import { color, font, ink, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

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
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.md,
		padding: space.xxs,
		gap: "0.15rem",
	},
	tab: {
		backgroundColor: { default: "transparent", ":hover": ink.n6 },
		borderWidth: 0,
		fontFamily: font.body,
		fontSize: text.sm,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		color: { default: color.textMuted, ":hover": color.text },
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: radius.sm,
		cursor: "pointer",
		transitionProperty: "color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	tabDisabled: { opacity: 0.4, cursor: "not-allowed", color: color.textFaint },
	tabSelectedUnderline: { color: color.accent },
	tabSelectedPills: { color: color.text, backgroundColor: "transparent" },
	pillTab: { zIndex: 1 },
	indicator: {
		position: "absolute",
		bottom: -1,
		insetInlineStart: 0,
		height: 2,
		width: "var(--active-tab-width)",
		translate: "var(--active-tab-left)",
		backgroundColor: color.accent,
		transitionProperty: "translate, width",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	// Indicator 本來就把 --active-tab-* 寫成 inline style,pills 直接拿它當滑動的藥丸。
	pillIndicator: {
		position: "absolute",
		insetBlockStart: 0,
		insetInlineStart: 0,
		width: "var(--active-tab-width)",
		height: "var(--active-tab-height)",
		translate: "var(--active-tab-left) var(--active-tab-top)",
		borderRadius: radius.sm,
		backgroundColor: color.surfaceRaised,
		boxShadow: `inset 0 0 0 1px ${color.border}`,
		pointerEvents: "none",
		transitionProperty: "translate, width",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	panel: {
		fontFamily: font.body,
		fontSize: text.sm,
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
