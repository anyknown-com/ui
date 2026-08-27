import { Popover as BasePopover } from "@base-ui/react/popover"
import * as stylex from "@stylexjs/stylex"
import type { ReactElement, ReactNode } from "react"
import { popupStyles } from "../../lib/popup"
import { color, font, space, text } from "../../tokens.stylex"

const styles = stylex.create({
	panel: {
		minWidth: "11rem",
		padding: space.sm,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
	},
	title: {
		fontFamily: font.display,
		fontSize: text.base,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		margin: 0,
		marginBottom: space.xxs,
	},
	description: { color: color.textMuted, margin: 0 },
})

export type PopoverProps = {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	modal?: boolean
	children: ReactNode
}

export function Popover({ children, ...props }: PopoverProps) {
	return <BasePopover.Root {...props}>{children}</BasePopover.Root>
}

export function PopoverTrigger({ children }: { children: ReactElement }) {
	return <BasePopover.Trigger render={children} />
}

export const PopoverTitle = ({ children }: { children: ReactNode }) => (
	<BasePopover.Title {...stylex.props(styles.title)}>{children}</BasePopover.Title>
)

export const PopoverDescription = ({ children }: { children: ReactNode }) => (
	<BasePopover.Description {...stylex.props(styles.description)}>{children}</BasePopover.Description>
)

export const PopoverClose = ({ children }: { children: ReactElement }) => (
	<BasePopover.Close render={children} />
)

export type PopoverContentProps = {
	side?: "top" | "bottom" | "left" | "right"
	align?: "start" | "center" | "end"
	sideOffset?: number
	"aria-label"?: string
	children: ReactNode
}

export function PopoverContent({
	side = "bottom",
	align = "center",
	sideOffset = 8,
	children,
	...rest
}: PopoverContentProps) {
	return (
		<BasePopover.Portal>
			<BasePopover.Positioner
				side={side}
				align={align}
				sideOffset={sideOffset}
				{...stylex.props(popupStyles.positioner)}
			>
				<BasePopover.Popup {...rest} {...stylex.props(popupStyles.surface, styles.panel)}>
					{children}
				</BasePopover.Popup>
			</BasePopover.Positioner>
		</BasePopover.Portal>
	)
}
