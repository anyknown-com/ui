import * as stylex from "@stylexjs/stylex"
import type { ComponentProps, ReactNode } from "react"
import { styled } from "../../lib/styled"
import { useCopy } from "../../lib/useCopy"
import { color, motion, radius, space, text } from "../../tokens.stylex"
import { useMessageBody } from "../message/Message"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	bar: {
		position: "absolute",
		insetInlineStart: 0,
		bottom: 0,
		height: space.xl,
		display: "flex",
		alignItems: "center",
		gap: "0.15rem",
		opacity: { default: "var(--ak-action-bar-opacity, 0)", ":focus-within": 1 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
	},
	button: {
		all: "unset",
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontSize: text.xs,
		lineHeight: text.leadingSnug,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: {
			default: "transparent",
			":hover": `color-mix(in srgb, ${color.border} 40%, ${color.surface})`,
		},
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		borderRadius: radius.sm,
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	done: { color: color.accent },
	icon: { flex: "none" },
})

const hoverStyles = stylex.create({
	reveal: { opacity: 1 },
})

function CopyIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.icon)}
		>
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</svg>
	)
}

function RegenerateIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.icon)}
		>
			<path d="M3 12a9 9 0 1 1 2.6 6.3" />
			<path d="M3 22v-6h6" />
		</svg>
	)
}

export type ActionBarProps = {
	label?: string
	visible?: boolean
	children: ReactNode
}

export function ActionBar({ label = "訊息動作", visible = false, children }: ActionBarProps) {
	return (
		<div role="toolbar" aria-label={label} {...stylex.props(styles.bar, visible && hoverStyles.reveal)}>
			{children}
		</div>
	)
}

export type ActionBarButtonProps = ComponentProps<"button"> & { icon?: ReactNode }

function ActionBarButton({ icon, children, ...props }: ActionBarButtonProps) {
	return (
		<button type="button" {...props} {...styled(props, styles.button)}>
			{icon}
			{children}
		</button>
	)
}

export type CopyActionProps = {
	text?: string
	label?: string
	copiedLabel?: string
}

function CopyAction({ text: value, label = "複製", copiedLabel = "已複製 ✓" }: CopyActionProps) {
	const body = useMessageBody()
	const { copied, copy } = useCopy()

	// The turn also holds a hidden author label, the reasoning fold and this bar
	// itself, so copy only the text parts.
	function messageText() {
		const parts = body?.current?.querySelectorAll("[data-ak-message-text]") ?? []
		return Array.from(parts, (part) => part.textContent ?? "").join("\n\n")
	}

	return (
		<button
			type="button"
			onClick={() => copy(value ?? messageText())}
			{...stylex.props(styles.button, copied && styles.done)}
		>
			{!copied && <CopyIcon />}
			{copied ? copiedLabel : label}
		</button>
	)
}

export type RegenerateActionProps = { onRegenerate: () => void; label?: string }

function RegenerateAction({ onRegenerate, label = "重新生成" }: RegenerateActionProps) {
	return (
		<ActionBarButton icon={<RegenerateIcon />} onClick={onRegenerate}>
			{label}
		</ActionBarButton>
	)
}

ActionBar.Copy = CopyAction
ActionBar.Regenerate = RegenerateAction
ActionBar.Button = ActionBarButton
