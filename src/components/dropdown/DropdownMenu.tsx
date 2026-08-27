import { Menu } from "@base-ui/react/menu"
import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"
import { popupStyles } from "../../lib/popup"
import { color, font, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	popup: { minWidth: "14rem", padding: space.xxs, margin: 0 },
	subPopup: { animationDuration: { default: "120ms", [REDUCED]: "0s" } },
	item: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		gap: "0.55rem",
		borderRadius: radius.sm,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		cursor: "pointer",
		outline: "none",
		userSelect: "none",
	},
	highlighted: {
		backgroundColor: color.accentSubtle,
		outline: `2px solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: "2px solid Highlight" },
	},
	disabled: { opacity: 0.5, cursor: "not-allowed" },
	danger: { color: color.danger },
	icon: { color: color.textMuted, flex: "none", display: "flex" },
	shortcut: {
		marginInlineStart: "auto",
		fontFamily: font.mono,
		fontSize: "0.68rem",
		lineHeight: 1,
		color: color.textFaint,
	},
	arrow: { marginInlineStart: "auto", color: color.textFaint, display: "flex" },
	tick: { width: "0.9rem", flex: "none", color: color.accent, display: "flex", justifyContent: "center" },
	groupLabel: {
		fontFamily: font.mono,
		fontSize: "0.65rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
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
	icon?: ReactNode
	shortcut?: string
	variant?: "danger"
	disabled?: boolean
	closeOnClick?: boolean
	onSelect?: () => void
	children: ReactNode
}

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
	checked?: boolean
	defaultChecked?: boolean
	onCheckedChange?: (checked: boolean) => void
	disabled?: boolean
	closeOnClick?: boolean
	children: ReactNode
}

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

export type DropdownGroupProps = { label?: string; children: ReactNode }

export function DropdownGroup({ label, children }: DropdownGroupProps) {
	return (
		<Menu.Group>
			{label != null && <Menu.GroupLabel {...stylex.props(styles.groupLabel)}>{label}</Menu.GroupLabel>}
			{children}
		</Menu.Group>
	)
}

export function DropdownSeparator() {
	return <Menu.Separator {...stylex.props(styles.separator)} />
}

export type DropdownSubProps = {
	label: ReactNode
	icon?: ReactNode
	disabled?: boolean
	children: ReactNode
}

export function DropdownSub({ label, icon, disabled, children }: DropdownSubProps) {
	return (
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger disabled={disabled} className={itemClassName()}>
				{icon != null && (
					<span aria-hidden="true" {...stylex.props(styles.icon)}>
						{icon}
					</span>
				)}
				{label}
				<span {...stylex.props(styles.arrow)}>
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
	trigger: ReactNode
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	side?: "top" | "bottom" | "left" | "right"
	align?: "start" | "center" | "end"
	children: ReactNode
}

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
					<Menu.Popup {...stylex.props(popupStyles.surface, styles.popup)}>{children}</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	)
}
