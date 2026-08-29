import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react"
import { styled } from "../../lib/styled"
import { useSvgId } from "../../lib/svgId"
import { buildWeave, weaveRand } from "../../lib/weave"
import { color, font, motion, radius, space, text, yarnSubtle } from "../../tokens.stylex"

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
		cursor: "pointer",
		transitionProperty: "color, background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	tabDisabled: { opacity: 0.4, cursor: "not-allowed", color: color.textFaint },
	tabSelectedUnderline: { color: color.accent },
	tabSelectedPills: { color: color.accent },
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
	// pills:布織滿整條 tablist,選取的高亮是一個取景窗(clip rect)滑到選中的 tab —
	// 窗動、布不動,透出的織紋是連續的同一塊布(TEXTURE-GUIDE §3、tabs/NOTES.md)。
	// Indicator 只當 --active-tab-* 的載體,鋪滿整條 list、自己不動。
	pillLayer: { position: "absolute", inset: 0, pointerEvents: "none" },
	pillSvg: { display: "block", width: "100%", height: "100%" },
	pillWindow: {
		x: "var(--active-tab-left)",
		y: "var(--active-tab-top)",
		width: "var(--active-tab-width)",
		height: "var(--active-tab-height)",
		rx: radius.sm,
		transitionProperty: "x, width",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	cloth: { fill: "none", strokeLinecap: "round" },
	un: { stroke: yarnSubtle.un },
	sh: { stroke: yarnSubtle.sh, opacity: 0.5 },
	y0: { stroke: yarnSubtle.y0 },
	y1: { stroke: yarnSubtle.y1 },
	y2: { stroke: yarnSubtle.y2 },
	y3: { stroke: yarnSubtle.y3 },
	y4: { stroke: yarnSubtle.y4 },
	hi: { stroke: yarnSubtle.hi, opacity: 0.45 },
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

const BUCKETS = [styles.y0, styles.y1, styles.y2, styles.y3, styles.y4] as const

function PillCloth({ w, h }: { w: number; h: number }) {
	const clipId = useSvgId("ak-pill")
	const cloth = useMemo(() => buildWeave({ w, h }, weaveRand()), [w, h])
	return (
		<svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" {...stylex.props(styles.pillSvg)}>
			<defs>
				<clipPath id={clipId}>
					<rect {...stylex.props(styles.pillWindow)} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${clipId})`} {...stylex.props(styles.cloth)}>
				<g {...stylex.props(styles.un)}>
					{cloth.under.map((t, i) => (
						<path key={i} d={t.d} strokeWidth={t.sw} />
					))}
				</g>
				<g {...stylex.props(styles.sh)}>
					{cloth.seams.map((t, i) => (
						<path key={i} d={t.d} strokeWidth={t.sw} />
					))}
				</g>
				{cloth.face.map((t, i) => (
					<path key={i} d={t.d} strokeWidth={t.sw} {...stylex.props(BUCKETS[t.bucket])} />
				))}
				<g {...stylex.props(styles.hi)}>
					{cloth.hi.map((t, i) => (
						<path key={i} d={t.d} strokeWidth={t.sw} />
					))}
				</g>
			</g>
		</svg>
	)
}

export type TabsListProps = { "aria-label": string; className?: string; children: ReactNode }

export function TabsList({ children, ...rest }: TabsListProps) {
	const variant = useContext(VariantContext)
	const [size, setSize] = useState<{ w: number; h: number } | null>(null)
	// 要織滿 tablist 就得先量它:ref callback + ResizeObserver(不用 effect,SSR 上零副作用)。
	// 同尺寸 early return,resize 才重織。
	const measure = useCallback((node: HTMLElement | null) => {
		if (!node) return
		const read = () =>
			setSize((current) => {
				const w = node.clientWidth
				const h = node.clientHeight
				return current != null && current.w === w && current.h === h ? current : { w, h }
			})
		read()
		const ro = new ResizeObserver(read)
		ro.observe(node)
		return () => ro.disconnect()
	}, [])

	return (
		<BaseTabs.List
			{...rest}
			ref={variant === "pills" ? measure : undefined}
			{...styled(rest, styles.list, variant === "underline" ? styles.underlineList : styles.pillsList)}
		>
			{children}
			{variant === "underline" && <BaseTabs.Indicator {...stylex.props(styles.indicator)} />}
			{variant === "pills" && size != null && size.w > 0 && (
				<BaseTabs.Indicator {...stylex.props(styles.pillLayer)}>
					<PillCloth w={size.w} h={size.h} />
				</BaseTabs.Indicator>
			)}
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
