import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import { type ReactElement, type ReactNode, useId, useState } from "react"
import { usePrefersReducedMotion } from "../../lib/motion"
import { layerStyles } from "../../lib/popup"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"
import { KbdToneContext } from "../kbd/Kbd"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const fade = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })

const styles = stylex.create({
	bubble: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xs,
		maxWidth: "18rem",
		backgroundColor: color.text,
		color: color.bg,
		borderRadius: radius.sm,
		paddingBlock: "0.32rem",
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: "0.75rem",
		lineHeight: text.leadingSnug,
		animationName: { default: fade, [REDUCED]: "none" },
		animationDuration: motion.fast,
		animationTimingFunction: motion.ease,
	},
})

export const TooltipProvider = BaseTooltip.Provider

export type TooltipProps = {
	content: ReactNode
	shortcut?: ReactNode
	side?: "top" | "bottom" | "left" | "right"
	align?: "start" | "center" | "end"
	delay?: number
	disabled?: boolean
	children: ReactElement
}

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
						<KbdToneContext value="inverted">
							{content}
							{shortcut}
						</KbdToneContext>
					</BaseTooltip.Popup>
				</BaseTooltip.Positioner>
			</BaseTooltip.Portal>
		</BaseTooltip.Root>
	)
}
