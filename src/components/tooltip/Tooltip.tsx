import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactElement, type ReactNode, useId, useState } from "react"
import { usePrefersReducedMotion } from "../../lib/motion"
import { layerStyles } from "../../lib/popup"
import { color, corner, font, motion, shadow, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// Windows 高對比:陰影會消失、顏色換成系統色;邊界與焦點環明確給 CanvasText / Highlight
const FORCED = "@media (forced-colors: active)"

const fade = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })

const styles = stylex.create({
	bubble: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xs,
		maxWidth: "18rem",
		// float 階,跟 popover 同一張紙;不再是反色氣泡。透明的框只為了 forced-colors
		backgroundColor: color.surfaceRaised,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: "transparent", [FORCED]: "CanvasText" },
		borderRadius: corner.control,
		boxShadow: shadow.float,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		animationName: { default: fade, [REDUCED]: "none" },
		animationDuration: motion.fast,
		animationTimingFunction: motion.ease,
	},
})

export type TooltipProviderProps = ComponentProps<typeof BaseTooltip.Provider>

/** Shares the open delay across the tooltips below it, so moving between triggers opens the next at once. */
export const TooltipProvider = BaseTooltip.Provider

export type TooltipProps = {
	/** The text; it becomes the trigger's accessible description while shown. Keep it short. */
	content: ReactNode
	/** A keyboard shortcut shown after the text, e.g. `<KbdGroup keys={["⌘", "K"]} />`. */
	shortcut?: ReactNode
	/** The side of the trigger it shows on (flips when there is no room). @default "top" */
	side?: "top" | "bottom" | "left" | "right"
	/** Alignment along that side. @default "center" */
	align?: "start" | "center" | "end"
	/** Milliseconds of hover before it shows; 0 under reduced motion. @default 400 */
	delay?: number
	/** Render the trigger alone, with no tooltip. @default false */
	disabled?: boolean
	/** The trigger: a focusable element, usually a `Button`. */
	children: ReactElement
}

/**
 * A short hint on hover or keyboard focus. Escape or moving away hides it. It describes the
 * trigger (`aria-describedby`); never put the only name of an icon button here.
 */
export function Tooltip({
	content,
	shortcut,
	side = "top",
	align = "center",
	delay = 400,
	disabled = false,
	children,
}: TooltipProps) {
	const id = useId()
	const reduced = usePrefersReducedMotion()
	const [open, setOpen] = useState(false)

	if (disabled) return children
	return (
		<BaseTooltip.Root open={open} onOpenChange={setOpen}>
			<BaseTooltip.Trigger
				delay={reduced ? 0 : delay}
				aria-describedby={open ? id : undefined}
				render={children}
			/>
			<BaseTooltip.Portal>
				<BaseTooltip.Positioner
					side={side}
					align={align}
					sideOffset={6}
					{...stylex.props(layerStyles.tooltip)}
				>
					<BaseTooltip.Popup id={id} role="tooltip" {...stylex.props(styles.bubble)}>
						{content}
						{shortcut}
					</BaseTooltip.Popup>
				</BaseTooltip.Positioner>
			</BaseTooltip.Portal>
		</BaseTooltip.Root>
	)
}
