import { Popover as BasePopover } from "@base-ui/react/popover"
import * as stylex from "@stylexjs/stylex"
import type { ReactElement, ReactNode } from "react"
import { popupStyles, returnFocusOnExit } from "../../lib/popup"
import { styled } from "../../lib/styled"
import { color, font, space, type } from "../../tokens.stylex"

const styles = stylex.create({
	panel: {
		minWidth: "11rem",
		// 窄螢幕上長的說明要折行,不能把浮層推出視窗
		maxWidth: "min(22rem, calc(100vw - 2rem))",
		boxSizing: "border-box",
		padding: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.text,
	},
	title: {
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		lineHeight: type.snug,
		margin: 0,
		marginBottom: space.xxs,
	},
	description: { color: color.textMuted, margin: 0 },
})

export type PopoverProps = {
	/** Controlled open state. */
	open?: boolean
	/** Initial open state when uncontrolled. */
	defaultOpen?: boolean
	/** Called when the popover opens or closes (trigger, Escape, outside click, `PopoverClose`). */
	onOpenChange?: (open: boolean) => void
	/** Trap focus and make the page behind inert while open. @default false */
	modal?: boolean
	/** `PopoverTrigger` and `PopoverContent`. */
	children: ReactNode
}

/** A non-modal panel anchored to its trigger. Escape or an outside click closes it; focus returns to the trigger. */
export function Popover({ children, ...props }: PopoverProps) {
	return <BasePopover.Root {...props}>{children}</BasePopover.Root>
}

export type PopoverTriggerProps = {
	/** The element that toggles the popover, usually a `Button`. */
	children: ReactElement
}

/** Makes its child toggle the surrounding `Popover`; it gets `aria-expanded`. */
export function PopoverTrigger({ children }: PopoverTriggerProps) {
	return <BasePopover.Trigger render={children} />
}

export type PopoverTitleProps = {
	/** The heading text. */
	children: ReactNode
}

/** The popover's heading; it names the panel (pass `titled` to `PopoverContent`). */
export const PopoverTitle = ({ children }: PopoverTitleProps) => (
	<BasePopover.Title {...stylex.props(styles.title)}>{children}</BasePopover.Title>
)

export type PopoverDescriptionProps = {
	/** The description text. */
	children: ReactNode
}

/** A muted paragraph that describes the panel. */
export const PopoverDescription = ({ children }: PopoverDescriptionProps) => (
	<BasePopover.Description {...stylex.props(styles.description)}>{children}</BasePopover.Description>
)

export type PopoverCloseProps = {
	/** The element that closes the popover, usually a `Button`. */
	children: ReactElement
}

/** Makes its child close the surrounding `Popover`. */
export const PopoverClose = ({ children }: PopoverCloseProps) => <BasePopover.Close render={children} />

type PopoverContentBase = {
	/** The side of the trigger it opens on (flips when there is no room). @default "bottom" */
	side?: "top" | "bottom" | "left" | "right"
	/** Alignment along that side. @default "center" */
	align?: "start" | "center" | "end"
	/** Gap to the trigger in px. @default 8 */
	sideOffset?: number
	/** Extra class names for the panel. */
	className?: string
	/** The panel's content. */
	children: ReactNode
}

/** role="dialog" needs a name: pass `aria-label`, or render a `PopoverTitle` inside and pass `titled`. */
export type PopoverContentProps = PopoverContentBase &
	({ "aria-label": string; titled?: never } | { "aria-label"?: never; titled: true })

/** The floating panel, portalled to `<body>` and positioned against the trigger. */
export function PopoverContent({
	side = "bottom",
	align = "center",
	sideOffset = 8,
	children,
	...props
}: PopoverContentProps) {
	const { titled: _titled, ...rest } = props as PopoverContentBase & { titled?: true }
	return (
		<BasePopover.Portal>
			<BasePopover.Positioner
				side={side}
				align={align}
				sideOffset={sideOffset}
				{...stylex.props(popupStyles.positioner)}
			>
				<BasePopover.Popup
					ref={returnFocusOnExit}
					{...rest}
					{...styled(rest, popupStyles.surface, styles.panel)}
				>
					{children}
				</BasePopover.Popup>
			</BasePopover.Positioner>
		</BasePopover.Portal>
	)
}
