import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"
import { type ReactElement, type ReactNode, useRef } from "react"
import { color, font, radius, shadow, space, text } from "../../tokens.stylex"
import { Button } from "../button/Button"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const grow = stylex.keyframes({
	from: { opacity: 0, scale: 0.96 },
	to: { opacity: 1, scale: 1 },
})

const styles = stylex.create({
	backdrop: {
		position: "fixed",
		inset: 0,
		zIndex: 70,
		backgroundColor: "rgba(24, 22, 19, 0.35)",
		backdropFilter: "blur(2px)",
	},
	viewport: {
		position: "fixed",
		inset: 0,
		zIndex: 71,
		display: "grid",
		placeItems: "center",
		padding: space.md,
	},
	popup: {
		backgroundColor: color.surface,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		boxShadow: shadow.popover,
		padding: space.lg,
		width: "min(24rem, calc(100vw - 2rem))",
		maxHeight: "calc(100vh - 2rem)",
		overflowY: "auto",
		fontFamily: font.body,
		animationName: { default: grow, [REDUCED]: "none" },
		animationDuration: "160ms",
		animationTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	title: {
		fontFamily: font.display,
		fontSize: text.lg,
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		margin: 0,
		marginBottom: space.xxs,
	},
	description: { fontSize: text.sm, color: color.textMuted, margin: 0, marginBottom: space.md },
	actions: { display: "flex", justifyContent: "flex-end", gap: space.xs, marginTop: space.md },
})

export type DialogProps = {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	children: ReactNode
}

export function Dialog({ children, ...props }: DialogProps) {
	return <BaseDialog.Root {...props}>{children}</BaseDialog.Root>
}

export function DialogTrigger({ children }: { children: ReactElement }) {
	return <BaseDialog.Trigger render={children} />
}

export function DialogClose({ children }: { children: ReactElement }) {
	return <BaseDialog.Close render={children} />
}

export function DialogActions({ children }: { children: ReactNode }) {
	return <div {...stylex.props(styles.actions)}>{children}</div>
}

export type DialogContentProps = {
	title: ReactNode
	description?: ReactNode
	children?: ReactNode
}

export function DialogContent({ title, description, children }: DialogContentProps) {
	return (
		<BaseDialog.Portal>
			<BaseDialog.Backdrop {...stylex.props(styles.backdrop)} />
			<BaseDialog.Viewport {...stylex.props(styles.viewport)}>
				<BaseDialog.Popup {...stylex.props(styles.popup)}>
					<BaseDialog.Title {...stylex.props(styles.title)}>{title}</BaseDialog.Title>
					{description != null && (
						<BaseDialog.Description {...stylex.props(styles.description)}>
							{description}
						</BaseDialog.Description>
					)}
					{children}
				</BaseDialog.Popup>
			</BaseDialog.Viewport>
		</BaseDialog.Portal>
	)
}

export type ConfirmDialogProps = {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	trigger?: ReactElement
	title: ReactNode
	description?: ReactNode
	danger?: boolean
	confirmLabel?: string
	cancelLabel?: string
	onConfirm: () => void
}

export function ConfirmDialog({
	trigger,
	title,
	description,
	danger = false,
	confirmLabel = "確認",
	cancelLabel = "取消",
	onConfirm,
	...props
}: ConfirmDialogProps) {
	const cancelRef = useRef<HTMLButtonElement>(null)
	return (
		<AlertDialog.Root {...props}>
			{trigger != null && <AlertDialog.Trigger render={trigger} />}
			<AlertDialog.Portal>
				<AlertDialog.Backdrop {...stylex.props(styles.backdrop)} />
				<AlertDialog.Viewport {...stylex.props(styles.viewport)}>
					<AlertDialog.Popup initialFocus={danger ? cancelRef : undefined} {...stylex.props(styles.popup)}>
						<AlertDialog.Title {...stylex.props(styles.title)}>{title}</AlertDialog.Title>
						{description != null && (
							<AlertDialog.Description {...stylex.props(styles.description)}>
								{description}
							</AlertDialog.Description>
						)}
						<div {...stylex.props(styles.actions)}>
							<AlertDialog.Close render={<Button ref={cancelRef} variant="ghost" />}>
								{cancelLabel}
							</AlertDialog.Close>
							<AlertDialog.Close
								render={<Button variant={danger ? "danger" : "primary"} />}
								onClick={onConfirm}
							>
								{confirmLabel}
							</AlertDialog.Close>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Viewport>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
