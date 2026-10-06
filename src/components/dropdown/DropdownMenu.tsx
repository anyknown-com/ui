import { useDirection } from "@base-ui/react/direction-provider"
import { Menu } from "@base-ui/react/menu"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"
import { popupStyles, returnFocusOnExit } from "../../lib/popup"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	popup: { minWidth: "14rem", padding: space.xxs, margin: 0 },
	subPopup: { animationDuration: { default: motion.fast, [REDUCED]: "0s" } },
	item: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		gap: "0.55rem",
		// 內角 = popup 的 16 − 4 padding
		borderRadius: corner.control,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.text,
		cursor: "pointer",
		outline: "none",
		userSelect: "none",
	},
	highlighted: {
		backgroundColor: color.accentSubtle,
		outline: `${focusRing.width} solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: `${focusRing.width} solid Highlight` },
	},
	disabled: { opacity: 0.5, cursor: "not-allowed" },
	danger: { color: color.danger },
	icon: { color: color.textMuted, flex: "none", display: "flex" },
	shortcut: {
		marginInlineStart: "auto",
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: 1,
		color: color.textMuted,
	},
	arrow: { marginInlineStart: "auto", color: color.textFaint, display: "flex" },
	// The submenu opens on the inline end, which is the left under RTL: the chevron points there.
	arrowRtl: { transform: "scaleX(-1)" },
	tick: { width: "0.9rem", flex: "none", color: color.accent, display: "flex", justifyContent: "center" },
	groupLabel: {
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: type.snug,
		color: color.textMuted,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	separator: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		marginBlock: space.xxs,
		marginInline: space.xxs,
	},
})

function ChevronRight() {
	return (
		<svg
			width="11"
			height="11"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="m9 6 6 6-6 6" />
		</svg>
	)
}

function Tick() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="m2.5 8.5 4 4 7-9" />
		</svg>
	)
}

const itemClassName = (variant?: "danger") => (state: { highlighted: boolean; disabled: boolean }) =>
	stylex.props(
		styles.item,
		variant === "danger" && styles.danger,
		state.highlighted && styles.highlighted,
		state.disabled && styles.disabled,
	).className ?? ""

export type DropdownItemProps = {
	/** A leading icon; decorative (hidden from assistive tech). */
	icon?: ReactNode
	/** A shortcut shown at the end and exposed as `aria-keyshortcuts`, e.g. "⌘N". It does not bind the key. */
	shortcut?: string
	/** `danger` paints the item red, for destructive actions. */
	variant?: "danger"
	/** Focusable but not selectable (APG: disabled menu items stay discoverable). */
	disabled?: boolean
	/** Close the menu after the item is chosen. @default true */
	closeOnClick?: boolean
	/** Runs when the item is chosen by click, Enter or Space. */
	onSelect?: () => void
	/** The item's label. */
	children: ReactNode
}

/** One action in a `DropdownMenu` (`role="menuitem"`). */
export function DropdownItem({ icon, shortcut, variant, onSelect, children, ...rest }: DropdownItemProps) {
	return (
		<Menu.Item {...rest} aria-keyshortcuts={shortcut} onClick={onSelect} className={itemClassName(variant)}>
			{icon != null && (
				<span aria-hidden="true" {...stylex.props(styles.icon)}>
					{icon}
				</span>
			)}
			{children}
			{shortcut != null && (
				<span aria-hidden="true" {...stylex.props(styles.shortcut)}>
					{shortcut}
				</span>
			)}
		</Menu.Item>
	)
}

export type DropdownCheckboxItemProps = {
	/** Controlled checked state. */
	checked?: boolean
	/** Initial checked state when uncontrolled. */
	defaultChecked?: boolean
	/** Called with the new checked state. */
	onCheckedChange?: (checked: boolean) => void
	/** Focusable but not toggleable. */
	disabled?: boolean
	/** Close the menu after toggling. @default false */
	closeOnClick?: boolean
	/** The item's label. */
	children: ReactNode
}

/** An on / off setting in a `DropdownMenu` (`role="menuitemcheckbox"`); the menu stays open. */
export function DropdownCheckboxItem({ children, ...rest }: DropdownCheckboxItemProps) {
	return (
		<Menu.CheckboxItem {...rest} className={itemClassName()}>
			<span {...stylex.props(styles.tick)}>
				<Menu.CheckboxItemIndicator>
					<Tick />
				</Menu.CheckboxItemIndicator>
			</span>
			{children}
		</Menu.CheckboxItem>
	)
}

export type DropdownGroupProps = {
	/** A small heading that names the group. */
	label?: string
	/** The group's items. */
	children: ReactNode
}

/** A labelled group of items (`role="group"`). */
export function DropdownGroup({ label, children }: DropdownGroupProps) {
	return (
		<Menu.Group>
			{label != null && <Menu.GroupLabel {...stylex.props(styles.groupLabel)}>{label}</Menu.GroupLabel>}
			{children}
		</Menu.Group>
	)
}

/** A line between groups of items (`role="separator"`). */
export function DropdownSeparator() {
	return <Menu.Separator {...stylex.props(styles.separator)} />
}

export type DropdownSubProps = {
	/** The submenu trigger's label. */
	label: ReactNode
	/** A leading icon on the trigger; decorative. */
	icon?: ReactNode
	/** The trigger is focusable but does not open the submenu. */
	disabled?: boolean
	/** The submenu's items. */
	children: ReactNode
}

/**
 * A nested menu: ArrowRight or hover opens it, ArrowLeft or Escape closes it. Under
 * `<DirectionProvider direction="rtl">` it opens to the left and the arrow keys swap.
 */
export function DropdownSub({ label, icon, disabled, children }: DropdownSubProps) {
	const rtl = useDirection() === "rtl"
	return (
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger disabled={disabled} className={itemClassName()}>
				{icon != null && (
					<span aria-hidden="true" {...stylex.props(styles.icon)}>
						{icon}
					</span>
				)}
				{label}
				<span {...stylex.props(styles.arrow, rtl && styles.arrowRtl)}>
					<ChevronRight />
				</span>
			</Menu.SubmenuTrigger>
			<Menu.Portal>
				<Menu.Positioner
					align="start"
					side="inline-end"
					sideOffset={2}
					alignOffset={-6}
					{...stylex.props(popupStyles.positioner)}
				>
					<Menu.Popup {...stylex.props(popupStyles.surface, styles.popup, styles.subPopup)}>
						{children}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.SubmenuRoot>
	)
}

export type DropdownMenuProps = {
	/** The menu button, usually a `Button`; it gets `aria-haspopup="menu"` and `aria-expanded`. */
	trigger: ReactNode
	/** Controlled open state. */
	open?: boolean
	/** Initial open state when uncontrolled. */
	defaultOpen?: boolean
	/** Called when the menu opens or closes. */
	onOpenChange?: (open: boolean) => void
	/** The side of the trigger it opens on (flips when there is no room). @default "bottom" */
	side?: "top" | "bottom" | "left" | "right"
	/** Alignment along that side. @default "start" */
	align?: "start" | "center" | "end"
	/** Items, groups, separators and submenus. */
	children: ReactNode
}

/**
 * A menu button (WAI-ARIA APG): Enter, Space or ArrowDown opens it; arrows, Home / End and
 * typeahead move; Escape or Tab closes it and focus returns to the trigger as the exit starts.
 */
export function DropdownMenu({
	trigger,
	open,
	defaultOpen,
	onOpenChange,
	side = "bottom",
	align = "start",
	children,
}: DropdownMenuProps) {
	return (
		<Menu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			<Menu.Trigger render={trigger as never} />
			<Menu.Portal>
				<Menu.Positioner side={side} align={align} sideOffset={6} {...stylex.props(popupStyles.positioner)}>
					<Menu.Popup ref={returnFocusOnExit} {...stylex.props(popupStyles.surface, styles.popup)}>
						{children}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	)
}
