import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import { type ReactNode, createContext, useContext } from "react"
import { styled } from "../../lib/styled"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

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
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.md,
		padding: space.xxs,
		gap: "0.15rem",
	},
	tab: {
		backgroundColor: "transparent",
		borderWidth: 0,
		fontFamily: font.body,
		fontSize: text.sm,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		color: { default: color.textMuted, ":hover": color.text },
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: radius.sm,
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		opacity: { default: 1, ":disabled": 0.4 },
		transitionProperty: "color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	tabSelectedUnderline: { color: color.accent },
	tabSelectedPills: { backgroundColor: color.accentSubtle, color: color.accent },
	indicator: {
		position: "absolute",
		bottom: -1,
		insetInlineStart: 0,
		height: 2,
		width: "var(--active-tab-width)",
		translate: "var(--active-tab-left)",
		backgroundColor: color.accent,
		transitionProperty: "translate, width",
		transitionDuration: { default: "260ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.3, 1.35, 0.45, 1)",
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
	children: ReactNode
}

export function Tabs({ variant = "underline", children, ...props }: TabsProps) {
	return (
		<VariantContext value={variant}>
			<BaseTabs.Root {...props} {...stylex.props(styles.root)}>
				{children}
			</BaseTabs.Root>
		</VariantContext>
	)
}

export type TabsListProps = { "aria-label": string; children: ReactNode }

export function TabsList({ children, ...rest }: TabsListProps) {
	const variant = useContext(VariantContext)
	return (
		<BaseTabs.List
			{...rest}
			{...stylex.props(styles.list, variant === "underline" ? styles.underlineList : styles.pillsList)}
		>
			{children}
			{variant === "underline" && <BaseTabs.Indicator {...stylex.props(styles.indicator)} />}
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
					state.active &&
						(variant === "underline" ? styles.tabSelectedUnderline : styles.tabSelectedPills),
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
